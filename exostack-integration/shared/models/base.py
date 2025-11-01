from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class BaseNode(BaseModel):
    id: str
    host: str
    port: int
    status: str = "active"
    last_heartbeat: Optional[datetime] = None

class NodeCapabilities(BaseModel):
    inference: bool = True
    text_generation: bool = True
    auto_model_loading: bool = False
    streaming: bool = False
    model_registry: bool = False

class ComputeResources(BaseModel):
    cpu_cores: int
    total_ram_gb: float
    available_ram_gb: float
    has_gpu: bool = False
    gpu_info: Dict[str, Any] = {}

class TaskRequirements(BaseModel):
    requires_gpu: bool = False
    min_ram_gb: float = 1.0
    min_gpu_memory_gb: float = 0.0
    min_compute_capability: Optional[str] = None
    preferred_models: List[str] = []
    max_duration_seconds: int = 300

class InferenceTask(BaseModel):
    id: str
    model: str = "auto"
    input: str
    parameters: Dict[str, Any] = {}
    task_type: str = "text-generation"
    requirements: TaskRequirements = TaskRequirements()
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = datetime.now()
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    assigned_node: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class AgentNode(BaseNode):
    capabilities: NodeCapabilities = NodeCapabilities()
    compute_resources: ComputeResources
    supported_models: List[str] = []
    max_concurrent_tasks: int = 5
    current_tasks: int = 0
    features: List[str] = []
