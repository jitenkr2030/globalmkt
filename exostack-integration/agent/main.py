"""
ExoStack Agent Main Entry Point
Distributed AI agent with model registry, GPU detection, and streaming inference
"""
import os
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .agent import app as agent_app
from .health_monitor import health_monitor
from .model_manager import model_manager
from .executor import inference_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get configuration from environment
AGENT_ID = os.getenv("AGENT_ID", "agent-001")
AGENT_PORT = int(os.getenv("AGENT_PORT", "8001"))
HUB_URL = os.getenv("HUB_URL", "http://localhost:8000")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info(f"🚀 Starting ExoStack Agent {AGENT_ID}...")
    
    # Initialize health monitor
    await health_monitor.start()
    logger.info("✅ Health monitor started")
    
    # Initialize model manager
    await model_manager.initialize()
    logger.info("✅ Model manager initialized")
    
    # Initialize inference engine
    await inference_engine.initialize()
    logger.info("✅ Inference engine initialized")
    
    # Register with hub
    try:
        await register_with_hub()
        logger.info("✅ Registered with hub successfully")
    except Exception as e:
        logger.warning(f"⚠️  Failed to register with hub: {e}")
    
    logger.info(f"🎉 ExoStack Agent {AGENT_ID} startup completed")
    
    yield
    
    # Shutdown
    logger.info(f"🛑 Shutting down ExoStack Agent {AGENT_ID}...")
    
    # Unregister from hub
    try:
        await unregister_from_hub()
        logger.info("✅ Unregistered from hub")
    except Exception as e:
        logger.warning(f"⚠️  Failed to unregister from hub: {e}")
    
    # Cleanup services
    await inference_engine.cleanup()
    await model_manager.cleanup()
    await health_monitor.stop()
    
    logger.info(f"✅ ExoStack Agent {AGENT_ID} shutdown completed")

async def register_with_hub():
    """Register this agent with the hub"""
    import httpx
    
    # Get agent capabilities
    capabilities = await get_agent_capabilities()
    
    registration_data = {
        "agent_id": AGENT_ID,
        "host": "localhost",  # In production, use actual host
        "port": AGENT_PORT,
        "capabilities": capabilities["capabilities"],
        "compute_resources": capabilities["compute_resources"],
        "supported_models": capabilities["supported_models"]
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{HUB_URL}/nodes/register",
            json=registration_data
        )
        response.raise_for_status()

async def unregister_from_hub():
    """Unregister this agent from the hub"""
    import httpx
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.delete(f"{HUB_URL}/nodes/{AGENT_ID}")
            response.raise_for_status()
        except Exception as e:
            logger.warning(f"Failed to unregister: {e}")

async def get_agent_capabilities():
    """Get agent capabilities for registration"""
    from .agent import get_capabilities
    return await get_capabilities()

# Create FastAPI app with lifespan
app = FastAPI(
    title=f"ExoStack Agent {AGENT_ID}",
    description="Distributed AI agent with model registry and streaming inference",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the agent app
app.mount("/", agent_app)

# Override root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": f"ExoStack Agent {AGENT_ID}",
        "version": "1.0.0",
        "description": "Distributed AI agent",
        "features": [
            "Model registry integration",
            "GPU detection and utilization",
            "Streaming inference support",
            "Automatic model loading",
            "Resource monitoring"
        ],
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "inference": "/inference",
            "models": "/models",
            "capabilities": "/capabilities"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health_data = health_monitor.get_health_status()
    return {
        "status": "healthy" if health_data["status"] == "healthy" else "unhealthy",
        "agent_id": AGENT_ID,
        "service": "ExoStack Agent",
        "version": "1.0.0",
        **health_data
    }

# Custom middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all requests"""
    start_time = asyncio.get_event_loop().time()
    
    logger.debug(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    
    duration = asyncio.get_event_loop().time() - start_time
    logger.debug(f"Response: {response.status_code} from {request.url.path} ({duration:.3f}s)")
    
    return response

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting ExoStack Agent {AGENT_ID} on port {AGENT_PORT}")
    
    uvicorn.run(
        "exo_agent.main:app",
        host="0.0.0.0",
        port=AGENT_PORT,
        reload=True,
        log_level="info"
    )
