import asyncio
import logging
import time
import requests
import psutil
import torch
import json
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from .health_monitor import health_monitor
from .executor import inference_engine
from .model_manager import model_manager
from shared.models.model_registry import model_registry
from shared.config.env import AGENT_ID, HUB_URL, AGENT_HOST, AGENT_PORT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ExoStack Agent", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent_id": AGENT_ID}

@app.get("/health/detailed")
async def get_detailed_health():
    return health_monitor.get_detailed_health()

@app.get("/metrics/detailed")
async def get_detailed_metrics():
    return health_monitor.get_detailed_health()

@app.post("/tasks/execute")
async def execute_task(task_data: dict):
    task_id = task_data.get("id")
    start_time = time.time()
    
    try:
        result = await inference_engine.process_task(task_data)
        duration = time.time() - start_time
        health_monitor.record_task(task_id, "completed", duration)
        return {"status": "completed", "result": result}
        
    except Exception as e:
        duration = time.time() - start_time
        health_monitor.record_task(task_id, "failed", duration)
        return {"status": "failed", "error": str(e)}

@app.post("/inference/stream")
async def stream_inference(task_data: Dict[str, Any]):
    """Stream inference results in real-time using Server-Sent Events"""

    async def generate_stream():
        """Generate SSE stream for inference"""
        try:
            async for chunk in inference_engine.stream_generate(task_data):
                # Format as Server-Sent Events
                data = json.dumps(chunk)
                yield f"data: {data}\n\n"

                # Add small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)

        except Exception as e:
            error_chunk = {
                "task_id": task_data.get("id", "unknown"),
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@app.post("/inference/stream_json")
async def stream_inference_json(task_data: Dict[str, Any]):
    """Stream inference results as JSON chunks"""

    async def generate_json_stream():
        """Generate JSON stream for inference"""
        try:
            async for chunk in inference_engine.stream_generate(task_data):
                yield json.dumps(chunk) + "\n"
                await asyncio.sleep(0.01)

        except Exception as e:
            error_chunk = {
                "task_id": task_data.get("id", "unknown"),
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            yield json.dumps(error_chunk) + "\n"

    return StreamingResponse(
        generate_json_stream(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/ping")
async def ping():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/models/status")
async def get_model_status():
    """Get status of all loaded models"""
    return inference_engine.get_model_status()

@app.post("/models/load")
async def load_model(request: dict):
    """Load a specific model"""
    model_id = request.get("model_id")
    if not model_id:
        raise HTTPException(status_code=400, detail="model_id is required")

    success = await inference_engine.preload_model(model_id)
    if success:
        return {"status": "success", "message": f"Model {model_id} loaded"}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to load model {model_id}")

@app.post("/models/unload")
async def unload_model(request: dict):
    """Unload a specific model"""
    model_id = request.get("model_id")
    if not model_id:
        raise HTTPException(status_code=400, detail="model_id is required")

    success = await inference_engine.unload_model(model_id)
    if success:
        return {"status": "success", "message": f"Model {model_id} unloaded"}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to unload model {model_id}")

@app.get("/models/available")
async def get_available_models():
    """Get list of available models from registry"""
    # Get system resources
    memory = psutil.virtual_memory()
    available_ram_gb = memory.available / (1024**3)
    has_gpu = torch.cuda.is_available()

    # Get compatible models
    compatible_models = model_registry.list_models(
        compatible_with={'ram_gb': available_ram_gb, 'has_gpu': has_gpu}
    )

    return {
        "available_models": compatible_models,
        "system_resources": {
            "available_ram_gb": available_ram_gb,
            "total_ram_gb": memory.total / (1024**3),
            "has_gpu": has_gpu
        }
    }

@app.get("/capabilities")
async def get_capabilities():
    """Get agent capabilities"""
    memory = psutil.virtual_memory()
    available_ram_gb = memory.available / (1024**3)
    total_ram_gb = memory.total / (1024**3)
    has_gpu = torch.cuda.is_available()

    gpu_info = {}
    if has_gpu:
        try:
            gpu_props = torch.cuda.get_device_properties(0)
            gpu_info = {
                "name": gpu_props.name,
                "memory_gb": gpu_props.total_memory / (1024**3),
                "compute_capability": f"{gpu_props.major}.{gpu_props.minor}"
            }
        except Exception as e:
            gpu_info = {"error": str(e)}

    # Get compatible models
    compatible_models = model_registry.list_models(
        compatible_with={'ram_gb': available_ram_gb, 'has_gpu': has_gpu}
    )

    return {
        "agent_id": AGENT_ID,
        "compute_capabilities": {
            "cpu_cores": psutil.cpu_count(),
            "total_ram_gb": total_ram_gb,
            "available_ram_gb": available_ram_gb,
            "has_gpu": has_gpu,
            "gpu_info": gpu_info
        },
        "supported_models": compatible_models,
        "supported_tasks": ["text-generation", "inference", "chat"],
        "max_concurrent_tasks": 5,
        "features": ["auto_model_loading", "model_registry", "resource_management"]
    }

def register_agent(agent_id: str, hub_url: str) -> bool:
    try:
        # Get system capabilities
        memory = psutil.virtual_memory()
        available_ram_gb = memory.available / (1024**3)
        total_ram_gb = memory.total / (1024**3)
        has_gpu = torch.cuda.is_available()

        gpu_info = {}
        if has_gpu:
            try:
                gpu_props = torch.cuda.get_device_properties(0)
                gpu_info = {
                    "name": gpu_props.name,
                    "memory_gb": gpu_props.total_memory / (1024**3),
                    "compute_capability": f"{gpu_props.major}.{gpu_props.minor}"
                }
            except Exception:
                gpu_info = {"available": True}

        # Get compatible models
        compatible_models = model_registry.list_models(
            compatible_with={'ram_gb': available_ram_gb, 'has_gpu': has_gpu}
        )

        registration_data = {
            "id": agent_id,
            "host": AGENT_HOST,
            "port": AGENT_PORT,
            "capabilities": {
                "inference": True,
                "text_generation": True,
                "auto_model_loading": True,
                "streaming": True,
                "model_registry": True
            },
            "compute_resources": {
                "cpu_cores": psutil.cpu_count(),
                "total_ram_gb": total_ram_gb,
                "available_ram_gb": available_ram_gb,
                "has_gpu": has_gpu,
                "gpu_info": gpu_info
            },
            "supported_models": compatible_models,
            "max_concurrent_tasks": 5,
            "features": ["auto_model_loading", "model_registry", "resource_management", "streaming"]
        }

        response = requests.post(
            f"{hub_url}/nodes/register",
            json=registration_data,
            timeout=10
        )

        if response.status_code == 200:
            logger.info(f"Agent {agent_id} registered successfully with {len(compatible_models)} supported models")
            return True
        else:
            logger.error(f"Registration failed: {response.text}")
            return False

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return False

def heartbeat(agent_id: str, hub_url: str) -> bool:
    try:
        response = requests.post(
            f"{hub_url}/nodes/{agent_id}/heartbeat",
            json={"timestamp": datetime.now().isoformat()},
            timeout=5
        )
        return response.status_code == 200
        
    except Exception as e:
        logger.debug(f"Heartbeat failed: {e}")
        return False

def run_inference():
    # Placeholder for inference logic
    pass

def main_loop():
    logger.info(f"Starting ExoStack Agent {AGENT_ID}")
    
    # Register with hub
    if not register_agent(AGENT_ID, HUB_URL):
        logger.error("Failed to register with hub, exiting...")
        return
    
    consecutive_failures = 0
    max_consecutive_failures = 5
    
    while True:
        try:
            logger.debug("Sending heartbeat...")
            if heartbeat(AGENT_ID, HUB_URL):
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                if consecutive_failures >= max_consecutive_failures:
                    logger.error(f"{consecutive_failures} consecutive heartbeat failures, re-registering...")
                    register_agent(AGENT_ID, HUB_URL)
                    consecutive_failures = 0
            
            logger.debug("Running inference...")
            run_inference()
            
        except KeyboardInterrupt:
            logger.info("Received shutdown signal, exiting gracefully...")
            break
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}")
            
        time.sleep(10)

if __name__ == "__main__":
    main_loop()