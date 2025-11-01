from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import httpx
import json
from ..models import (
    TaskCreationRequest,
    TaskUpdateRequest,
    Task,
    TaskInput,
    TaskResult,
    TaskStatus
)
from shared.models.base import InferenceTask, TaskRequirements, TaskPriority
from shared.database.services import task_service, node_service, metrics_service
from shared.database.models import TaskStatus as DBTaskStatus, TaskPriority as DBTaskPriority
from shared.database.connection import get_db_session
from ..services.scheduler import scheduler
from ..services.gpu_scheduler import GPUScheduler
from ..services.registry import registry
from ..services.logger import get_logger, log_task_event
from datetime import datetime
import asyncio
import uuid

router = APIRouter(prefix="/tasks", tags=["tasks"])
logger = get_logger(__name__)

# Initialize GPU scheduler
gpu_scheduler = GPUScheduler(registry)

@router.post("/create")
async def create_task(request: TaskCreationRequest, background_tasks: BackgroundTasks):
    """Create a new inference task."""
    try:
        task_id = scheduler.create_task(
            model=request.model,
            input_data=request.input_data.dict(),
            priority=request.priority
        )
        
        log_task_event(task_id, "created", details={
            "model": request.model,
            "priority": request.priority
        })
        
        return {
            "task_id": task_id,
            "status": "created",
            "message": "Task created successfully"
        }
        
    except Exception as e:
        logger.error(f"Task creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create_gpu_aware")
async def create_gpu_aware_task(
    model: str = "auto",
    input_text: str = "",
    requires_gpu: bool = False,
    min_ram_gb: float = 1.0,
    min_gpu_memory_gb: float = 0.0,
    min_compute_capability: Optional[str] = None,
    preferred_models: List[str] = [],
    priority: str = "normal",
    max_duration_seconds: int = 300
):
    """Create a GPU-aware inference task with resource requirements."""
    try:
        # Create task requirements
        requirements = TaskRequirements(
            requires_gpu=requires_gpu,
            min_ram_gb=min_ram_gb,
            min_gpu_memory_gb=min_gpu_memory_gb,
            min_compute_capability=min_compute_capability,
            preferred_models=preferred_models,
            max_duration_seconds=max_duration_seconds
        )

        # Create inference task
        task = InferenceTask(
            id=str(uuid.uuid4()),
            model=model,
            input=input_text,
            requirements=requirements,
            priority=TaskPriority(priority)
        )

        # Submit to GPU scheduler
        success = await gpu_scheduler.submit_task(task)

        if success:
            log_task_event(task.id, "created_gpu_aware", details={
                "model": model,
                "requires_gpu": requires_gpu,
                "priority": priority
            })

            return {
                "task_id": task.id,
                "status": "queued",
                "message": "GPU-aware task created successfully",
                "requirements": {
                    "requires_gpu": requires_gpu,
                    "min_ram_gb": min_ram_gb,
                    "min_gpu_memory_gb": min_gpu_memory_gb
                }
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="No suitable nodes available for task requirements"
            )

    except Exception as e:
        logger.error(f"GPU-aware task creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/queue/status")
async def get_queue_status():
    """Get current task queue status including GPU requirements."""
    try:
        return gpu_scheduler.get_queue_status()
    except Exception as e:
        logger.error(f"Failed to get queue status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create_persistent")
async def create_persistent_task(
    model: str = "auto",
    input_text: str = "",
    requires_gpu: bool = False,
    min_ram_gb: float = 1.0,
    min_gpu_memory_gb: float = 0.0,
    min_compute_capability: Optional[str] = None,
    preferred_models: List[str] = [],
    priority: str = "normal",
    max_duration_seconds: int = 300,
    created_by: str = "api"
):
    """Create a persistent task with database storage"""
    try:
        # Create task data
        task_data = {
            "model_id": model,
            "input_text": input_text,
            "requires_gpu": requires_gpu,
            "min_ram_gb": min_ram_gb,
            "min_gpu_memory_gb": min_gpu_memory_gb,
            "min_compute_capability": min_compute_capability,
            "preferred_models": preferred_models,
            "priority": DBTaskPriority(priority),
            "max_duration_seconds": max_duration_seconds,
            "created_by": created_by,
            "parameters": {
                "max_tokens": 100,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }

        # Create task in database
        task = await task_service.create_task(task_data)

        # Find suitable node using existing logic
        requirements = TaskRequirements(
            requires_gpu=requires_gpu,
            min_ram_gb=min_ram_gb,
            min_gpu_memory_gb=min_gpu_memory_gb,
            min_compute_capability=min_compute_capability,
            preferred_models=preferred_models,
            max_duration_seconds=max_duration_seconds
        )

        suitable_nodes = []
        for node in registry.get_active_nodes():
            if await _node_meets_requirements(node, requirements):
                suitable_nodes.append(node)

        if suitable_nodes:
            # Assign to best node
            selected_node = suitable_nodes[0]
            await task_service.assign_task_to_node(task.task_id, selected_node.agent_id)

            # Update task status to queued
            await task_service.update_task_status(task.task_id, DBTaskStatus.QUEUED)

            logger.info(f"Created persistent task {task.task_id} assigned to {selected_node.agent_id}")

            return {
                "task_id": task.task_id,
                "status": "queued",
                "assigned_node": selected_node.agent_id,
                "created_at": task.created_at.isoformat(),
                "estimated_duration": max_duration_seconds
            }
        else:
            # No suitable nodes, keep as pending
            logger.warning(f"No suitable nodes for task {task.task_id}")
            return {
                "task_id": task.task_id,
                "status": "pending",
                "message": "No suitable nodes available",
                "created_at": task.created_at.isoformat()
            }

    except Exception as e:
        logger.error(f"Failed to create persistent task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/persistent/{task_id}")
async def get_persistent_task(task_id: str):
    """Get persistent task status and details"""
    try:
        task = await task_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Get task metrics
        metrics = await metrics_service.get_task_metrics(task_id)

        return {
            "task_id": task.task_id,
            "status": task.status.value,
            "model_id": task.model_id,
            "input_text": task.input_text,
            "assigned_node": task.assigned_node_id,
            "created_at": task.created_at.isoformat(),
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "duration_seconds": task.duration_seconds,
            "result": task.result,
            "error_message": task.error_message,
            "output_tokens": task.output_tokens,
            "metrics_count": len(metrics)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get persistent task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/persistent")
async def list_persistent_tasks(
    status: Optional[str] = None,
    limit: int = 100,
    node_id: Optional[str] = None
):
    """List persistent tasks with optional filtering"""
    try:
        if node_id:
            tasks = await task_service.get_tasks_by_node(node_id, limit)
        elif status:
            task_status = DBTaskStatus(status)
            tasks = await task_service.get_tasks_by_status(task_status, limit)
        else:
            # Get recent tasks of all statuses
            all_tasks = []
            for task_status in DBTaskStatus:
                status_tasks = await task_service.get_tasks_by_status(task_status, limit // len(DBTaskStatus))
                all_tasks.extend(status_tasks)

            # Sort by creation time
            tasks = sorted(all_tasks, key=lambda t: t.created_at, reverse=True)[:limit]

        return {
            "tasks": [
                {
                    "task_id": task.task_id,
                    "status": task.status.value,
                    "model_id": task.model_id,
                    "assigned_node": task.assigned_node_id,
                    "created_at": task.created_at.isoformat(),
                    "duration_seconds": task.duration_seconds,
                    "priority": task.priority.value
                }
                for task in tasks
            ],
            "total": len(tasks)
        }

    except Exception as e:
        logger.error(f"Failed to list persistent tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/persistent")
async def get_persistent_task_stats():
    """Get persistent task statistics"""
    try:
        stats = await task_service.get_task_queue_stats()

        # Get additional stats
        active_nodes = await node_service.get_active_nodes()

        return {
            "task_counts": stats,
            "active_nodes": len(active_nodes),
            "total_tasks": sum(stats.values()),
            "queue_health": "healthy" if stats.get("failed", 0) < stats.get("completed", 1) else "degraded"
        }

    except Exception as e:
        logger.error(f"Failed to get persistent task stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
async def stream_inference(
    model: str = "auto",
    input_text: str = "",
    requires_gpu: bool = False,
    min_ram_gb: float = 1.0,
    min_gpu_memory_gb: float = 0.0,
    min_compute_capability: Optional[str] = None,
    preferred_models: List[str] = [],
    priority: str = "normal",
    max_duration_seconds: int = 300
):
    """Stream inference results through the hub by relaying from an agent"""

    async def relay_stream():
        """Relay streaming response from agent to client"""
        try:
            # Create task requirements
            requirements = TaskRequirements(
                requires_gpu=requires_gpu,
                min_ram_gb=min_ram_gb,
                min_gpu_memory_gb=min_gpu_memory_gb,
                min_compute_capability=min_compute_capability,
                preferred_models=preferred_models,
                max_duration_seconds=max_duration_seconds
            )

            # Find suitable agent
            suitable_nodes = []
            for node in registry.get_active_nodes():
                if await _node_meets_requirements(node, requirements):
                    suitable_nodes.append(node)

            if not suitable_nodes:
                error_msg = {
                    "status": "error",
                    "error": "No suitable agents available for streaming",
                    "timestamp": datetime.now().isoformat()
                }
                yield f"data: {json.dumps(error_msg)}\n\n"
                return

            # Select best agent (simple selection for now)
            selected_agent = suitable_nodes[0]
            agent_url = f"http://{selected_agent.host}:{selected_agent.port}"

            # Prepare task data
            task_data = {
                "id": str(uuid.uuid4()),
                "model": model,
                "input": input_text,
                "parameters": {
                    "max_tokens": 100,
                    "temperature": 0.7,
                    "top_p": 0.9
                },
                "task_type": "text-generation"
            }

            # Stream from agent
            async with httpx.AsyncClient(timeout=300.0) as client:
                async with client.stream(
                    "POST",
                    f"{agent_url}/inference/stream",
                    json=task_data,
                    headers={"Accept": "text/event-stream"}
                ) as response:
                    if response.status_code != 200:
                        error_msg = {
                            "status": "error",
                            "error": f"Agent returned status {response.status_code}",
                            "timestamp": datetime.now().isoformat()
                        }
                        yield f"data: {json.dumps(error_msg)}\n\n"
                        return

                    # Relay chunks from agent
                    async for chunk in response.aiter_text():
                        if chunk.strip():
                            yield chunk

        except Exception as e:
            logger.error(f"Streaming relay error: {e}")
            error_msg = {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(error_msg)}\n\n"

    return StreamingResponse(
        relay_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

async def _node_meets_requirements(node, requirements: TaskRequirements) -> bool:
    """Helper function to check if a node meets task requirements"""
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

        # Check if node is not overloaded
        if node.current_tasks >= node.max_concurrent_tasks:
            return False

        return True

    except Exception as e:
        logger.error(f"Error checking node requirements: {e}")
        return False

@router.get("/{task_id}")
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """Get task status and details."""
    try:
        task = scheduler.get_task_status(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{task_id}/status")
async def update_task_status(task_id: str, request: TaskUpdateRequest):
    """Update task status (usually called by agents)."""
    try:
        result_data = request.result.dict() if request.result else None
        
        success = registry.update_task_status(
            task_id=task_id,
            status=request.status.value,
            result=result_data
        )
        
        if success:
            log_task_event(task_id, f"status_updated_to_{request.status.value}")
            return {"status": "updated", "task_id": task_id}
        else:
            raise HTTPException(status_code=404, detail="Task not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_tasks_status(limit: int = 100) -> List[Dict[str, Any]]:
    """Get status of all tasks."""
    try:
        tasks = scheduler.get_all_tasks(limit)
        return tasks
    except Exception as e:
        logger.error(f"Failed to get tasks status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a pending task."""
    try:
        success = scheduler.cancel_task(task_id)
        if success:
            log_task_event(task_id, "cancelled")
            return {"status": "cancelled", "task_id": task_id}
        else:
            raise HTTPException(status_code=400, detail="Cannot cancel task")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/queue/pending")
async def get_pending_tasks() -> List[Dict[str, Any]]:
    """Get all pending tasks in the queue."""
    try:
        tasks = registry.get_tasks_by_status("pending")
        return tasks
    except Exception as e:
        logger.error(f"Failed to get pending tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/queue/running")
async def get_running_tasks() -> List[Dict[str, Any]]:
    """Get all currently running tasks."""
    try:
        tasks = registry.get_tasks_by_status("running")
        return tasks
    except Exception as e:
        logger.error(f"Failed to get running tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def create_batch_tasks(requests: List[TaskCreationRequest]):
    """Create multiple tasks in batch."""
    try:
        task_ids = []
        for request in requests:
            task_id = scheduler.create_task(
                model=request.model,
                input_data=request.input_data.dict(),
                priority=request.priority
            )
            task_ids.append(task_id)
            
            log_task_event(task_id, "created_in_batch", details={
                "model": request.model,
                "batch_size": len(requests)
            })
        
        return {
            "task_ids": task_ids,
            "status": "created",
            "count": len(task_ids)
        }
        
    except Exception as e:
        logger.error(f"Batch task creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/{node_id}/next")
async def get_next_task_for_agent(node_id: str) -> Optional[Dict[str, Any]]:
    """Get the next task for a specific agent."""
    try:
        # Verify agent exists and is online
        node = registry.get_node(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if node.get("status") != "online":
            raise HTTPException(status_code=400, detail="Agent is not online")
        
        # Get next pending task
        task_id = registry.get_pending_task()
        if not task_id:
            return {"message": "No pending tasks"}
        
        # Get full task details
        task = registry.get_task(task_id)
        if task:
            # Mark as assigned to this agent
            registry.update_task_status(task_id, "running", node_id)
            log_task_event(task_id, "assigned", node_id, {"agent": node_id})
            
            return {
                "task_id": task_id,
                "task_data": task,
                "assigned_to": node_id
            }
        else:
            return {"message": "No pending tasks"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get next task for agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent/{node_id}/complete/{task_id}")
async def complete_task_for_agent(node_id: str, task_id: str, result: TaskResult):
    """Mark a task as completed by an agent."""
    try:
        # Verify the task is assigned to this agent
        task = registry.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task.get("node_id") != node_id:
            raise HTTPException(status_code=403, detail="Task not assigned to this agent")
        
        # Update task status
        success = registry.update_task_status(
            task_id=task_id,
            status="completed",
            node_id=node_id,
            result=result.dict()
        )
        
        if success:
            log_task_event(task_id, "completed", node_id, {
                "processing_time": result.processing_time,
                "tokens_generated": result.tokens_generated
            })
            
            return {
                "status": "completed",
                "task_id": task_id,
                "agent": node_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update task")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent/{node_id}/fail/{task_id}")
async def fail_task_for_agent(node_id: str, task_id: str, error: str):
    """Mark a task as failed by an agent."""
    try:
        # Verify the task is assigned to this agent
        task = registry.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task.get("node_id") != node_id:
            raise HTTPException(status_code=403, detail="Task not assigned to this agent")
        
        # Update task status
        success = registry.update_task_status(
            task_id=task_id,
            status="failed",
            node_id=node_id,
            result={"error": error}
        )
        
        if success:
            log_task_event(task_id, "failed", node_id, {"error": error})
            
            return {
                "status": "failed",
                "task_id": task_id,
                "agent": node_id,
                "error": error
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to update task")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fail task: {e}")
        raise HTTPException(status_code=500, detail=str(e))
