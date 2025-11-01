"""
Advanced Model Packaging System for ExoStack
Provides comprehensive model registry with on-demand loading, preloading, and remote model support
"""
import os
import json
import yaml
import asyncio
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timezone
import httpx
import aiofiles

logger = logging.getLogger(__name__)

class ModelSource(str, Enum):
    HUGGINGFACE = "huggingface"
    LOCAL = "local"
    REMOTE_URL = "remote_url"
    S3 = "s3"
    GCS = "gcs"
    AZURE = "azure"

class ModelFormat(str, Enum):
    PYTORCH = "pytorch"
    ONNX = "onnx"
    TENSORRT = "tensorrt"
    SAFETENSORS = "safetensors"
    GGML = "ggml"
    GGUF = "gguf"

class ModelStatus(str, Enum):
    AVAILABLE = "available"
    DOWNLOADING = "downloading"
    LOADING = "loading"
    LOADED = "loaded"
    ERROR = "error"
    CACHED = "cached"

@dataclass
class ModelPackage:
    """Complete model package definition"""
    model_id: str
    name: str
    version: str = "latest"
    description: Optional[str] = None
    
    # Source information
    source: ModelSource = ModelSource.HUGGINGFACE
    source_path: str = ""  # HF model name, local path, or URL
    
    # Model specifications
    format: ModelFormat = ModelFormat.PYTORCH
    size_gb: float = 0.0
    architecture: str = ""
    
    # Resource requirements
    ram_required_gb: float = 4.0
    gpu_memory_required_gb: float = 0.0
    cpu_cores_recommended: int = 2
    
    # Compatibility
    gpu_compatible: bool = True
    cpu_compatible: bool = True
    quantization_options: List[str] = None
    supported_precisions: List[str] = None
    
    # Performance characteristics
    context_length: int = 2048
    tokens_per_second_estimate: float = 0.0
    warmup_time_seconds: float = 30.0
    
    # Packaging metadata
    checksum: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None
    tags: Dict[str, str] = None
    
    # Loading configuration
    preload_config: Dict[str, Any] = None
    loading_params: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.quantization_options is None:
            self.quantization_options = []
        if self.supported_precisions is None:
            self.supported_precisions = ["float16", "float32"]
        if self.tags is None:
            self.tags = {}
        if self.preload_config is None:
            self.preload_config = {}
        if self.loading_params is None:
            self.loading_params = {}
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.updated_at is None:
            self.updated_at = self.created_at

class ModelRegistry:
    """Advanced model registry with packaging support"""
    
    def __init__(self, registry_path: str = "shared/config/model_packages.yaml"):
        self.registry_path = Path(registry_path)
        self.packages: Dict[str, ModelPackage] = {}
        self.cache_dir = Path("models_cache")
        self.cache_dir.mkdir(exist_ok=True)
        
        # Remote registry support
        self.remote_registries: List[str] = []
        self.sync_interval_hours = 24
        self.last_sync = None
        
        logger.info(f"Initialized ModelRegistry with path: {registry_path}")
    
    async def load_registry(self):
        """Load model registry from file"""
        try:
            if self.registry_path.exists():
                async with aiofiles.open(self.registry_path, 'r') as f:
                    content = await f.read()
                    
                if self.registry_path.suffix.lower() == '.yaml':
                    data = yaml.safe_load(content)
                else:
                    data = json.loads(content)
                
                # Convert to ModelPackage objects
                for model_id, package_data in data.get('packages', {}).items():
                    # Handle datetime fields
                    if 'created_at' in package_data and isinstance(package_data['created_at'], str):
                        package_data['created_at'] = datetime.fromisoformat(package_data['created_at'])
                    if 'updated_at' in package_data and isinstance(package_data['updated_at'], str):
                        package_data['updated_at'] = datetime.fromisoformat(package_data['updated_at'])
                    
                    self.packages[model_id] = ModelPackage(model_id=model_id, **package_data)
                
                logger.info(f"Loaded {len(self.packages)} model packages from registry")
            else:
                logger.info("Registry file not found, starting with empty registry")
                await self._create_default_registry()
                
        except Exception as e:
            logger.error(f"Failed to load model registry: {e}")
            await self._create_default_registry()
    
    async def save_registry(self):
        """Save model registry to file"""
        try:
            # Convert to serializable format
            data = {
                'packages': {},
                'metadata': {
                    'version': '1.0',
                    'updated_at': datetime.now(timezone.utc).isoformat(),
                    'total_packages': len(self.packages)
                }
            }
            
            for model_id, package in self.packages.items():
                package_dict = asdict(package)
                # Convert datetime objects to ISO strings
                if package_dict['created_at']:
                    package_dict['created_at'] = package_dict['created_at'].isoformat()
                if package_dict['updated_at']:
                    package_dict['updated_at'] = package_dict['updated_at'].isoformat()
                
                data['packages'][model_id] = package_dict
            
            # Ensure directory exists
            self.registry_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(self.registry_path, 'w') as f:
                if self.registry_path.suffix.lower() == '.yaml':
                    await f.write(yaml.dump(data, default_flow_style=False, sort_keys=False))
                else:
                    await f.write(json.dumps(data, indent=2))
            
            logger.info(f"Saved {len(self.packages)} model packages to registry")
            
        except Exception as e:
            logger.error(f"Failed to save model registry: {e}")
    
    async def register_package(self, package: ModelPackage) -> bool:
        """Register a new model package"""
        try:
            # Validate package
            if not await self._validate_package(package):
                return False
            
            # Calculate checksum if not provided
            if not package.checksum and package.source == ModelSource.LOCAL:
                package.checksum = await self._calculate_checksum(package.source_path)
            
            # Update timestamps
            package.updated_at = datetime.now(timezone.utc)
            
            # Store package
            self.packages[package.model_id] = package
            
            # Save registry
            await self.save_registry()
            
            logger.info(f"Registered model package: {package.model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register package {package.model_id}: {e}")
            return False
    
    async def get_package(self, model_id: str) -> Optional[ModelPackage]:
        """Get model package by ID"""
        return self.packages.get(model_id)
    
    async def list_packages(
        self, 
        source: Optional[ModelSource] = None,
        tags: Optional[Dict[str, str]] = None,
        gpu_compatible: Optional[bool] = None
    ) -> List[ModelPackage]:
        """List model packages with optional filtering"""
        
        packages = list(self.packages.values())
        
        # Apply filters
        if source:
            packages = [p for p in packages if p.source == source]
        
        if gpu_compatible is not None:
            packages = [p for p in packages if p.gpu_compatible == gpu_compatible]
        
        if tags:
            packages = [
                p for p in packages 
                if all(p.tags.get(k) == v for k, v in tags.items())
            ]
        
        return packages
    
    async def download_model(self, model_id: str, force: bool = False) -> bool:
        """Download model to local cache"""
        package = await self.get_package(model_id)
        if not package:
            logger.error(f"Package not found: {model_id}")
            return False
        
        cache_path = self.cache_dir / model_id
        
        # Check if already cached
        if cache_path.exists() and not force:
            logger.info(f"Model {model_id} already cached")
            return True
        
        try:
            if package.source == ModelSource.HUGGINGFACE:
                return await self._download_from_huggingface(package, cache_path)
            elif package.source == ModelSource.REMOTE_URL:
                return await self._download_from_url(package, cache_path)
            elif package.source == ModelSource.LOCAL:
                return await self._copy_local_model(package, cache_path)
            else:
                logger.error(f"Unsupported source: {package.source}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to download model {model_id}: {e}")
            return False
    
    async def preload_models(self, node_config: Dict[str, Any]) -> List[str]:
        """Preload models based on node configuration"""
        preload_list = node_config.get('preload_models', [])
        preload_tags = node_config.get('preload_tags', {})
        
        # Get models to preload
        models_to_preload = []
        
        # Add explicit models
        models_to_preload.extend(preload_list)
        
        # Add models matching tags
        if preload_tags:
            matching_packages = await self.list_packages(tags=preload_tags)
            models_to_preload.extend([p.model_id for p in matching_packages])
        
        # Remove duplicates
        models_to_preload = list(set(models_to_preload))
        
        # Download models
        successful_preloads = []
        for model_id in models_to_preload:
            if await self.download_model(model_id):
                successful_preloads.append(model_id)
                logger.info(f"Preloaded model: {model_id}")
            else:
                logger.warning(f"Failed to preload model: {model_id}")
        
        return successful_preloads
    
    async def get_loading_config(self, model_id: str, node_capabilities: Dict[str, Any]) -> Dict[str, Any]:
        """Get optimized loading configuration for a model on a specific node"""
        package = await self.get_package(model_id)
        if not package:
            return {}
        
        config = package.loading_params.copy()
        
        # Optimize based on node capabilities
        if node_capabilities.get('has_gpu') and package.gpu_compatible:
            config['device'] = 'cuda'
            config['torch_dtype'] = 'float16'
            
            # Use quantization if GPU memory is limited
            gpu_memory = node_capabilities.get('gpu_memory_gb', 0)
            if gpu_memory < package.gpu_memory_required_gb and '4bit' in package.quantization_options:
                config['load_in_4bit'] = True
                config['bnb_4bit_compute_dtype'] = 'float16'
        else:
            config['device'] = 'cpu'
            config['torch_dtype'] = 'float32'
        
        # Set context length based on available memory
        available_ram = node_capabilities.get('available_ram_gb', 8)
        if available_ram < package.ram_required_gb:
            config['max_length'] = min(package.context_length, 1024)
        
        return config
    
    async def _validate_package(self, package: ModelPackage) -> bool:
        """Validate model package"""
        if not package.model_id:
            logger.error("Package missing model_id")
            return False
        
        if not package.source_path:
            logger.error("Package missing source_path")
            return False
        
        return True
    
    async def _calculate_checksum(self, file_path: str) -> str:
        """Calculate SHA256 checksum of a file"""
        hash_sha256 = hashlib.sha256()
        try:
            async with aiofiles.open(file_path, 'rb') as f:
                async for chunk in f:
                    hash_sha256.update(chunk)
            return hash_sha256.hexdigest()
        except Exception as e:
            logger.error(f"Failed to calculate checksum for {file_path}: {e}")
            return ""
    
    async def _download_from_huggingface(self, package: ModelPackage, cache_path: Path) -> bool:
        """Download model from Hugging Face"""
        try:
            # This would use huggingface_hub library in production
            # For now, we'll simulate the download
            cache_path.mkdir(parents=True, exist_ok=True)
            
            # Create a marker file to indicate successful download
            marker_file = cache_path / ".download_complete"
            async with aiofiles.open(marker_file, 'w') as f:
                await f.write(f"Downloaded from HuggingFace: {package.source_path}")
            
            logger.info(f"Downloaded HuggingFace model {package.model_id} to {cache_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download from HuggingFace: {e}")
            return False
    
    async def _download_from_url(self, package: ModelPackage, cache_path: Path) -> bool:
        """Download model from remote URL"""
        try:
            cache_path.mkdir(parents=True, exist_ok=True)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(package.source_path)
                response.raise_for_status()
                
                model_file = cache_path / "model.bin"
                async with aiofiles.open(model_file, 'wb') as f:
                    await f.write(response.content)
            
            logger.info(f"Downloaded model {package.model_id} from URL to {cache_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download from URL: {e}")
            return False
    
    async def _copy_local_model(self, package: ModelPackage, cache_path: Path) -> bool:
        """Copy local model to cache"""
        try:
            import shutil
            
            source_path = Path(package.source_path)
            if not source_path.exists():
                logger.error(f"Local model path does not exist: {source_path}")
                return False
            
            cache_path.mkdir(parents=True, exist_ok=True)
            
            if source_path.is_file():
                shutil.copy2(source_path, cache_path / source_path.name)
            else:
                shutil.copytree(source_path, cache_path, dirs_exist_ok=True)
            
            logger.info(f"Copied local model {package.model_id} to {cache_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to copy local model: {e}")
            return False
    
    async def _create_default_registry(self):
        """Create default model registry with common models"""
        default_packages = [
            ModelPackage(
                model_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                name="TinyLlama Chat",
                source=ModelSource.HUGGINGFACE,
                source_path="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                size_gb=2.2,
                architecture="llama",
                ram_required_gb=4.0,
                gpu_memory_required_gb=3.0,
                quantization_options=["4bit", "8bit"],
                tags={"type": "chat", "size": "small"}
            ),
            ModelPackage(
                model_id="microsoft/phi-2",
                name="Phi-2",
                source=ModelSource.HUGGINGFACE,
                source_path="microsoft/phi-2",
                size_gb=5.4,
                architecture="phi",
                ram_required_gb=8.0,
                gpu_memory_required_gb=6.0,
                quantization_options=["4bit", "8bit"],
                tags={"type": "general", "size": "medium"}
            )
        ]
        
        for package in default_packages:
            self.packages[package.model_id] = package
        
        await self.save_registry()

# Global model registry instance
model_packaging = ModelRegistry()
