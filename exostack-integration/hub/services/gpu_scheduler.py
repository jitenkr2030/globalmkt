"""
GPU-Aware Task Scheduler for ExoStack Hub
Routes tasks to appropriate nodes based on GPU requirements and capabilities
"""
import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from shared.models.base import InferenceTask, AgentNode, TaskStatus, TaskRequirements
from .registry import Registry

logger = logging.getLogger(__name__)

class GPUScheduler:
    """Enhanced scheduler with GPU awareness and resource matching"""
    
    def __init__(self, registry: Registry):
        self.registry = registry
        self.task_queue: List[InferenceTask] = []
        self.running_tasks: Dict[str, InferenceTask] = {}
        self.task_assignments: Dict[str, str] = {}  # task_id -> node_id
        self._scheduler_running = False
        
    async def start(self):
        """Start the scheduler"""
        self._scheduler_running = True
        asyncio.create_task(self._scheduler_loop())
        logger.info("GPU-aware scheduler started")
    
    async def stop(self):
        """Stop the scheduler"""
        self._scheduler_running = False
        logger.info("GPU-aware scheduler stopped")
    
    async def submit_task(self, task: InferenceTask) -> bool:
        """Submit a task for scheduling"""
        try:
            # Validate task requirements against available nodes
            suitable_nodes = await self._find_suitable_nodes(task.requirements)
            
            if not suitable_nodes:
                logger.warning(f"No suitable nodes found for task {task.id}")
                task.status = TaskStatus.FAILED
                task.error = "No suitable nodes available"
                return False
            
            # Add to queue
            self.task_queue.append(task)
            logger.info(f"Task {task.id} queued (requires_gpu: {task.requirements.requires_gpu})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to submit task {task.id}: {e}")
            return False
    
    async def _scheduler_loop(self):
        """Main scheduler loop"""
        while self._scheduler_running:
            try:
                await self._process_task_queue()
                await asyncio.sleep(1)  # Check every second
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
                await asyncio.sleep(5)  # Wait longer on error
    
    async def _process_task_queue(self):
        """Process pending tasks in the queue"""
        if not self.task_queue:
            return
        
        # Sort tasks by priority and creation time
        self.task_queue.sort(key=lambda t: (t.priority.value, t.created_at))
        
        tasks_to_remove = []
        
        for task in self.task_queue:
            try:
                # Find the best node for this task
                best_node = await self._find_best_node(task)
                
                if best_node:
                    # Assign task to node
                    success = await self._assign_task_to_node(task, best_node)
                    if success:
                        tasks_to_remove.append(task)
                        logger.info(f"Assigned task {task.id} to node {best_node.id}")
                
            except Exception as e:
                logger.error(f"Failed to process task {task.id}: {e}")
        
        # Remove assigned tasks from queue
        for task in tasks_to_remove:
            self.task_queue.remove(task)
    
    async def _find_suitable_nodes(self, requirements: TaskRequirements) -> List[AgentNode]:
        """Find nodes that meet the task requirements"""
        suitable_nodes = []
        
        for node in self.registry.get_active_nodes():
            if await self._node_meets_requirements(node, requirements):
                suitable_nodes.append(node)
        
        return suitable_nodes
    
    async def _node_meets_requirements(self, node: AgentNode, requirements: TaskRequirements) -> bool:
        """Check if a node meets the task requirements"""
        try:
            # Check GPU requirement
            if requirements.requires_gpu and not node.compute_resources.has_gpu:
                return False
            
            # Check RAM requirement
            if node.compute_resources.available_ram_gb < requirements.min_ram_gb:
                return False
            
            # Check GPU memory requirement
            if requirements.min_gpu_memory_gb > 0:
                if not node.compute_resources.has_gpu:
                    return False
                
                gpu_info = node.compute_resources.gpu_info
                gpu_devices = gpu_info.get('devices', [])
                
                has_sufficient_gpu_memory = False
                for device in gpu_devices:
                    available_memory = device.get('memory_total_gb', 0) - device.get('memory_allocated_gb', 0)
                    if available_memory >= requirements.min_gpu_memory_gb:
                        has_sufficient_gpu_memory = True
                        break
                
                if not has_sufficient_gpu_memory:
                    return False
            
            # Check compute capability
            if requirements.min_compute_capability:
                if not node.compute_resources.has_gpu:
                    return False
                
                gpu_info = node.compute_resources.gpu_info
                gpu_devices = gpu_info.get('devices', [])
                
                has_sufficient_compute = False
                for device in gpu_devices:
                    device_capability = device.get('compute_capability', '0.0')
                    try:
                        if float(device_capability) >= float(requirements.min_compute_capability):
                            has_sufficient_compute = True
                            break
                    except ValueError:
                        continue
                
                if not has_sufficient_compute:
                    return False
            
            # Check if node is not overloaded
            if node.current_tasks >= node.max_concurrent_tasks:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking node requirements: {e}")
            return False
    
    async def _find_best_node(self, task: InferenceTask) -> Optional[AgentNode]:
        """Find the best node for a task based on requirements and current load"""
        suitable_nodes = await self._find_suitable_nodes(task.requirements)
        
        if not suitable_nodes:
            return None
        
        # Score nodes based on various factors
        node_scores = []
        
        for node in suitable_nodes:
            score = await self._calculate_node_score(node, task)
            node_scores.append((node, score))
        
        # Sort by score (higher is better)
        node_scores.sort(key=lambda x: x[1], reverse=True)
        
        return node_scores[0][0] if node_scores else None
    
    async def _calculate_node_score(self, node: AgentNode, task: InferenceTask) -> float:
        """Calculate a score for how well a node fits a task"""
        score = 0.0
        
        # Base score from available resources
        ram_ratio = node.compute_resources.available_ram_gb / node.compute_resources.total_ram_gb
        score += ram_ratio * 10
        
        # Bonus for GPU capability when needed
        if task.requirements.requires_gpu and node.compute_resources.has_gpu:
            score += 20
            
            # Additional bonus for more GPU memory
            gpu_info = node.compute_resources.gpu_info
            total_gpu_memory = gpu_info.get('total_memory_gb', 0)
            score += min(total_gpu_memory / 10, 10)  # Up to 10 points for GPU memory
        
        # Penalty for current load
        load_ratio = node.current_tasks / node.max_concurrent_tasks
        score -= load_ratio * 15
        
        # Bonus for supported models
        if task.model != "auto" and task.model in node.supported_models:
            score += 5
        
        # Bonus for preferred models
        for preferred_model in task.requirements.preferred_models:
            if preferred_model in node.supported_models:
                score += 3
        
        # Bonus for specific capabilities
        if task.task_type == "streaming" and node.capabilities.streaming:
            score += 5
        
        return score
    
    async def _assign_task_to_node(self, task: InferenceTask, node: AgentNode) -> bool:
        """Assign a task to a specific node"""
        try:
            # Update task status
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.now()
            task.assigned_node = node.id
            
            # Track assignment
            self.running_tasks[task.id] = task
            self.task_assignments[task.id] = node.id
            
            # Update node load
            node.current_tasks += 1
            
            # TODO: Send task to node via HTTP request
            # This would be implemented to actually send the task to the agent
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to assign task {task.id} to node {node.id}: {e}")
            return False
    
    async def complete_task(self, task_id: str, result: Optional[Dict[str, Any]] = None, 
                          error: Optional[str] = None):
        """Mark a task as completed"""
        if task_id not in self.running_tasks:
            logger.warning(f"Task {task_id} not found in running tasks")
            return
        
        task = self.running_tasks[task_id]
        node_id = self.task_assignments.get(task_id)
        
        # Update task status
        task.completed_at = datetime.now()
        if error:
            task.status = TaskStatus.FAILED
            task.error = error
        else:
            task.status = TaskStatus.COMPLETED
            task.result = result
        
        # Update node load
        if node_id:
            node = self.registry.get_node(node_id)
            if node:
                node.current_tasks = max(0, node.current_tasks - 1)
        
        # Clean up tracking
        del self.running_tasks[task_id]
        if task_id in self.task_assignments:
            del self.task_assignments[task_id]
        
        logger.info(f"Task {task_id} completed with status {task.status}")
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue and running task status"""
        return {
            "queued_tasks": len(self.task_queue),
            "running_tasks": len(self.running_tasks),
            "queue_details": [
                {
                    "id": task.id,
                    "requires_gpu": task.requirements.requires_gpu,
                    "priority": task.priority.value,
                    "created_at": task.created_at.isoformat()
                }
                for task in self.task_queue
            ],
            "running_details": [
                {
                    "id": task.id,
                    "assigned_node": task.assigned_node,
                    "started_at": task.started_at.isoformat() if task.started_at else None
                }
                for task in self.running_tasks.values()
            ]
        }
