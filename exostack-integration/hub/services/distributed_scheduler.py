"""
Enhanced Distributed Task Scheduler
"""

import asyncio
import logging
import json
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import aiohttp
from ..models import Task, TaskStatus
from .registry import registry
from .logger import get_logger, log_task_event

logger = get_logger(__name__)

class DistributedScheduler:
    def __init__(self):
        self.running = False
        self.task_queue = asyncio.Queue()
        self.node_loads: Dict[str, float] = {}
        self.task_assignments: Dict[str, str] = {}
        
    async def start(self):
        self.running = True
        logger.info("Starting distributed scheduler")
        asyncio.create_task(self._process_task_queue())
        asyncio.create_task(self._monitor_node_health())
        
    async def stop(self):
        self.running = False
        logger.info("Stopping distributed scheduler")
        
    async def schedule_task(self, task: Task) -> bool:
        try:
            best_node = await self._select_optimal_node(task)
            if not best_node:
                logger.warning(f"No available nodes for task {task.id}")
                return False
                
            success = await self._assign_task_to_node(task, best_node)
            if success:
                self.task_assignments[task.id] = best_node["id"]
                log_task_event(task.id, "scheduled", best_node["id"])
                
            return success
            
        except Exception as e:
            logger.error(f"Error scheduling task {task.id}: {e}")
            return False
            
    async def _select_optimal_node(self, task: Task) -> Optional[Dict]:
        available_nodes = await self._get_available_nodes()
        if not available_nodes:
            return None
        return available_nodes[0]  # Simple selection for now
        
    async def _assign_task_to_node(self, task: Task, node: Dict) -> bool:
        try:
            registry.update_task_status(task.id, TaskStatus.RUNNING, node["id"])
            success = await self._send_task_to_node(task, node)
            
            if not success:
                registry.update_task_status(task.id, TaskStatus.PENDING)
                
            return success
            
        except Exception as e:
            logger.error(f"Error assigning task {task.id}: {e}")
            return False
            
    async def _send_task_to_node(self, task: Task, node: Dict) -> bool:
        try:
            node_url = f"http://{node['host']}:{node['port']}"
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{node_url}/tasks/execute",
                    json=task.dict(),
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    return response.status == 200
                    
        except Exception as e:
            logger.error(f"Failed to send task to node {node['id']}: {e}")
            return False
            
    async def _get_available_nodes(self) -> List[Dict]:
        all_nodes = registry.get_all_nodes()
        return [node for node in all_nodes if node.get("status") == "online"]
        
    async def _process_task_queue(self):
        while self.running:
            try:
                pending_tasks = registry.get_tasks_by_status(TaskStatus.PENDING)
                
                for task_data in pending_tasks:
                    if not self.running:
                        break
                    task = Task(**task_data)
                    await self.schedule_task(task)
                    
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error processing task queue: {e}")
                await asyncio.sleep(5)
                
    async def _monitor_node_health(self):
        while self.running:
            try:
                nodes = registry.get_all_nodes()
                
                for node in nodes:
                    if node.get("status") == "online":
                        health_data = await self._get_node_health(node)
                        if health_data:
                            registry.update_node_health(node["id"], health_data)
                            
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error monitoring node health: {e}")
                await asyncio.sleep(60)
                
    async def _get_node_health(self, node: Dict) -> Optional[Dict]:
        try:
            node_url = f"http://{node['host']}:{node['port']}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{node_url}/health/detailed",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        return await response.json()
                        
        except Exception:
            pass
            
        return None

distributed_scheduler = DistributedScheduler()