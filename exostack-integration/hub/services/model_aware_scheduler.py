"""
Enhanced Model-Aware Scheduler for ExoStack
Provides intelligent node selection based on model compatibility, performance, and resource optimization
"""
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta

from shared.models.base import InferenceTask, TaskRequirements, AgentNode
from shared.database.services import task_service, node_service, metrics_service
from shared.database.models import Task, Node, TaskStatus, NodeStatus
from shared.config.model_registry import model_registry

logger = logging.getLogger(__name__)

class SchedulingStrategy(str, Enum):
    ROUND_ROBIN = "round_robin"
    LEAST_LOADED = "least_loaded"
    MODEL_AFFINITY = "model_affinity"
    PERFORMANCE_BASED = "performance_based"
    RESOURCE_OPTIMIZED = "resource_optimized"

@dataclass
class NodeScore:
    """Scoring for node selection"""
    node_id: str
    total_score: float
    model_compatibility: float
    resource_availability: float
    performance_history: float
    load_balance: float
    affinity_bonus: float
    
    def __str__(self):
        return f"Node {self.node_id}: {self.total_score:.2f} (compat={self.model_compatibility:.2f}, resource={self.resource_availability:.2f}, perf={self.performance_history:.2f})"

class ModelAwareScheduler:
    """Enhanced scheduler with model-specific routing and performance optimization"""
    
    def __init__(self, registry, strategy: SchedulingStrategy = SchedulingStrategy.MODEL_AFFINITY):
        self.registry = registry
        self.strategy = strategy
        self.model_performance_cache: Dict[str, Dict[str, float]] = {}  # model_id -> {node_id: tokens_per_second}
        self.node_model_affinity: Dict[str, Dict[str, int]] = {}  # node_id -> {model_id: usage_count}
        self.last_cache_update = datetime.now()
        self.cache_ttl = timedelta(minutes=5)
        
        logger.info(f"Initialized ModelAwareScheduler with strategy: {strategy}")
    
    async def find_best_node(
        self, 
        task: InferenceTask, 
        requirements: TaskRequirements
    ) -> Optional[AgentNode]:
        """Find the best node for a task using model-aware scheduling"""
        
        # Get active nodes
        active_nodes = self.registry.get_active_nodes()
        if not active_nodes:
            logger.warning("No active nodes available")
            return None
        
        # Update performance cache if needed
        await self._update_performance_cache()
        
        # Score all nodes
        node_scores = []
        for node in active_nodes:
            score = await self._score_node(node, task, requirements)
            if score:
                node_scores.append(score)
        
        if not node_scores:
            logger.warning("No suitable nodes found for task")
            return None
        
        # Sort by total score (descending)
        node_scores.sort(key=lambda x: x.total_score, reverse=True)
        
        # Log top candidates
        logger.info(f"Top node candidates for model {task.model}:")
        for i, score in enumerate(node_scores[:3]):
            logger.info(f"  {i+1}. {score}")
        
        # Select best node
        best_score = node_scores[0]
        best_node = next(
            (node for node in active_nodes if node.agent_id == best_score.node_id),
            None
        )
        
        if best_node:
            # Update affinity tracking
            await self._update_model_affinity(best_score.node_id, task.model)
            logger.info(f"Selected node {best_score.node_id} for model {task.model} (score: {best_score.total_score:.2f})")
        
        return best_node
    
    async def _score_node(
        self, 
        node: AgentNode, 
        task: InferenceTask, 
        requirements: TaskRequirements
    ) -> Optional[NodeScore]:
        """Score a node for task assignment"""
        
        # Check basic compatibility
        if not await self._check_basic_compatibility(node, requirements):
            return None
        
        # Calculate individual scores
        model_compat = await self._score_model_compatibility(node, task.model, requirements)
        resource_avail = await self._score_resource_availability(node, requirements)
        performance = await self._score_performance_history(node, task.model)
        load_balance = await self._score_load_balance(node)
        affinity = await self._score_model_affinity(node, task.model)
        
        # Weighted total score based on strategy
        weights = self._get_strategy_weights()
        total_score = (
            model_compat * weights["model_compatibility"] +
            resource_avail * weights["resource_availability"] +
            performance * weights["performance_history"] +
            load_balance * weights["load_balance"] +
            affinity * weights["affinity_bonus"]
        )
        
        return NodeScore(
            node_id=node.agent_id,
            total_score=total_score,
            model_compatibility=model_compat,
            resource_availability=resource_avail,
            performance_history=performance,
            load_balance=load_balance,
            affinity_bonus=affinity
        )
    
    async def _check_basic_compatibility(self, node: AgentNode, requirements: TaskRequirements) -> bool:
        """Check if node meets basic requirements"""
        
        # GPU requirement
        if requirements.requires_gpu and not node.compute_resources.has_gpu:
            return False
        
        # RAM requirement
        if node.compute_resources.available_ram_gb < requirements.min_ram_gb:
            return False
        
        # GPU memory requirement
        if requirements.min_gpu_memory_gb > 0:
            if not node.compute_resources.has_gpu:
                return False
            
            gpu_info = node.compute_resources.gpu_info
            gpu_devices = gpu_info.get('devices', [])
            
            sufficient_gpu_memory = False
            for device in gpu_devices:
                available_memory = device.get('memory_total_gb', 0) - device.get('memory_allocated_gb', 0)
                if available_memory >= requirements.min_gpu_memory_gb:
                    sufficient_gpu_memory = True
                    break
            
            if not sufficient_gpu_memory:
                return False
        
        # Task capacity
        if node.current_tasks >= node.max_concurrent_tasks:
            return False
        
        return True
    
    async def _score_model_compatibility(self, node: AgentNode, model_id: str, requirements: TaskRequirements) -> float:
        """Score model compatibility (0.0 to 1.0)"""
        
        # Check if model is in supported models list
        supported_models = getattr(node, 'supported_models', [])
        if supported_models and model_id in supported_models:
            return 1.0
        
        # Check model registry for compatibility
        model_config = model_registry.get_model(model_id)
        if not model_config:
            return 0.5  # Unknown model, neutral score
        
        # Check resource compatibility
        compatibility_score = 0.0
        
        # GPU compatibility
        if model_config.gpu_compatible and node.compute_resources.has_gpu:
            compatibility_score += 0.4
        elif model_config.cpu_compatible and not requirements.requires_gpu:
            compatibility_score += 0.3
        
        # Memory compatibility
        if node.compute_resources.available_ram_gb >= model_config.ram_required_gb:
            compatibility_score += 0.3
        
        # GPU memory compatibility
        if model_config.gpu_memory_required_gb > 0 and node.compute_resources.has_gpu:
            gpu_info = node.compute_resources.gpu_info
            gpu_devices = gpu_info.get('devices', [])
            
            for device in gpu_devices:
                available_memory = device.get('memory_total_gb', 0) - device.get('memory_allocated_gb', 0)
                if available_memory >= model_config.gpu_memory_required_gb:
                    compatibility_score += 0.3
                    break
        
        return min(compatibility_score, 1.0)
    
    async def _score_resource_availability(self, node: AgentNode, requirements: TaskRequirements) -> float:
        """Score resource availability (0.0 to 1.0)"""
        
        # RAM availability score
        ram_ratio = node.compute_resources.available_ram_gb / max(node.compute_resources.total_ram_gb, 1)
        ram_score = min(ram_ratio, 1.0)
        
        # GPU availability score
        gpu_score = 0.5  # Default for CPU-only nodes
        if node.compute_resources.has_gpu:
            gpu_info = node.compute_resources.gpu_info
            gpu_devices = gpu_info.get('devices', [])
            
            if gpu_devices:
                total_gpu_memory = sum(device.get('memory_total_gb', 0) for device in gpu_devices)
                allocated_gpu_memory = sum(device.get('memory_allocated_gb', 0) for device in gpu_devices)
                
                if total_gpu_memory > 0:
                    gpu_ratio = (total_gpu_memory - allocated_gpu_memory) / total_gpu_memory
                    gpu_score = min(gpu_ratio, 1.0)
        
        # Task load score
        load_ratio = node.current_tasks / max(node.max_concurrent_tasks, 1)
        load_score = 1.0 - load_ratio
        
        # Weighted average
        return (ram_score * 0.4 + gpu_score * 0.4 + load_score * 0.2)
    
    async def _score_performance_history(self, node: AgentNode, model_id: str) -> float:
        """Score based on historical performance (0.0 to 1.0)"""
        
        # Check cache first
        if model_id in self.model_performance_cache:
            node_performance = self.model_performance_cache[model_id].get(node.agent_id)
            if node_performance:
                # Normalize performance score (assuming 10 tokens/sec is good)
                return min(node_performance / 10.0, 1.0)
        
        # Default score for nodes without history
        return 0.5
    
    async def _score_load_balance(self, node: AgentNode) -> float:
        """Score for load balancing (0.0 to 1.0)"""
        
        # Prefer less loaded nodes
        load_ratio = node.current_tasks / max(node.max_concurrent_tasks, 1)
        return 1.0 - load_ratio
    
    async def _score_model_affinity(self, node: AgentNode, model_id: str) -> float:
        """Score based on model affinity/caching (0.0 to 1.0)"""
        
        # Check if node has recently used this model
        node_affinity = self.node_model_affinity.get(node.agent_id, {})
        usage_count = node_affinity.get(model_id, 0)
        
        # Higher usage count = higher affinity (model likely cached)
        if usage_count > 0:
            return min(usage_count / 10.0, 1.0)  # Cap at 1.0
        
        return 0.0
    
    def _get_strategy_weights(self) -> Dict[str, float]:
        """Get scoring weights based on strategy"""
        
        if self.strategy == SchedulingStrategy.MODEL_AFFINITY:
            return {
                "model_compatibility": 0.3,
                "resource_availability": 0.2,
                "performance_history": 0.2,
                "load_balance": 0.1,
                "affinity_bonus": 0.2
            }
        elif self.strategy == SchedulingStrategy.PERFORMANCE_BASED:
            return {
                "model_compatibility": 0.2,
                "resource_availability": 0.2,
                "performance_history": 0.4,
                "load_balance": 0.1,
                "affinity_bonus": 0.1
            }
        elif self.strategy == SchedulingStrategy.RESOURCE_OPTIMIZED:
            return {
                "model_compatibility": 0.2,
                "resource_availability": 0.4,
                "performance_history": 0.1,
                "load_balance": 0.2,
                "affinity_bonus": 0.1
            }
        elif self.strategy == SchedulingStrategy.LEAST_LOADED:
            return {
                "model_compatibility": 0.2,
                "resource_availability": 0.2,
                "performance_history": 0.1,
                "load_balance": 0.4,
                "affinity_bonus": 0.1
            }
        else:  # ROUND_ROBIN or default
            return {
                "model_compatibility": 0.25,
                "resource_availability": 0.25,
                "performance_history": 0.2,
                "load_balance": 0.2,
                "affinity_bonus": 0.1
            }
    
    async def _update_performance_cache(self):
        """Update performance cache from database"""
        
        if datetime.now() - self.last_cache_update < self.cache_ttl:
            return
        
        try:
            # Get recent task metrics for performance data
            # This would query the database for recent completed tasks
            # and their performance metrics
            
            # For now, we'll use a simple implementation
            # In production, this would query TaskMetric table
            
            self.last_cache_update = datetime.now()
            logger.debug("Updated performance cache")
            
        except Exception as e:
            logger.error(f"Failed to update performance cache: {e}")
    
    async def _update_model_affinity(self, node_id: str, model_id: str):
        """Update model affinity tracking"""
        
        if node_id not in self.node_model_affinity:
            self.node_model_affinity[node_id] = {}
        
        if model_id not in self.node_model_affinity[node_id]:
            self.node_model_affinity[node_id][model_id] = 0
        
        self.node_model_affinity[node_id][model_id] += 1
    
    def get_scheduling_stats(self) -> Dict[str, Any]:
        """Get scheduling statistics"""
        
        return {
            "strategy": self.strategy.value,
            "performance_cache_size": len(self.model_performance_cache),
            "affinity_tracking": {
                "nodes": len(self.node_model_affinity),
                "total_affinities": sum(
                    len(models) for models in self.node_model_affinity.values()
                )
            },
            "last_cache_update": self.last_cache_update.isoformat(),
            "cache_ttl_minutes": self.cache_ttl.total_seconds() / 60
        }
