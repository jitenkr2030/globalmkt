"""
Fine-tuning Manager for ExoStack - Axolotl Integration Preparation
Provides infrastructure for distributed fine-tuning with checkpoint tracking
"""
import os
import json
import logging
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class FineTuningStatus(str, Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    TRAINING = "training"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class FineTuningConfig:
    """Configuration for fine-tuning job"""
    job_id: str
    base_model: str
    dataset_path: str
    output_dir: str
    
    # Training parameters
    learning_rate: float = 2e-4
    batch_size: int = 4
    gradient_accumulation_steps: int = 4
    num_epochs: int = 3
    max_seq_length: int = 2048
    
    # LoRA parameters
    use_lora: bool = True
    lora_r: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.1
    
    # Quantization
    use_4bit: bool = True
    use_8bit: bool = False
    
    # Checkpointing
    save_steps: int = 500
    eval_steps: int = 100
    logging_steps: int = 10
    
    # Resources
    requires_gpu: bool = True
    min_gpu_memory_gb: float = 8.0
    preferred_gpu_count: int = 1
    
    # Metadata
    created_at: datetime = datetime.now()
    created_by: str = "system"
    description: str = ""

@dataclass
class FineTuningJob:
    """Fine-tuning job tracking"""
    config: FineTuningConfig
    status: FineTuningStatus = FineTuningStatus.PENDING
    assigned_node: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    current_epoch: int = 0
    current_step: int = 0
    total_steps: int = 0
    loss: Optional[float] = None
    eval_loss: Optional[float] = None
    checkpoints: List[str] = None
    logs: List[Dict[str, Any]] = None
    error: Optional[str] = None
    
    def __post_init__(self):
        if self.checkpoints is None:
            self.checkpoints = []
        if self.logs is None:
            self.logs = []

class FineTuningManager:
    """Manager for fine-tuning jobs and Axolotl integration"""
    
    def __init__(self, base_dir: str = "./finetuning"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
        
        self.jobs_dir = self.base_dir / "jobs"
        self.jobs_dir.mkdir(exist_ok=True)
        
        self.checkpoints_dir = self.base_dir / "checkpoints"
        self.checkpoints_dir.mkdir(exist_ok=True)
        
        self.active_jobs: Dict[str, FineTuningJob] = {}
        self.job_history: List[FineTuningJob] = []
        
        logger.info(f"Initialized FineTuningManager with base_dir: {self.base_dir}")
    
    async def create_job(self, config: FineTuningConfig) -> str:
        """Create a new fine-tuning job"""
        try:
            job = FineTuningJob(config=config)
            
            # Create job directory
            job_dir = self.jobs_dir / config.job_id
            job_dir.mkdir(exist_ok=True)
            
            # Save job configuration
            config_path = job_dir / "config.json"
            with open(config_path, 'w') as f:
                json.dump(asdict(config), f, indent=2, default=str)
            
            # Track job
            self.active_jobs[config.job_id] = job
            
            logger.info(f"Created fine-tuning job {config.job_id}")
            return config.job_id
            
        except Exception as e:
            logger.error(f"Failed to create fine-tuning job: {e}")
            raise
    
    async def start_job(self, job_id: str, node_id: str) -> bool:
        """Start a fine-tuning job on a specific node"""
        try:
            if job_id not in self.active_jobs:
                logger.error(f"Job {job_id} not found")
                return False
            
            job = self.active_jobs[job_id]
            job.status = FineTuningStatus.PREPARING
            job.assigned_node = node_id
            job.start_time = datetime.now()
            
            # TODO: Implement actual Axolotl integration
            # This would involve:
            # 1. Preparing Axolotl configuration
            # 2. Sending job to assigned node
            # 3. Starting training process
            
            logger.info(f"Started fine-tuning job {job_id} on node {node_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start job {job_id}: {e}")
            return False
    
    async def update_job_progress(self, job_id: str, progress_data: Dict[str, Any]):
        """Update job progress from training node"""
        try:
            if job_id not in self.active_jobs:
                logger.warning(f"Job {job_id} not found for progress update")
                return
            
            job = self.active_jobs[job_id]
            
            # Update progress
            job.current_epoch = progress_data.get('epoch', job.current_epoch)
            job.current_step = progress_data.get('step', job.current_step)
            job.total_steps = progress_data.get('total_steps', job.total_steps)
            job.loss = progress_data.get('loss', job.loss)
            job.eval_loss = progress_data.get('eval_loss', job.eval_loss)
            
            # Add log entry
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "epoch": job.current_epoch,
                "step": job.current_step,
                "loss": job.loss,
                "eval_loss": job.eval_loss
            }
            job.logs.append(log_entry)
            
            # Update status
            if progress_data.get('status'):
                job.status = FineTuningStatus(progress_data['status'])
            
            logger.debug(f"Updated progress for job {job_id}: epoch {job.current_epoch}, step {job.current_step}")
            
        except Exception as e:
            logger.error(f"Failed to update job progress: {e}")
    
    async def save_checkpoint(self, job_id: str, checkpoint_path: str):
        """Register a new checkpoint for a job"""
        try:
            if job_id not in self.active_jobs:
                logger.warning(f"Job {job_id} not found for checkpoint save")
                return
            
            job = self.active_jobs[job_id]
            job.checkpoints.append(checkpoint_path)
            
            logger.info(f"Saved checkpoint for job {job_id}: {checkpoint_path}")
            
        except Exception as e:
            logger.error(f"Failed to save checkpoint: {e}")
    
    async def complete_job(self, job_id: str, final_model_path: Optional[str] = None):
        """Mark a job as completed"""
        try:
            if job_id not in self.active_jobs:
                logger.warning(f"Job {job_id} not found for completion")
                return
            
            job = self.active_jobs[job_id]
            job.status = FineTuningStatus.COMPLETED
            job.end_time = datetime.now()
            
            if final_model_path:
                job.checkpoints.append(final_model_path)
            
            # Move to history
            self.job_history.append(job)
            del self.active_jobs[job_id]
            
            logger.info(f"Completed fine-tuning job {job_id}")
            
        except Exception as e:
            logger.error(f"Failed to complete job: {e}")
    
    async def cancel_job(self, job_id: str):
        """Cancel a running job"""
        try:
            if job_id not in self.active_jobs:
                logger.warning(f"Job {job_id} not found for cancellation")
                return
            
            job = self.active_jobs[job_id]
            job.status = FineTuningStatus.CANCELLED
            job.end_time = datetime.now()
            
            # TODO: Send cancellation signal to training node
            
            # Move to history
            self.job_history.append(job)
            del self.active_jobs[job_id]
            
            logger.info(f"Cancelled fine-tuning job {job_id}")
            
        except Exception as e:
            logger.error(f"Failed to cancel job: {e}")
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific job"""
        job = self.active_jobs.get(job_id)
        if not job:
            # Check history
            for historical_job in self.job_history:
                if historical_job.config.job_id == job_id:
                    job = historical_job
                    break
        
        if not job:
            return None
        
        return {
            "job_id": job_id,
            "status": job.status.value,
            "assigned_node": job.assigned_node,
            "progress": {
                "current_epoch": job.current_epoch,
                "current_step": job.current_step,
                "total_steps": job.total_steps,
                "loss": job.loss,
                "eval_loss": job.eval_loss
            },
            "checkpoints": job.checkpoints,
            "start_time": job.start_time.isoformat() if job.start_time else None,
            "end_time": job.end_time.isoformat() if job.end_time else None,
            "error": job.error
        }
    
    def list_jobs(self) -> Dict[str, Any]:
        """List all jobs (active and historical)"""
        return {
            "active_jobs": [
                {
                    "job_id": job.config.job_id,
                    "status": job.status.value,
                    "base_model": job.config.base_model,
                    "assigned_node": job.assigned_node,
                    "progress": f"{job.current_epoch}/{job.config.num_epochs} epochs"
                }
                for job in self.active_jobs.values()
            ],
            "completed_jobs": [
                {
                    "job_id": job.config.job_id,
                    "status": job.status.value,
                    "base_model": job.config.base_model,
                    "completed_at": job.end_time.isoformat() if job.end_time else None
                }
                for job in self.job_history
            ]
        }

# Global instance
finetuning_manager = FineTuningManager()
