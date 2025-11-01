"""
Database service layer for ExoStack
Provides high-level database operations for tasks, nodes, and metrics
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlmodel import select, and_, or_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import (
    Task, TaskStatus, TaskPriority,
    Node, NodeStatus,
    TaskMetric, NodeMetric,
    TaskLog, SystemLog, LogLevel,
    Alert, AlertType, AlertSeverity,
    ModelInfo
)
from .connection import get_async_session

logger = logging.getLogger(__name__)

class TaskService:
    """Service for task-related database operations"""
    
    async def create_task(self, task_data: Dict[str, Any]) -> Task:
        """Create a new task"""
        async with get_async_session() as session:
            task = Task(**task_data)
            session.add(task)
            await session.commit()
            await session.refresh(task)
            logger.info(f"Created task {task.task_id}")
            return task
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Task).where(Task.task_id == task_id)
            )
            return result.scalar_one_or_none()
    
    async def update_task_status(
        self, 
        task_id: str, 
        status: TaskStatus,
        result: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """Update task status and results"""
        async with get_async_session() as session:
            result_stmt = await session.execute(
                select(Task).where(Task.task_id == task_id)
            )
            task = result_stmt.scalar_one_or_none()
            
            if not task:
                return False
            
            task.status = status
            task.updated_at = datetime.now(timezone.utc)
            
            if status == TaskStatus.RUNNING and not task.started_at:
                task.started_at = datetime.now(timezone.utc)
            elif status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
                task.completed_at = datetime.now(timezone.utc)
                if task.started_at:
                    task.duration_seconds = (task.completed_at - task.started_at).total_seconds()
            
            if result:
                task.result = result
                task.output_tokens = result.get('output_tokens')
            
            if error_message:
                task.error_message = error_message
            
            await session.commit()
            logger.info(f"Updated task {task_id} status to {status}")
            return True
    
    async def assign_task_to_node(self, task_id: str, node_id: str) -> bool:
        """Assign task to a node"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Task).where(Task.task_id == task_id)
            )
            task = result.scalar_one_or_none()
            
            if not task:
                return False
            
            task.assigned_node_id = node_id
            task.status = TaskStatus.QUEUED
            await session.commit()
            logger.info(f"Assigned task {task_id} to node {node_id}")
            return True
    
    async def get_tasks_by_status(self, status: TaskStatus, limit: int = 100) -> List[Task]:
        """Get tasks by status"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Task)
                .where(Task.status == status)
                .order_by(desc(Task.created_at))
                .limit(limit)
            )
            return result.scalars().all()
    
    async def get_tasks_by_node(self, node_id: str, limit: int = 100) -> List[Task]:
        """Get tasks assigned to a node"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Task)
                .where(Task.assigned_node_id == node_id)
                .order_by(desc(Task.created_at))
                .limit(limit)
            )
            return result.scalars().all()
    
    async def get_task_queue_stats(self) -> Dict[str, int]:
        """Get task queue statistics"""
        async with get_async_session() as session:
            stats = {}
            for status in TaskStatus:
                result = await session.execute(
                    select(func.count(Task.task_id)).where(Task.status == status)
                )
                stats[status.value] = result.scalar() or 0
            return stats
    
    async def cleanup_old_tasks(self, days: int = 30) -> int:
        """Clean up old completed/failed tasks"""
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        async with get_async_session() as session:
            result = await session.execute(
                select(func.count(Task.task_id))
                .where(
                    and_(
                        Task.status.in_([TaskStatus.COMPLETED, TaskStatus.FAILED]),
                        Task.completed_at < cutoff_date
                    )
                )
            )
            count = result.scalar() or 0
            
            if count > 0:
                await session.execute(
                    Task.__table__.delete().where(
                        and_(
                            Task.status.in_([TaskStatus.COMPLETED, TaskStatus.FAILED]),
                            Task.completed_at < cutoff_date
                        )
                    )
                )
                await session.commit()
                logger.info(f"Cleaned up {count} old tasks")
            
            return count

class NodeService:
    """Service for node-related database operations"""
    
    async def register_node(self, node_data: Dict[str, Any]) -> Node:
        """Register a new node"""
        async with get_async_session() as session:
            # Check if node already exists
            result = await session.execute(
                select(Node).where(Node.node_id == node_data["node_id"])
            )
            existing_node = result.scalar_one_or_none()
            
            if existing_node:
                # Update existing node
                for key, value in node_data.items():
                    setattr(existing_node, key, value)
                existing_node.status = NodeStatus.ACTIVE
                existing_node.last_heartbeat = datetime.now(timezone.utc)
                await session.commit()
                await session.refresh(existing_node)
                logger.info(f"Updated existing node {existing_node.node_id}")
                return existing_node
            else:
                # Create new node
                node = Node(**node_data)
                node.status = NodeStatus.ACTIVE
                node.last_heartbeat = datetime.now(timezone.utc)
                session.add(node)
                await session.commit()
                await session.refresh(node)
                logger.info(f"Registered new node {node.node_id}")
                return node
    
    async def update_node_heartbeat(self, node_id: str, metrics: Optional[Dict[str, Any]] = None) -> bool:
        """Update node heartbeat and metrics"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Node).where(Node.node_id == node_id)
            )
            node = result.scalar_one_or_none()
            
            if not node:
                return False
            
            node.last_heartbeat = datetime.now(timezone.utc)
            node.status = NodeStatus.ACTIVE
            
            if metrics:
                node.cpu_usage_percent = metrics.get('cpu_usage_percent', node.cpu_usage_percent)
                node.memory_usage_percent = metrics.get('memory_usage_percent', node.memory_usage_percent)
                node.gpu_usage_percent = metrics.get('gpu_usage_percent', node.gpu_usage_percent)
                node.current_tasks = metrics.get('current_tasks', node.current_tasks)
            
            await session.commit()
            return True
    
    async def get_active_nodes(self) -> List[Node]:
        """Get all active nodes"""
        heartbeat_threshold = datetime.now(timezone.utc) - timedelta(minutes=5)
        
        async with get_async_session() as session:
            result = await session.execute(
                select(Node)
                .where(
                    and_(
                        Node.status == NodeStatus.ACTIVE,
                        Node.last_heartbeat > heartbeat_threshold
                    )
                )
                .order_by(Node.node_id)
            )
            return result.scalars().all()
    
    async def get_node(self, node_id: str) -> Optional[Node]:
        """Get node by ID"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Node).where(Node.node_id == node_id)
            )
            return result.scalar_one_or_none()
    
    async def deactivate_node(self, node_id: str) -> bool:
        """Deactivate a node"""
        async with get_async_session() as session:
            result = await session.execute(
                select(Node).where(Node.node_id == node_id)
            )
            node = result.scalar_one_or_none()
            
            if not node:
                return False
            
            node.status = NodeStatus.INACTIVE
            await session.commit()
            logger.info(f"Deactivated node {node_id}")
            return True
    
    async def cleanup_inactive_nodes(self, hours: int = 24) -> int:
        """Clean up nodes that haven't sent heartbeat"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        async with get_async_session() as session:
            result = await session.execute(
                select(Node).where(Node.last_heartbeat < cutoff_time)
            )
            inactive_nodes = result.scalars().all()
            
            count = 0
            for node in inactive_nodes:
                node.status = NodeStatus.INACTIVE
                count += 1
            
            if count > 0:
                await session.commit()
                logger.info(f"Marked {count} nodes as inactive")
            
            return count

class MetricsService:
    """Service for metrics collection and retrieval"""
    
    async def record_task_metric(self, task_id: str, metrics: Dict[str, Any]):
        """Record task performance metrics"""
        async with get_async_session() as session:
            metric = TaskMetric(task_id=task_id, **metrics)
            session.add(metric)
            await session.commit()
    
    async def record_node_metric(self, node_id: str, metrics: Dict[str, Any]):
        """Record node performance metrics"""
        async with get_async_session() as session:
            metric = NodeMetric(node_id=node_id, **metrics)
            session.add(metric)
            await session.commit()
    
    async def get_task_metrics(self, task_id: str) -> List[TaskMetric]:
        """Get metrics for a specific task"""
        async with get_async_session() as session:
            result = await session.execute(
                select(TaskMetric)
                .where(TaskMetric.task_id == task_id)
                .order_by(TaskMetric.created_at)
            )
            return result.scalars().all()
    
    async def get_node_metrics(self, node_id: str, hours: int = 24) -> List[NodeMetric]:
        """Get recent metrics for a node"""
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        async with get_async_session() as session:
            result = await session.execute(
                select(NodeMetric)
                .where(
                    and_(
                        NodeMetric.node_id == node_id,
                        NodeMetric.created_at > since
                    )
                )
                .order_by(NodeMetric.created_at)
            )
            return result.scalars().all()

# Global service instances
task_service = TaskService()
node_service = NodeService()
metrics_service = MetricsService()
