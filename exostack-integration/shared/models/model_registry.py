"""
Model Registry Manager for ExoStack
Handles model metadata, capabilities, and configuration management
"""
import yaml
import json
import logging
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from dataclasses import dataclass, asdict
from shared.config.env import MODEL_REGISTRY_PATH

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for a model in the registry"""
    hf_repo: str
    type: str
    size_gb: float
    min_ram_gb: int
    recommended_ram_gb: int
    quantized_versions: List[str]
    supports_gpu: bool
    supports_cpu: bool
    description: str
    tags: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ModelConfig':
        return cls(**data)
    
    def is_compatible_with_resources(self, available_ram_gb: float, has_gpu: bool) -> bool:
        """Check if model is compatible with available resources"""
        if available_ram_gb < self.min_ram_gb:
            return False
        
        if not has_gpu and not self.supports_cpu:
            return False
            
        return True
    
    def get_best_quantization(self, available_ram_gb: float) -> Optional[str]:
        """Get the best quantization option for available resources"""
        if available_ram_gb >= self.recommended_ram_gb:
            return None  # No quantization needed
        
        # Prefer 8bit over 4bit for better quality when possible
        if available_ram_gb >= self.min_ram_gb * 1.5 and "8bit" in self.quantized_versions:
            return "8bit"
        elif "4bit" in self.quantized_versions:
            return "4bit"
        elif "q4_0" in self.quantized_versions:
            return "q4_0"
        elif self.quantized_versions:
            return self.quantized_versions[0]
        
        return None

class ModelRegistry:
    """Manages the model registry and provides model lookup functionality"""
    
    def __init__(self, registry_path: Optional[str] = None):
        self.registry_path = Path(registry_path or MODEL_REGISTRY_PATH)
        self.models: Dict[str, ModelConfig] = {}
        self.categories: Dict[str, List[str]] = {}
        self.defaults: Dict[str, Any] = {}
        self._load_registry()
    
    def _load_registry(self) -> None:
        """Load the model registry from file"""
        try:
            if not self.registry_path.exists():
                logger.warning(f"Model registry not found at {self.registry_path}")
                self._create_default_registry()
                return
            
            with open(self.registry_path, 'r') as f:
                if self.registry_path.suffix.lower() == '.yaml':
                    data = yaml.safe_load(f)
                else:
                    data = json.load(f)
            
            # Load models
            for model_id, model_data in data.get('models', {}).items():
                self.models[model_id] = ModelConfig.from_dict(model_data)
            
            # Load categories and defaults
            self.categories = data.get('categories', {})
            self.defaults = data.get('defaults', {})
            
            logger.info(f"Loaded {len(self.models)} models from registry")
            
        except Exception as e:
            logger.error(f"Failed to load model registry: {e}")
            self._create_default_registry()
    
    def _create_default_registry(self) -> None:
        """Create a minimal default registry"""
        default_model = ModelConfig(
            hf_repo="microsoft/DialoGPT-medium",
            type="causal_lm",
            size_gb=1.4,
            min_ram_gb=3,
            recommended_ram_gb=6,
            quantized_versions=["8bit"],
            supports_gpu=True,
            supports_cpu=True,
            description="Default conversational model",
            tags=["default", "conversation"]
        )
        
        self.models = {"dialogpt_medium": default_model}
        self.categories = {"default": ["dialogpt_medium"]}
        self.defaults = {
            "quantization": "8bit",
            "torch_dtype": "auto",
            "trust_remote_code": True
        }
        
        logger.info("Created default model registry")
    
    def get_model(self, model_id: str) -> Optional[ModelConfig]:
        """Get model configuration by ID"""
        return self.models.get(model_id)
    
    def list_models(self, category: Optional[str] = None, 
                   compatible_with: Optional[Dict[str, Any]] = None) -> List[str]:
        """List available models, optionally filtered by category or compatibility"""
        models = list(self.models.keys())
        
        if category and category in self.categories:
            models = [m for m in models if m in self.categories[category]]
        
        if compatible_with:
            available_ram = compatible_with.get('ram_gb', 0)
            has_gpu = compatible_with.get('has_gpu', False)
            
            compatible_models = []
            for model_id in models:
                model_config = self.models[model_id]
                if model_config.is_compatible_with_resources(available_ram, has_gpu):
                    compatible_models.append(model_id)
            models = compatible_models
        
        return models
    
    def get_recommended_model(self, available_ram_gb: float, has_gpu: bool, 
                            task_type: Optional[str] = None) -> Optional[str]:
        """Get the best recommended model for given resources and task"""
        compatible_models = self.list_models(
            compatible_with={'ram_gb': available_ram_gb, 'has_gpu': has_gpu}
        )
        
        if not compatible_models:
            return None
        
        # Sort by size (larger is generally better, but within resource constraints)
        model_scores = []
        for model_id in compatible_models:
            model_config = self.models[model_id]
            
            # Base score from model size
            score = model_config.size_gb
            
            # Bonus for GPU models if GPU is available
            if has_gpu and model_config.supports_gpu:
                score += 5
            
            # Bonus for task-specific models
            if task_type and task_type in model_config.tags:
                score += 10
            
            # Penalty for over-quantization
            if available_ram_gb < model_config.recommended_ram_gb:
                score -= 2
            
            model_scores.append((model_id, score))
        
        # Return the highest scoring model
        model_scores.sort(key=lambda x: x[1], reverse=True)
        return model_scores[0][0]
    
    def get_loading_config(self, model_id: str, available_ram_gb: float, 
                          has_gpu: bool) -> Dict[str, Any]:
        """Get optimized loading configuration for a model"""
        model_config = self.get_model(model_id)
        if not model_config:
            raise ValueError(f"Model {model_id} not found in registry")
        
        config = self.defaults.copy()
        config.update({
            'model_name_or_path': model_config.hf_repo,
            'torch_dtype': 'auto',
            'device_map': 'auto' if has_gpu else 'cpu'
        })
        
        # Add quantization if needed
        quantization = model_config.get_best_quantization(available_ram_gb)
        if quantization:
            if quantization in ['4bit', '8bit']:
                config[f'load_in_{quantization}'] = True
            else:
                config['quantization'] = quantization
        
        return config
    
    def reload_registry(self) -> None:
        """Reload the registry from file"""
        self._load_registry()
    
    def add_model(self, model_id: str, model_config: ModelConfig) -> None:
        """Add a new model to the registry"""
        self.models[model_id] = model_config
        logger.info(f"Added model {model_id} to registry")
    
    def remove_model(self, model_id: str) -> bool:
        """Remove a model from the registry"""
        if model_id in self.models:
            del self.models[model_id]
            logger.info(f"Removed model {model_id} from registry")
            return True
        return False

# Global registry instance
model_registry = ModelRegistry()
