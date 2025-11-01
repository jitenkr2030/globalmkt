"""
Enhanced Model Manager with Registry Integration
Handles automatic model loading, caching, and resource management
"""
import os
import gc
import torch
import psutil
import logging
import asyncio
from typing import Dict, Any, Optional, Tuple, Union
from pathlib import Path
from datetime import datetime, timedelta
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    GenerationConfig,
    pipeline
)
from shared.models.model_registry import model_registry, ModelConfig
from shared.config.env import MODEL_CACHE_DIR, MAX_MODEL_MEMORY

logger = logging.getLogger(__name__)

class ModelManager:
    """Enhanced model manager with registry integration and auto-loading"""
    
    def __init__(self):
        self.loaded_models: Dict[str, Dict[str, Any]] = {}
        self.model_cache_dir = Path(MODEL_CACHE_DIR)
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        self.max_memory_gb = MAX_MODEL_MEMORY / 1024  # Convert MB to GB
        self.last_used: Dict[str, datetime] = {}
        
        # System resource detection
        self.system_ram_gb = psutil.virtual_memory().total / (1024**3)
        self.has_gpu = torch.cuda.is_available()
        self.gpu_memory_gb = 0
        
        if self.has_gpu:
            try:
                self.gpu_memory_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
                logger.info(f"GPU detected: {self.gpu_memory_gb:.1f}GB VRAM")
            except Exception as e:
                logger.warning(f"Failed to get GPU memory info: {e}")
        
        logger.info(f"System RAM: {self.system_ram_gb:.1f}GB, GPU: {self.has_gpu}")
    
    def get_available_memory(self) -> float:
        """Get currently available system memory in GB"""
        memory = psutil.virtual_memory()
        return memory.available / (1024**3)
    
    def get_model_memory_usage(self, model_id: str) -> float:
        """Get memory usage of a loaded model in GB"""
        if model_id not in self.loaded_models:
            return 0.0
        
        model_info = self.loaded_models[model_id]
        return model_info.get('memory_usage_gb', 0.0)
    
    def get_total_model_memory(self) -> float:
        """Get total memory used by all loaded models"""
        return sum(self.get_model_memory_usage(mid) for mid in self.loaded_models)
    
    async def auto_load_model(self, model_id: str, task_requirements: Optional[Dict[str, Any]] = None) -> bool:
        """Automatically load a model from the registry if not already loaded"""
        try:
            # Check if model is already loaded
            if model_id in self.loaded_models:
                self.last_used[model_id] = datetime.now()
                logger.debug(f"Model {model_id} already loaded")
                return True
            
            # Get model config from registry
            model_config = model_registry.get_model(model_id)
            if not model_config:
                logger.error(f"Model {model_id} not found in registry")
                return False
            
            # Check resource compatibility
            available_memory = self.get_available_memory()
            if not model_config.is_compatible_with_resources(available_memory, self.has_gpu):
                logger.error(f"Insufficient resources for model {model_id}")
                return False
            
            # Free memory if needed
            if not await self._ensure_memory_available(model_config.min_ram_gb):
                logger.error(f"Could not free enough memory for model {model_id}")
                return False
            
            # Load the model
            success = await self._load_model_from_config(model_id, model_config)
            if success:
                self.last_used[model_id] = datetime.now()
                logger.info(f"Successfully auto-loaded model {model_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to auto-load model {model_id}: {e}")
            return False
    
    async def _load_model_from_config(self, model_id: str, model_config: ModelConfig) -> bool:
        """Load a model using its registry configuration"""
        try:
            available_memory = self.get_available_memory()
            loading_config = model_registry.get_loading_config(
                model_id, available_memory, self.has_gpu
            )
            
            logger.info(f"Loading model {model_id} with config: {loading_config}")
            
            # Create model-specific cache directory
            model_cache_path = self.model_cache_dir / model_id
            model_cache_path.mkdir(exist_ok=True)
            
            # Load tokenizer
            tokenizer = await asyncio.to_thread(
                AutoTokenizer.from_pretrained,
                model_config.hf_repo,
                cache_dir=str(model_cache_path),
                trust_remote_code=loading_config.get('trust_remote_code', True)
            )
            
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            # Prepare model loading arguments
            model_kwargs = {
                'cache_dir': str(model_cache_path),
                'trust_remote_code': loading_config.get('trust_remote_code', True),
                'torch_dtype': loading_config.get('torch_dtype', 'auto'),
                'device_map': loading_config.get('device_map', 'auto')
            }
            
            # Add quantization settings
            if loading_config.get('load_in_4bit'):
                model_kwargs['load_in_4bit'] = True
            elif loading_config.get('load_in_8bit'):
                model_kwargs['load_in_8bit'] = True
            
            # Load model
            memory_before = psutil.virtual_memory().used / (1024**3)
            
            model = await asyncio.to_thread(
                AutoModelForCausalLM.from_pretrained,
                model_config.hf_repo,
                **model_kwargs
            )
            
            memory_after = psutil.virtual_memory().used / (1024**3)
            memory_usage = memory_after - memory_before
            
            # Store model information
            self.loaded_models[model_id] = {
                'model': model,
                'tokenizer': tokenizer,
                'config': model_config,
                'loading_config': loading_config,
                'memory_usage_gb': memory_usage,
                'loaded_at': datetime.now(),
                'device': str(model.device) if hasattr(model, 'device') else 'unknown'
            }
            
            logger.info(f"Model {model_id} loaded successfully, using {memory_usage:.2f}GB")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model {model_id}: {e}")
            return False
    
    async def _ensure_memory_available(self, required_gb: float) -> bool:
        """Ensure enough memory is available by unloading models if necessary"""
        available_memory = self.get_available_memory()
        
        if available_memory >= required_gb:
            return True
        
        # Calculate how much memory we need to free
        memory_to_free = required_gb - available_memory + 1.0  # 1GB buffer
        
        # Sort models by last used time (oldest first)
        models_by_age = sorted(
            self.loaded_models.keys(),
            key=lambda x: self.last_used.get(x, datetime.min)
        )
        
        freed_memory = 0.0
        for model_id in models_by_age:
            if freed_memory >= memory_to_free:
                break
            
            model_memory = self.get_model_memory_usage(model_id)
            await self.unload_model(model_id)
            freed_memory += model_memory
            
            logger.info(f"Unloaded model {model_id} to free {model_memory:.2f}GB")
        
        # Force garbage collection
        gc.collect()
        if self.has_gpu:
            torch.cuda.empty_cache()
        
        return freed_memory >= memory_to_free
    
    async def unload_model(self, model_id: str) -> bool:
        """Unload a specific model from memory"""
        try:
            if model_id not in self.loaded_models:
                return True
            
            model_info = self.loaded_models[model_id]
            
            # Delete model and tokenizer
            del model_info['model']
            del model_info['tokenizer']
            del self.loaded_models[model_id]
            
            if model_id in self.last_used:
                del self.last_used[model_id]
            
            # Force cleanup
            gc.collect()
            if self.has_gpu:
                torch.cuda.empty_cache()
            
            logger.info(f"Unloaded model {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to unload model {model_id}: {e}")
            return False
    
    def get_loaded_models(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all loaded models"""
        result = {}
        for model_id, model_info in self.loaded_models.items():
            result[model_id] = {
                'config': model_info['config'].to_dict(),
                'memory_usage_gb': model_info['memory_usage_gb'],
                'loaded_at': model_info['loaded_at'].isoformat(),
                'device': model_info['device'],
                'last_used': self.last_used.get(model_id, datetime.min).isoformat()
            }
        return result
    
    def get_model_for_inference(self, model_id: str) -> Optional[Tuple[Any, Any]]:
        """Get model and tokenizer for inference"""
        if model_id not in self.loaded_models:
            return None
        
        model_info = self.loaded_models[model_id]
        self.last_used[model_id] = datetime.now()
        
        return model_info['model'], model_info['tokenizer']
    
    def get_recommended_model(self, task_type: Optional[str] = None) -> Optional[str]:
        """Get the best recommended model for current resources and task"""
        return model_registry.get_recommended_model(
            self.get_available_memory(),
            self.has_gpu,
            task_type
        )
    
    async def cleanup_old_models(self, max_age_hours: int = 24) -> None:
        """Clean up models that haven't been used for a while"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        models_to_unload = [
            model_id for model_id, last_used in self.last_used.items()
            if last_used < cutoff_time
        ]
        
        for model_id in models_to_unload:
            await self.unload_model(model_id)
            logger.info(f"Cleaned up old model {model_id}")

# Global model manager instance
model_manager = ModelManager()
