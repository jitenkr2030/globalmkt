"""
Worker Pool and Container Execution System for ExoStack
Provides job isolation via subprocess/thread pools and containerized task execution
"""
import asyncio
import logging
import subprocess
import threading
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List, Callable, Union
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import docker
import psutil

logger = logging.getLogger(__name__)

class ExecutionMode(str, Enum):
    THREAD_POOL = "thread_pool"
    PROCESS_POOL = "process_pool"
    CONTAINER = "container"
    SUBPROCESS = "subprocess"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"

@dataclass
class WorkerTask:
    """Task definition for worker execution"""
    task_id: str
    model_id: str
    input_data: Dict[str, Any]
    execution_mode: ExecutionMode = ExecutionMode.THREAD_POOL
    
    # Resource limits
    max_memory_mb: int = 2048
    max_cpu_cores: int = 2
    timeout_seconds: int = 300
    
    # Container settings (if using container mode)
    container_image: str = "exostack/inference:latest"
    container_env: Dict[str, str] = None
    container_volumes: Dict[str, str] = None
    
    # Isolation settings
    isolated_filesystem: bool = False
    network_isolation: bool = False
    
    # Metadata
    created_at: datetime = None
    priority: int = 0  # Higher number = higher priority
    
    def __post_init__(self):
        if self.container_env is None:
            self.container_env = {}
        if self.container_volumes is None:
            self.container_volumes = {}
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

@dataclass
class WorkerResult:
    """Result from worker execution"""
    task_id: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    execution_time_seconds: float = 0.0
    memory_used_mb: float = 0.0
    cpu_time_seconds: float = 0.0
    
    # Container specific metrics
    container_id: Optional[str] = None
    exit_code: Optional[int] = None
    
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class WorkerPool:
    """Multi-mode worker pool with isolation support"""
    
    def __init__(
        self,
        max_thread_workers: int = 4,
        max_process_workers: int = 2,
        enable_containers: bool = True,
        container_runtime: str = "docker"
    ):
        self.max_thread_workers = max_thread_workers
        self.max_process_workers = max_process_workers
        self.enable_containers = enable_containers
        self.container_runtime = container_runtime
        
        # Worker pools
        self.thread_pool = ThreadPoolExecutor(max_workers=max_thread_workers)
        self.process_pool = ProcessPoolExecutor(max_workers=max_process_workers)
        
        # Container client
        self.docker_client = None
        if enable_containers:
            try:
                self.docker_client = docker.from_env()
                logger.info("Docker client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Docker client: {e}")
                self.enable_containers = False
        
        # Task tracking
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_results: Dict[str, WorkerResult] = {}
        
        # Resource monitoring
        self.resource_monitor = ResourceMonitor()
        
        logger.info(f"WorkerPool initialized: threads={max_thread_workers}, processes={max_process_workers}, containers={enable_containers}")
    
    async def submit_task(self, task: WorkerTask) -> str:
        """Submit a task for execution"""
        try:
            # Validate task
            if not await self._validate_task(task):
                raise ValueError(f"Task validation failed: {task.task_id}")
            
            # Create result placeholder
            result = WorkerResult(
                task_id=task.task_id,
                status=TaskStatus.PENDING,
                started_at=datetime.now(timezone.utc)
            )
            self.task_results[task.task_id] = result
            
            # Submit based on execution mode
            if task.execution_mode == ExecutionMode.CONTAINER and self.enable_containers:
                execution_task = asyncio.create_task(self._execute_container_task(task))
            elif task.execution_mode == ExecutionMode.PROCESS_POOL:
                execution_task = asyncio.create_task(self._execute_process_task(task))
            elif task.execution_mode == ExecutionMode.SUBPROCESS:
                execution_task = asyncio.create_task(self._execute_subprocess_task(task))
            else:  # Default to thread pool
                execution_task = asyncio.create_task(self._execute_thread_task(task))
            
            self.running_tasks[task.task_id] = execution_task
            
            logger.info(f"Submitted task {task.task_id} with mode {task.execution_mode}")
            return task.task_id
            
        except Exception as e:
            logger.error(f"Failed to submit task {task.task_id}: {e}")
            self.task_results[task.task_id] = WorkerResult(
                task_id=task.task_id,
                status=TaskStatus.FAILED,
                error_message=str(e)
            )
            raise
    
    async def get_task_result(self, task_id: str) -> Optional[WorkerResult]:
        """Get task result"""
        return self.task_results.get(task_id)
    
    async def cancel_task(self, task_id: str) -> bool:
        """Cancel a running task"""
        if task_id in self.running_tasks:
            task = self.running_tasks[task_id]
            task.cancel()
            
            # Update result
            if task_id in self.task_results:
                self.task_results[task_id].status = TaskStatus.CANCELLED
                self.task_results[task_id].completed_at = datetime.now(timezone.utc)
            
            logger.info(f"Cancelled task {task_id}")
            return True
        
        return False
    
    async def get_pool_stats(self) -> Dict[str, Any]:
        """Get worker pool statistics"""
        thread_pool_stats = {
            "max_workers": self.max_thread_workers,
            "active_workers": len([t for t in self.running_tasks.values() if not t.done()]),
        }
        
        container_stats = {}
        if self.enable_containers and self.docker_client:
            try:
                containers = self.docker_client.containers.list(
                    filters={"label": "exostack.worker=true"}
                )
                container_stats = {
                    "running_containers": len(containers),
                    "total_containers": len(self.docker_client.containers.list(all=True, filters={"label": "exostack.worker=true"}))
                }
            except Exception as e:
                logger.error(f"Failed to get container stats: {e}")
                container_stats = {"error": str(e)}
        
        return {
            "thread_pool": thread_pool_stats,
            "process_pool": {
                "max_workers": self.max_process_workers,
            },
            "containers": container_stats,
            "running_tasks": len(self.running_tasks),
            "completed_tasks": len([r for r in self.task_results.values() if r.status in [TaskStatus.COMPLETED, TaskStatus.FAILED]]),
            "resource_usage": await self.resource_monitor.get_current_usage()
        }
    
    async def _validate_task(self, task: WorkerTask) -> bool:
        """Validate task before execution"""
        if not task.task_id:
            return False
        
        if task.execution_mode == ExecutionMode.CONTAINER and not self.enable_containers:
            logger.warning(f"Container execution requested but not available for task {task.task_id}")
            return False
        
        # Check resource availability
        current_usage = await self.resource_monitor.get_current_usage()
        if current_usage["memory_percent"] > 90:
            logger.warning(f"High memory usage, rejecting task {task.task_id}")
            return False
        
        return True
    
    async def _execute_thread_task(self, task: WorkerTask) -> WorkerResult:
        """Execute task in thread pool"""
        result = self.task_results[task.task_id]
        result.status = TaskStatus.RUNNING
        
        try:
            # Run in thread pool
            loop = asyncio.get_event_loop()
            start_time = datetime.now(timezone.utc)
            
            # Execute the actual inference task
            task_result = await loop.run_in_executor(
                self.thread_pool,
                self._run_inference_task,
                task
            )
            
            end_time = datetime.now(timezone.utc)
            
            result.status = TaskStatus.COMPLETED
            result.result = task_result
            result.execution_time_seconds = (end_time - start_time).total_seconds()
            result.completed_at = end_time
            
        except asyncio.TimeoutError:
            result.status = TaskStatus.TIMEOUT
            result.error_message = f"Task timed out after {task.timeout_seconds} seconds"
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error_message = str(e)
            logger.error(f"Thread task {task.task_id} failed: {e}")
        
        return result
    
    async def _execute_process_task(self, task: WorkerTask) -> WorkerResult:
        """Execute task in process pool"""
        result = self.task_results[task.task_id]
        result.status = TaskStatus.RUNNING
        
        try:
            loop = asyncio.get_event_loop()
            start_time = datetime.now(timezone.utc)
            
            # Execute in process pool
            task_result = await loop.run_in_executor(
                self.process_pool,
                self._run_inference_task,
                task
            )
            
            end_time = datetime.now(timezone.utc)
            
            result.status = TaskStatus.COMPLETED
            result.result = task_result
            result.execution_time_seconds = (end_time - start_time).total_seconds()
            result.completed_at = end_time
            
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error_message = str(e)
            logger.error(f"Process task {task.task_id} failed: {e}")
        
        return result
    
    async def _execute_container_task(self, task: WorkerTask) -> WorkerResult:
        """Execute task in Docker container"""
        result = self.task_results[task.task_id]
        result.status = TaskStatus.RUNNING
        
        container = None
        try:
            # Prepare task data
            task_data = {
                "task_id": task.task_id,
                "model_id": task.model_id,
                "input_data": task.input_data
            }
            
            # Create temporary directory for task
            with tempfile.TemporaryDirectory() as temp_dir:
                task_file = Path(temp_dir) / "task.json"
                result_file = Path(temp_dir) / "result.json"
                
                # Write task data
                with open(task_file, 'w') as f:
                    json.dump(task_data, f)
                
                # Container configuration
                volumes = {
                    temp_dir: {"bind": "/workspace", "mode": "rw"}
                }
                volumes.update(task.container_volumes)
                
                environment = {
                    "TASK_FILE": "/workspace/task.json",
                    "RESULT_FILE": "/workspace/result.json",
                    "EXOSTACK_TASK_ID": task.task_id
                }
                environment.update(task.container_env)
                
                # Run container
                start_time = datetime.now(timezone.utc)
                
                container = self.docker_client.containers.run(
                    task.container_image,
                    command=["python", "/app/inference_worker.py"],
                    volumes=volumes,
                    environment=environment,
                    labels={"exostack.worker": "true", "exostack.task_id": task.task_id},
                    mem_limit=f"{task.max_memory_mb}m",
                    cpuset_cpus=f"0-{task.max_cpu_cores-1}",
                    detach=True,
                    remove=True
                )
                
                result.container_id = container.id
                
                # Wait for completion
                exit_code = container.wait(timeout=task.timeout_seconds)
                end_time = datetime.now(timezone.utc)
                
                result.exit_code = exit_code["StatusCode"]
                result.execution_time_seconds = (end_time - start_time).total_seconds()
                result.completed_at = end_time
                
                # Read result
                if result_file.exists():
                    with open(result_file, 'r') as f:
                        task_result = json.load(f)
                    
                    if exit_code["StatusCode"] == 0:
                        result.status = TaskStatus.COMPLETED
                        result.result = task_result
                    else:
                        result.status = TaskStatus.FAILED
                        result.error_message = task_result.get("error", f"Container exited with code {exit_code['StatusCode']}")
                else:
                    result.status = TaskStatus.FAILED
                    result.error_message = "No result file produced"
                
        except docker.errors.ContainerError as e:
            result.status = TaskStatus.FAILED
            result.error_message = f"Container error: {e}"
            result.exit_code = e.exit_status
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error_message = str(e)
            logger.error(f"Container task {task.task_id} failed: {e}")
        finally:
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass
        
        return result
    
    async def _execute_subprocess_task(self, task: WorkerTask) -> WorkerResult:
        """Execute task in subprocess"""
        result = self.task_results[task.task_id]
        result.status = TaskStatus.RUNNING
        
        try:
            # Prepare subprocess command
            cmd = [
                "python", "-m", "exo_agent.inference_worker",
                "--task-id", task.task_id,
                "--model-id", task.model_id,
                "--input-data", json.dumps(task.input_data)
            ]
            
            start_time = datetime.now(timezone.utc)
            
            # Run subprocess
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                limit=task.max_memory_mb * 1024 * 1024  # Convert MB to bytes
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=task.timeout_seconds
                )
                
                end_time = datetime.now(timezone.utc)
                
                result.execution_time_seconds = (end_time - start_time).total_seconds()
                result.completed_at = end_time
                result.exit_code = process.returncode
                
                if process.returncode == 0:
                    # Parse result from stdout
                    task_result = json.loads(stdout.decode())
                    result.status = TaskStatus.COMPLETED
                    result.result = task_result
                else:
                    result.status = TaskStatus.FAILED
                    result.error_message = stderr.decode()
                
            except asyncio.TimeoutError:
                process.kill()
                result.status = TaskStatus.TIMEOUT
                result.error_message = f"Subprocess timed out after {task.timeout_seconds} seconds"
                
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error_message = str(e)
            logger.error(f"Subprocess task {task.task_id} failed: {e}")
        
        return result
    
    def _run_inference_task(self, task: WorkerTask) -> Dict[str, Any]:
        """Run the actual inference task (placeholder implementation)"""
        # This would be replaced with actual inference logic
        # For now, simulate some work
        import time
        import random
        
        time.sleep(random.uniform(1, 3))  # Simulate processing time
        
        return {
            "output": f"Generated response for {task.model_id}",
            "tokens_generated": random.randint(50, 200),
            "processing_time": random.uniform(1, 3)
        }
    
    async def cleanup(self):
        """Cleanup worker pool resources"""
        # Cancel all running tasks
        for task_id, task in self.running_tasks.items():
            if not task.done():
                task.cancel()
                logger.info(f"Cancelled task {task_id} during cleanup")
        
        # Shutdown executors
        self.thread_pool.shutdown(wait=True)
        self.process_pool.shutdown(wait=True)
        
        # Cleanup containers
        if self.docker_client:
            try:
                containers = self.docker_client.containers.list(
                    filters={"label": "exostack.worker=true"}
                )
                for container in containers:
                    container.remove(force=True)
                    logger.info(f"Removed container {container.id}")
            except Exception as e:
                logger.error(f"Failed to cleanup containers: {e}")
        
        logger.info("WorkerPool cleanup completed")

class ResourceMonitor:
    """Monitor system resources for worker pool"""
    
    async def get_current_usage(self) -> Dict[str, float]:
        """Get current system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_gb": memory.used / (1024**3),
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_used_gb": disk.used / (1024**3)
            }
        except Exception as e:
            logger.error(f"Failed to get resource usage: {e}")
            return {}

# Global worker pool instance
worker_pool = WorkerPool()
