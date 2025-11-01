import logging
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import nodes, tasks, status
from .services import registry, scheduler, distributed_scheduler
from .services.gpu_scheduler import GPUScheduler
from .services.logger import get_logger

logger = get_logger(__name__)

# Initialize GPU scheduler
gpu_scheduler = GPUScheduler(registry)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting ExoStack Hub...")
    await scheduler.start()
    await distributed_scheduler.start()
    await gpu_scheduler.start()

    # Start registry cleanup task
    asyncio.create_task(registry.cleanup_inactive_nodes())

    logger.info("✅ ExoStack Hub started successfully with GPU-aware scheduling")

    yield

    # Shutdown
    logger.info("🛑 Shutting down ExoStack Hub...")
    await scheduler.stop()
    await distributed_scheduler.stop()
    await gpu_scheduler.stop()
    logger.info("✅ ExoStack Hub shutdown complete")

app = FastAPI(
    title="ExoStack Hub",
    description="Distributed AI orchestration hub with GPU-aware scheduling and streaming support",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nodes.router, prefix="/nodes", tags=["nodes"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(status.router, prefix="/status", tags=["status"])

@app.get("/")
async def root():
    return {
        "service": "ExoStack Hub",
        "version": "1.0.0",
        "description": "Distributed AI orchestration hub",
        "features": [
            "GPU-aware task scheduling",
            "Model registry integration",
            "Streaming inference support",
            "Fine-tuning preparation",
            "Real-time monitoring"
        ],
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "nodes": "/nodes",
            "tasks": "/tasks",
            "status": "/status"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ExoStack Hub",
        "version": "1.0.0",
        "active_nodes": len(registry.get_active_nodes()),
        "gpu_scheduler_running": gpu_scheduler._scheduler_running
    }

@app.get("/metrics")
async def get_metrics():
    from .services.metrics_collector import metrics_collector
    return metrics_collector.get_system_metrics()

# Custom middleware for logging requests
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code} from {request.url.path}")
    return response