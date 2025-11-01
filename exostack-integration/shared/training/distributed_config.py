"""
Distributed Training Configuration for Kronos Indian Stock Market Model
This module provides configuration and utilities for distributed training across ExoStack nodes.
"""

import yaml
import json
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

@dataclass
class TrainingConfig:
    """Configuration for distributed training."""
    
    # Model Configuration
    model_name: str = "kronos-indian-stocks"
    model_version: str = "1.0.0"
    base_model: str = "microsoft/DialoGPT-medium"
    
    # Training Parameters
    epochs: int = 10
    batch_size: int = 32
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_steps: int = 1000
    max_steps: int = 10000
    
    # Distributed Training
    distributed_backend: str = "nccl"  # nccl, gloo, mpi
    num_nodes: int = 5
    gpus_per_node: int = 1
    nodes_per_region: int = 1
    
    # Data Configuration
    data_path: str = "./data/training"
    cache_dir: str = "./cache/training"
    max_sequence_length: int = 512
    train_test_split: float = 0.8
    
    # Indian Market Regions
    regions: List[str] = None
    
    # Checkpointing
    checkpoint_dir: str = "./checkpoints"
    checkpoint_interval: int = 1000
    save_total_limit: int = 3
    
    # Logging and Monitoring
    log_dir: str = "./logs"
    log_interval: int = 100
    eval_interval: int = 500
    
    # Optimization
    mixed_precision: bool = True
    gradient_accumulation_steps: int = 1
    max_grad_norm: float = 1.0
    
    # Federated Learning
    federated_learning: bool = True
    federated_rounds: int = 10
    local_epochs: int = 2
    aggregation_strategy: str = "fedavg"  # fedavg, fedprox, fedsgd
    
    def __post_init__(self):
        if self.regions is None:
            self.regions = ["MUMBAI", "DELHI", "BANGALORE", "CHENNAI", "KOLKATA"]

@dataclass
class RegionConfig:
    """Configuration for specific Indian market regions."""
    
    region_name: str
    symbols: List[str]
    data_sources: List[str]
    node_configs: List[Dict[str, Any]]
    training_priority: int = 1
    data_weight: float = 1.0

class DistributedTrainingManager:
    """Manages distributed training configuration and execution."""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path or "distributed_training_config.yaml"
        self.training_config = self._load_config()
        self.region_configs = self._create_region_configs()
    
    def _load_config(self) -> TrainingConfig:
        """Load training configuration from file."""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    config_data = yaml.safe_load(f)
                return TrainingConfig(**config_data)
            else:
                logger.info(f"Config file {self.config_path} not found, using defaults")
                return TrainingConfig()
        except Exception as e:
            logger.error(f"Failed to load training config: {e}")
            return TrainingConfig()
    
    def _create_region_configs(self) -> Dict[str, RegionConfig]:
        """Create configurations for each Indian market region."""
        region_symbols = {
            "MUMBAI": [
                "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"
            ],
            "DELHI": [
                "HINDUNILVR.NS", "ITC.NS", "BHARTIARTL.NS", "LT.NS", "SBIN.NS"
            ],
            "BANGALORE": [
                "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "TATASTEEL.NS", "JSWSTEEL.NS"
            ],
            "CHENNAI": [
                "TATAMOTORS.NS", "MARUTI.NS", "NESTLEIND.NS", "ASIANPAINT.NS", "HDFC.NS"
            ],
            "KOLKATA": [
                "COALINDIA.NS", "NTPC.NS", "POWERGRID.NS", "ONGC.NS", "BPCL.NS"
            ]
        }
        
        region_configs = {}
        
        for region, symbols in region_symbols.items():
            config = RegionConfig(
                region_name=region,
                symbols=symbols,
                data_sources=["nse", "bse", "yfinance"],
                node_configs=[{
                    "node_id": f"training-node-{region.lower()}",
                    "region": region,
                    "gpu_count": 1,
                    "memory_gb": 16,
                    "priority": 1
                }],
                training_priority=1,
                data_weight=1.0
            )
            region_configs[region] = config
        
        return region_configs
    
    def save_config(self, path: str = None):
        """Save current configuration to file."""
        save_path = path or self.config_path
        
        try:
            with open(save_path, 'w') as f:
                yaml.dump(asdict(self.training_config), f, default_flow_style=False)
            logger.info(f"Configuration saved to {save_path}")
        except Exception as e:
            logger.error(f"Failed to save configuration: {e}")
    
    def generate_training_script(self) -> str:
        """Generate a training script for distributed execution."""
        script_template = '''#!/usr/bin/env python3
"""
Distributed Training Script for Kronos Indian Stock Market Model
This script handles distributed training across ExoStack nodes.
"""

import os
import sys
import torch
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer, 
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
import logging
from pathlib import Path
import json
import time

# Add integration path
sys.path.insert(0, str(Path(__file__).parent / "exostack-integration"))
from shared.models.kronos_model import KronosIndianStockModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_distributed(rank, world_size):
    """Setup distributed training."""
    os.environ['MASTER_ADDR'] = 'localhost'
    os.environ['MASTER_PORT'] = '12355'
    
    # Initialize process group
    dist.init_process_group(
        backend='{distributed_backend}',
        rank=rank,
        world_size=world_size
    )

def cleanup_distributed():
    """Clean up distributed training."""
    dist.destroy_process_group()

class KronosDataset(torch.utils.data.Dataset):
    """Dataset for Kronos model training."""
    
    def __init__(self, data_path, tokenizer, max_length=512):
        self.data_path = data_path
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.data = self._load_data()
    
    def _load_data(self):
        """Load training data."""
        # In production, this would load actual market data
        # For now, we'll generate synthetic data
        return [
            f"Stock symbol: SYMBOL_{i}, Price: {price}, Volume: {volume}, Trend: {trend}"
            for i in range(1000)
        ]
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        text = self.data[idx]
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': encoding['input_ids'].squeeze()
        }

def train(rank, world_size, config):
    """Training function for each process."""
    logger.info(f"Starting training on rank {rank}")
    
    # Setup distributed training
    setup_distributed(rank, world_size)
    
    try:
        # Load model and tokenizer
        model_name = config['model_name']
        base_model = config['base_model']
        
        tokenizer = AutoTokenizer.from_pretrained(base_model)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_pretrained(base_model)
        model = model.to(rank)
        
        # Wrap model with DDP
        model = DDP(model, device_ids=[rank])
        
        # Create dataset and dataloader
        dataset = KronosDataset(
            config['data_path'],
            tokenizer,
            config['max_sequence_length']
        )
        
        sampler = DistributedSampler(
            dataset,
            num_replicas=world_size,
            rank=rank,
            shuffle=True
        )
        
        dataloader = DataLoader(
            dataset,
            batch_size=config['batch_size'],
            sampler=sampler,
            num_workers=4
        )
        
        # Setup optimizer
        optimizer = torch.optim.AdamW(
            model.parameters(),
            lr=config['learning_rate'],
            weight_decay=config['weight_decay']
        )
        
        # Training loop
        model.train()
        global_step = 0
        
        for epoch in range(config['epochs']):
            sampler.set_epoch(epoch)
            
            for batch_idx, batch in enumerate(dataloader):
                # Move data to device
                input_ids = batch['input_ids'].to(rank)
                attention_mask = batch['attention_mask'].to(rank)
                labels = batch['labels'].to(rank)
                
                # Forward pass
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                
                # Backward pass
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), config['max_grad_norm'])
                optimizer.step()
                
                global_step += 1
                
                # Logging
                if rank == 0 and global_step % config['log_interval'] == 0:
                    logger.info(f"Epoch {epoch}, Step {global_step}, Loss: {loss.item():.4f}")
                
                # Save checkpoint
                if rank == 0 and global_step % config['checkpoint_interval'] == 0:
                    save_checkpoint(model, tokenizer, global_step, config)
        
        # Save final model
        if rank == 0:
            save_final_model(model, tokenizer, config)
        
        logger.info(f"Training completed on rank {rank}")
        
    except Exception as e:
        logger.error(f"Training failed on rank {rank}: {e}")
        raise
    finally:
        cleanup_distributed()

def save_checkpoint(model, tokenizer, step, config):
    """Save training checkpoint."""
    checkpoint_dir = Path(config['checkpoint_dir']) / f"checkpoint-{step}"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    
    # Save model state
    if hasattr(model, 'module'):
        model.module.save_pretrained(checkpoint_dir)
    else:
        model.save_pretrained(checkpoint_dir)
    
    # Save tokenizer
    tokenizer.save_pretrained(checkpoint_dir)
    
    # Save config
    with open(checkpoint_dir / "training_config.json", 'w') as f:
        json.dump(config, f, indent=2)
    
    logger.info(f"Checkpoint saved to {checkpoint_dir}")

def save_final_model(model, tokenizer, config):
    """Save final trained model."""
    model_dir = Path(config['checkpoint_dir']) / "final_model"
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Save model
    if hasattr(model, 'module'):
        model.module.save_pretrained(model_dir)
    else:
        model.save_pretrained(model_dir)
    
    # Save tokenizer
    tokenizer.save_pretrained(model_dir)
    
    logger.info(f"Final model saved to {model_dir}")

def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Distributed Training for Kronos Model")
    parser.add_argument("--rank", type=int, required=True, help="Process rank")
    parser.add_argument("--world_size", type=int, required=True, help="World size")
    parser.add_argument("--config", type=str, required=True, help="Configuration file")
    
    args = parser.parse_args()
    
    # Load configuration
    with open(args.config, 'r') as f:
        config = json.load(f)
    
    # Start training
    train(args.rank, args.world_size, config)

if __name__ == "__main__":
    main()
'''
        
        # Replace template variables
        script_content = script_template.format(
            distributed_backend=self.training_config.distributed_backend
        )
        
        return script_content
    
    def generate_node_config(self, region: str) -> Dict[str, Any]:
        """Generate node configuration for a specific region."""
        region_config = self.region_configs.get(region)
        if not region_config:
            raise ValueError(f"Unknown region: {region}")
        
        node_config = {
            "node_id": f"training-node-{region.lower()}",
            "region": region,
            "symbols": region_config.symbols,
            "data_sources": region_config.data_sources,
            "training_config": asdict(self.training_config),
            "environment": {
                "PYTHONPATH": str(Path.cwd()),
                "CUDA_VISIBLE_DEVICES": "0",
                "NCCL_DEBUG": "INFO"
            },
            "resources": {
                "gpu_count": 1,
                "memory_gb": 16,
                "cpu_cores": 8
            }
        }
        
        return node_config
    
    def generate_distributed_command(self, num_nodes: int = None) -> str:
        """Generate command for distributed training."""
        num_nodes = num_nodes or self.training_config.num_nodes
        
        commands = []
        
        for i in range(num_nodes):
            region = self.training_config.regions[i % len(self.training_config.regions)]
            node_config = self.generate_node_config(region)
            
            # Save node config
            config_file = f"node_{region.lower()}_config.json"
            with open(config_file, 'w') as f:
                json.dump(node_config, f, indent=2)
            
            # Generate command
            cmd = f'''
python -m torch.distributed.launch \\
    --nproc_per_node={self.training_config.gpus_per_node} \\
    --nnodes={num_nodes} \\
    --node_rank={i} \\
    --master_addr=localhost \\
    --master_port=12355 \\
    distributed_training.py \\
    --rank={i} \\
    --world_size={num_nodes} \\
    --config={config_file}
            '''
            
            commands.append(f"# Region: {region}\n{cmd}")
        
        return "\n\n".join(commands)
    
    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status."""
        # In a real implementation, this would query the ExoStack hub
        # for training job status
        
        status = {
            "config": asdict(self.training_config),
            "regions": {region: asdict(config) for region, config in self.region_configs.items()},
            "estimated_duration": self._estimate_training_duration(),
            "resource_requirements": self._calculate_resource_requirements()
        }
        
        return status
    
    def _estimate_training_duration(self) -> Dict[str, Any]:
        """Estimate training duration."""
        # Simple estimation based on configuration
        total_steps = self.training_config.max_steps
        steps_per_second = 10  # Conservative estimate
        
        total_seconds = total_steps / steps_per_second
        hours = total_seconds / 3600
        
        return {
            "total_steps": total_steps,
            "estimated_hours": round(hours, 2),
            "estimated_days": round(hours / 24, 2)
        }
    
    def _calculate_resource_requirements(self) -> Dict[str, Any]:
        """Calculate resource requirements."""
        total_gpus = self.training_config.num_nodes * self.training_config.gpus_per_node
        total_memory = total_gpus * 16  # 16GB per GPU
        
        return {
            "total_nodes": self.training_config.num_nodes,
            "total_gpus": total_gpus,
            "total_memory_gb": total_memory,
            "estimated_storage_gb": 50  # For model and data
        }

# Utility functions
def create_training_config(output_path: str = "distributed_training_config.yaml"):
    """Create a default training configuration file."""
    config = TrainingConfig()
    
    with open(output_path, 'w') as f:
        yaml.dump(asdict(config), f, default_flow_style=False)
    
    print(f"Training configuration created: {output_path}")

def main():
    """Main entry point for configuration management."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Distributed Training Configuration")
    parser.add_argument("--create-config", action="store_true", help="Create default config")
    parser.add_argument("--config", help="Configuration file path")
    parser.add_argument("--generate-script", help="Generate training script")
    parser.add_argument("--generate-commands", help="Generate distributed commands")
    parser.add_argument("--region", help="Generate node config for region")
    parser.add_argument("--status", action="store_true", help="Show training status")
    
    args = parser.parse_args()
    
    if args.create_config:
        create_training_config(args.config or "distributed_training_config.yaml")
    
    manager = DistributedTrainingManager(args.config)
    
    if args.generate_script:
        script = manager.generate_training_script()
        with open(args.generate_script, 'w') as f:
            f.write(script)
        print(f"Training script generated: {args.generate_script}")
    
    if args.generate_commands:
        commands = manager.generate_distributed_command()
        print("Distributed training commands:")
        print(commands)
    
    if args.region:
        config = manager.generate_node_config(args.region)
        config_file = f"node_{args.region.lower()}_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"Node config generated: {config_file}")
    
    if args.status:
        status = manager.get_training_status()
        print(json.dumps(status, indent=2))

if __name__ == "__main__":
    main()