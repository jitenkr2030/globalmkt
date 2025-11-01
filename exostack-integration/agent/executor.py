"""
Enhanced Model Executor with distributed execution support and registry integration
"""
import os
import time
import logging
import json
import torch
import psutil
import asyncio
from typing import Dict, Any, Optional, List, Tuple, AsyncGenerator
from datetime import datetime
from pathlib import Path
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    GenerationConfig,
    pipeline,
    TextIteratorStreamer
)
from threading import Thread
from shared.config.env import (
    DEFAULT_MODEL,
    MODEL_CACHE_DIR,
    MAX_MODEL_MEMORY
)
from .model_manager import model_manager

logger = logging.getLogger(__name__)

class InferenceEngine:
    """Enhanced inference engine with automatic model loading and registry integration"""

    def __init__(self):
        self.model_manager = model_manager
        logger.info("Initialized InferenceEngine with model registry support")

    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process an inference task with automatic model loading"""
        try:
            task_id = task_data.get("id", "unknown")
            model_id = task_data.get("model", "auto")
            input_text = task_data.get("input", "")
            parameters = task_data.get("parameters", {})

            logger.info(f"Processing task {task_id} with model {model_id}")

            # Auto-select model if not specified
            if model_id == "auto":
                task_type = task_data.get("task_type", "text-generation")
                model_id = self.model_manager.get_recommended_model(task_type)
                if not model_id:
                    raise ValueError("No suitable model found for current resources")
                logger.info(f"Auto-selected model: {model_id}")

            # Auto-load model if not already loaded
            if not await self.model_manager.auto_load_model(model_id, task_data):
                raise ValueError(f"Failed to load model {model_id}")

            # Get model and tokenizer for inference
            model_tokenizer = self.model_manager.get_model_for_inference(model_id)
            if not model_tokenizer:
                raise ValueError(f"Model {model_id} not available for inference")

            model, tokenizer = model_tokenizer

            # Perform inference
            result = await self._run_inference(
                model, tokenizer, input_text, parameters
            )

            return {
                "task_id": task_id,
                "model_used": model_id,
                "result": result,
                "status": "completed"
            }

        except Exception as e:
            logger.error(f"Task processing failed: {e}")
            return {
                "task_id": task_data.get("id", "unknown"),
                "error": str(e),
                "status": "failed"
            }

    async def _run_inference(
        self,
        model: Any,
        tokenizer: Any,
        input_text: str,
        parameters: Dict[str, Any]
    ) -> str:
        """Run inference with the loaded model"""
        try:
            # Prepare generation parameters
            generation_config = GenerationConfig(
                max_new_tokens=parameters.get("max_new_tokens", 100),
                temperature=parameters.get("temperature", 0.7),
                top_p=parameters.get("top_p", 0.9),
                do_sample=parameters.get("do_sample", True),
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )

            # Tokenize input
            inputs = await asyncio.to_thread(
                tokenizer.encode,
                input_text,
                return_tensors="pt"
            )

            # Move to appropriate device
            if hasattr(model, 'device'):
                inputs = inputs.to(model.device)

            # Generate response
            with torch.no_grad():
                outputs = await asyncio.to_thread(
                    model.generate,
                    inputs,
                    generation_config=generation_config
                )

            # Decode response
            response = await asyncio.to_thread(
                tokenizer.decode,
                outputs[0][inputs.shape[1]:],
                skip_special_tokens=True
            )

            return response.strip()

        except Exception as e:
            logger.error(f"Inference failed: {e}")
            raise

    def get_model_status(self) -> Dict[str, Any]:
        """Get status of all loaded models"""
        return {
            "loaded_models": self.model_manager.get_loaded_models(),
            "total_memory_usage_gb": self.model_manager.get_total_model_memory(),
            "available_memory_gb": self.model_manager.get_available_memory(),
            "has_gpu": self.model_manager.has_gpu
        }

    async def preload_model(self, model_id: str) -> bool:
        """Preload a specific model"""
        return await self.model_manager.auto_load_model(model_id)

    async def unload_model(self, model_id: str) -> bool:
        """Unload a specific model"""
        return await self.model_manager.unload_model(model_id)

class ShardedModelExecutor:
    """Executor for model shards with resource management"""
    
    def __init__(self, shard_config: Dict[str, Any]):
        self.shard_id = shard_config["shard_id"]
        self.model_name = shard_config["model_name"]
        self.device = self._get_optimal_device()
        self.cache_dir = Path(MODEL_CACHE_DIR) / self.shard_id
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.model = None
        self.tokenizer = None
        self.memory_usage = 0
        self.gpu_memory_usage = 0
        
        logger.info(f"Initialized shard executor {self.shard_id} on {self.device}")

    async def load_shard(self) -> None:
        """Load model shard with resource management"""
        try:
            memory_info = self._check_memory_usage()
            logger.debug(f"Memory before loading shard: {memory_info}")

            # Load tokenizer
            self.tokenizer = await asyncio.to_thread(
                AutoTokenizer.from_pretrained,
                self.model_name,
                cache_dir=self.cache_dir,
                trust_remote_code=True
            )

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            # Configure model loading based on available resources
            model_kwargs = {
                "cache_dir": self.cache_dir,
                "trust_remote_code": True,
                "torch_dtype": (
                    torch.float16 if self.device != "cpu" else torch.float32
                )
            }

            # Load model with appropriate optimization
            if self.device == "cpu" or memory_info.get("cpu_available_gb", 0) < 8:
                try:
                    model_kwargs["load_in_8bit"] = True
                    logger.info("Loading shard with 8-bit quantization")
                except Exception as e:
                    logger.warning(f"8-bit loading failed, using default: {e}")

            self.model = await asyncio.to_thread(
                AutoModelForCausalLM.from_pretrained,
                self.model_name,
                **model_kwargs
            )

            if not model_kwargs.get("load_in_8bit", False):
                self.model = self.model.to(self.device)

            self.model.eval()

            # Update memory usage
            memory_after = self._check_memory_usage()
            self.memory_usage = (
                memory_after.get("cpu_used_gb", 0) -
                memory_info.get("cpu_used_gb", 0)
            )
            self.gpu_memory_usage = memory_after.get("gpu_allocated_gb", 0)

            logger.info(
                f"Shard {self.shard_id} loaded successfully. "
                f"CPU Memory: {self.memory_usage:.2f}GB, "
                f"GPU Memory: {self.gpu_memory_usage:.2f}GB"
            )

        except Exception as e:
            logger.error(f"Error loading shard {self.shard_id}: {e}")
            raise

    async def execute(
        self,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute inference on the shard"""
        try:
            start_time = time.time()
            
            # Prepare input
            input_text = input_data.get("input_segment", "")
            generation_config = input_data.get("parameters", {})
            
            # Tokenize input
            inputs = await asyncio.to_thread(
                self.tokenizer.encode,
                input_text,
                return_tensors="pt"
            )
            inputs = inputs.to(self.device)
            
            # Configure generation
            gen_config = GenerationConfig(
                max_new_tokens=generation_config.get("max_tokens", 100),
                temperature=generation_config.get("temperature", 0.7),
                top_p=generation_config.get("top_p", 0.9),
                do_sample=generation_config.get("temperature", 0.7) > 0,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                repetition_penalty=1.1
            )

            # Generate output
            with torch.no_grad():
                outputs = await asyncio.to_thread(
                    self.model.generate,
                    inputs,
                    generation_config=gen_config,
                    return_dict_in_generate=True,
                    output_scores=True
                )

            # Process output
            generated_tokens = outputs.sequences[0][inputs.shape[1]:]
            response_text = await asyncio.to_thread(
                self.tokenizer.decode,
                generated_tokens,
                skip_special_tokens=True
            )

            # Collect execution metrics
            execution_time = time.time() - start_time
            current_memory = self._check_memory_usage()

            return {
                "shard_id": self.shard_id,
                "position": input_data.get("position", 0),
                "output": response_text.strip(),
                "output_tokens": len(generated_tokens),
                "execution_time": execution_time,
                "memory_used": current_memory.get("cpu_used_gb", 0),
                "gpu_memory_used": current_memory.get("gpu_allocated_gb", 0)
            }

        except Exception as e:
            logger.error(f"Error executing shard {self.shard_id}: {e}")
            raise

    def _get_optimal_device(self) -> str:
        """Determine optimal device for the shard"""
        if torch.cuda.is_available():
            gpu_memory = (
                torch.cuda.get_device_properties(0).total_memory / 1024**3
            )  # GB
            logger.info(f"GPU available with {gpu_memory:.1f}GB memory")
            return "cuda:0"
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            logger.info("Using Apple MPS backend")
            return "mps"
        else:
            logger.info("Using CPU for inference")
            return "cpu"

    def _check_memory_usage(self) -> Dict[str, float]:
        """Check current memory usage"""
        memory_info = {
            "cpu_percent": psutil.virtual_memory().percent,
            "cpu_available_gb": psutil.virtual_memory().available / 1024**3,
            "cpu_used_gb": psutil.virtual_memory().used / 1024**3
        }
        
        if torch.cuda.is_available():
            memory_info.update({
                "gpu_allocated_gb": torch.cuda.memory_allocated() / 1024**3,
                "gpu_reserved_gb": torch.cuda.memory_reserved() / 1024**3
            })
        
        return memory_info

    async def cleanup(self):
        """Clean up shard resources"""
        try:
            if self.model is not None:
                del self.model
            if self.tokenizer is not None:
                del self.tokenizer
            
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            import gc
            gc.collect()
            
            logger.info(f"Cleaned up resources for shard {self.shard_id}")

        except Exception as e:
            logger.error(f"Error cleaning up shard {self.shard_id}: {e}")

    async def stream_generate(self, task_data: Dict[str, Any]) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream generation tokens in real-time"""
        try:
            task_id = task_data.get("id", "unknown")
            model_id = task_data.get("model", "auto")
            input_text = task_data.get("input", "")
            parameters = task_data.get("parameters", {})

            logger.info(f"Starting streaming generation for task {task_id}")

            # Auto-select model if not specified
            if model_id == "auto":
                task_type = task_data.get("task_type", "text-generation")
                model_id = self.model_manager.get_recommended_model(task_type)
                if not model_id:
                    yield {
                        "error": "No suitable model available",
                        "task_id": task_id,
                        "status": "failed"
                    }
                    return

            # Load model if needed
            success = await self.model_manager.auto_load_model(model_id, task_data)
            if not success:
                yield {
                    "error": f"Failed to load model {model_id}",
                    "task_id": task_id,
                    "status": "failed"
                }
                return

            # Get loaded model and tokenizer
            model_info = self.model_manager.get_loaded_model(model_id)
            if not model_info:
                yield {
                    "error": f"Model {model_id} not available after loading",
                    "task_id": task_id,
                    "status": "failed"
                }
                return

            model = model_info["model"]
            tokenizer = model_info["tokenizer"]

            # Prepare generation parameters
            generation_params = {
                "max_new_tokens": parameters.get("max_tokens", 100),
                "temperature": parameters.get("temperature", 0.7),
                "top_p": parameters.get("top_p", 0.9),
                "do_sample": parameters.get("temperature", 0.7) > 0,
                "pad_token_id": tokenizer.eos_token_id,
            }

            # Setup streaming
            streamer = TextIteratorStreamer(
                tokenizer,
                timeout=60.0,
                skip_prompt=True,
                skip_special_tokens=True
            )
            generation_params["streamer"] = streamer

            # Tokenize input
            inputs = tokenizer(input_text, return_tensors="pt")
            if torch.cuda.is_available() and hasattr(model, 'device'):
                inputs = {k: v.to(model.device) for k, v in inputs.items()}

            # Start generation in a separate thread
            generation_kwargs = {**inputs, **generation_params}
            thread = Thread(target=model.generate, kwargs=generation_kwargs)
            thread.start()

            # Yield initial status
            yield {
                "task_id": task_id,
                "status": "streaming",
                "model": model_id,
                "timestamp": datetime.now().isoformat()
            }

            # Stream tokens
            generated_text = ""
            token_count = 0

            try:
                for new_text in streamer:
                    if new_text:
                        generated_text += new_text
                        token_count += 1

                        yield {
                            "task_id": task_id,
                            "status": "streaming",
                            "token": new_text,
                            "partial_text": generated_text,
                            "token_count": token_count,
                            "timestamp": datetime.now().isoformat()
                        }

            except Exception as stream_error:
                logger.error(f"Streaming error: {stream_error}")
                yield {
                    "task_id": task_id,
                    "status": "error",
                    "error": str(stream_error),
                    "timestamp": datetime.now().isoformat()
                }
                return

            # Wait for generation to complete
            thread.join()

            # Final result
            yield {
                "task_id": task_id,
                "status": "completed",
                "result": {
                    "output": generated_text,
                    "tokens_generated": token_count,
                    "model_used": model_id,
                    "processing_time": None  # Could add timing if needed
                },
                "timestamp": datetime.now().isoformat()
            }

            logger.info(f"Completed streaming generation for task {task_id}")

        except Exception as e:
            logger.error(f"Error in streaming generation: {e}")
            yield {
                "task_id": task_data.get("id", "unknown"),
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# Global inference engine instance
inference_engine = InferenceEngine()