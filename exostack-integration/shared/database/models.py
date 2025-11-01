"""
SQLModel database models for ExoStack persistent storage
Provides persistent task logs, metrics, and node state tracking
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from sqlalchemy import DateTime, func
import uuid

class TaskStatus(str, Enum):
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NodeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    FAILED = "failed"

# Base model with common fields
class TimestampedModel(SQLModel):
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), onupdate=func.now())
    )

# Task Models
class TaskBase(SQLModel):
    task_id: str = Field(primary_key=True, default_factory=lambda: str(uuid.uuid4()))
    model_id: str
    input_text: str
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Requirements
    requires_gpu: bool = False
    min_ram_gb: float = 1.0
    min_gpu_memory_gb: float = 0.0
    min_compute_capability: Optional[str] = None
    preferred_models: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Metadata
    priority: TaskPriority = TaskPriority.NORMAL
    max_duration_seconds: int = 300
    created_by: str = "system"
    tags: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))

class Task(TaskBase, TimestampedModel, table=True):
    __tablename__ = "tasks"
    
    # Status and execution
    status: TaskStatus = TaskStatus.PENDING
    assigned_node_id: Optional[str] = Field(foreign_key="nodes.node_id", default=None)
    
    # Execution details
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    
    # Results
    result: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    error_message: Optional[str] = None
    output_tokens: Optional[int] = None
    
    # Relationships
    assigned_node: Optional["Node"] = Relationship(back_populates="tasks")
    metrics: List["TaskMetric"] = Relationship(back_populates="task")
    logs: List["TaskLog"] = Relationship(back_populates="task")

# Node Models
class NodeBase(SQLModel):
    node_id: str = Field(primary_key=True)
    host: str
    port: int
    region: str = "default"
    
    # Capabilities
    capabilities: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    supported_models: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Resources
    total_ram_gb: float
    available_ram_gb: float
    cpu_cores: int
    has_gpu: bool = False
    gpu_count: int = 0
    gpu_info: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

class Node(NodeBase, TimestampedModel, table=True):
    __tablename__ = "nodes"
    
    # Status
    status: NodeStatus = NodeStatus.ACTIVE
    last_heartbeat: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    
    # Performance
    current_tasks: int = 0
    max_concurrent_tasks: int = 4
    total_tasks_completed: int = 0
    total_tasks_failed: int = 0
    
    # Health metrics
    cpu_usage_percent: float = 0.0
    memory_usage_percent: float = 0.0
    gpu_usage_percent: float = 0.0
    
    # Relationships
    tasks: List[Task] = Relationship(back_populates="assigned_node")
    metrics: List["NodeMetric"] = Relationship(back_populates="node")

# Metrics Models
class TaskMetric(TimestampedModel, table=True):
    __tablename__ = "task_metrics"
    
    id: Optional[int] = Field(primary_key=True, default=None)
    task_id: str = Field(foreign_key="tasks.task_id")
    
    # Performance metrics
    tokens_per_second: Optional[float] = None
    memory_used_mb: Optional[float] = None
    gpu_memory_used_mb: Optional[float] = None
    cpu_usage_percent: Optional[float] = None
    
    # Model metrics
    model_load_time_seconds: Optional[float] = None
    inference_time_seconds: Optional[float] = None
    queue_time_seconds: Optional[float] = None
    
    # Custom metrics
    custom_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    task: Task = Relationship(back_populates="metrics")

class NodeMetric(TimestampedModel, table=True):
    __tablename__ = "node_metrics"
    
    id: Optional[int] = Field(primary_key=True, default=None)
    node_id: str = Field(foreign_key="nodes.node_id")
    
    # System metrics
    cpu_usage_percent: float
    memory_usage_percent: float
    disk_usage_percent: float = 0.0
    
    # GPU metrics
    gpu_usage_percent: float = 0.0
    gpu_memory_usage_percent: float = 0.0
    gpu_temperature_celsius: Optional[float] = None
    
    # Network metrics
    network_bytes_sent: Optional[int] = None
    network_bytes_received: Optional[int] = None
    
    # Task metrics
    active_tasks: int = 0
    queued_tasks: int = 0
    
    # Custom metrics
    custom_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    node: Node = Relationship(back_populates="metrics")

# Logging Models
class LogLevel(str, Enum):
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class TaskLog(TimestampedModel, table=True):
    __tablename__ = "task_logs"
    
    id: Optional[int] = Field(primary_key=True, default=None)
    task_id: str = Field(foreign_key="tasks.task_id")
    
    level: LogLevel
    message: str
    component: str = "system"  # e.g., "scheduler", "executor", "model_loader"
    
    # Additional context
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    task: Task = Relationship(back_populates="logs")

class SystemLog(TimestampedModel, table=True):
    __tablename__ = "system_logs"
    
    id: Optional[int] = Field(primary_key=True, default=None)
    node_id: Optional[str] = Field(foreign_key="nodes.node_id", default=None)
    
    level: LogLevel
    message: str
    component: str = "system"
    
    # Additional context
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

# Model Registry
class ModelInfo(TimestampedModel, table=True):
    __tablename__ = "model_info"
    
    model_id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    
    # Model specifications
    size_gb: float
    ram_required_gb: float
    gpu_memory_required_gb: float = 0.0
    
    # Compatibility
    gpu_compatible: bool = True
    cpu_compatible: bool = True
    quantization_options: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Performance characteristics
    tokens_per_second_estimate: Optional[float] = None
    typical_context_length: int = 2048
    
    # Metadata
    tags: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Usage statistics
    total_requests: int = 0
    total_tokens_generated: int = 0
    average_rating: Optional[float] = None

# Alert Models
class AlertType(str, Enum):
    RESOURCE_THRESHOLD = "resource_threshold"
    NODE_FAILURE = "node_failure"
    TASK_FAILURE = "task_failure"
    MODEL_ERROR = "model_error"
    SYSTEM_ERROR = "system_error"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Alert(TimestampedModel, table=True):
    __tablename__ = "alerts"
    
    id: Optional[int] = Field(primary_key=True, default=None)
    alert_type: AlertType
    severity: AlertSeverity
    
    title: str
    message: str
    
    # Context
    node_id: Optional[str] = Field(foreign_key="nodes.node_id", default=None)
    task_id: Optional[str] = Field(foreign_key="tasks.task_id", default=None)
    
    # Status
    acknowledged: bool = False
    resolved: bool = False
    resolved_at: Optional[datetime] = None
    
    # Additional data
    context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

# Configuration Models
class SystemConfig(TimestampedModel, table=True):
    __tablename__ = "system_config"
    
    key: str = Field(primary_key=True)
    value: Dict[str, Any] = Field(sa_column=Column(JSON))
    description: Optional[str] = None
    category: str = "general"
    
    # Validation
    schema: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    is_sensitive: bool = False  # For passwords, API keys, etc.
