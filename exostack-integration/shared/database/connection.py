"""
Database connection and session management for ExoStack
Supports PostgreSQL and SQLite with automatic fallback
"""
import os
import logging
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration management"""
    
    def __init__(self):
        # Database URL from environment or default to SQLite
        self.database_url = os.getenv(
            "DATABASE_URL", 
            "sqlite:///./exostack.db"
        )
        
        # Async database URL
        if self.database_url.startswith("postgresql://"):
            self.async_database_url = self.database_url.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )
        elif self.database_url.startswith("sqlite:///"):
            self.async_database_url = self.database_url.replace(
                "sqlite:///", "sqlite+aiosqlite:///", 1
            )
        else:
            self.async_database_url = self.database_url
        
        # Connection settings
        self.echo = os.getenv("DATABASE_ECHO", "false").lower() == "true"
        self.pool_size = int(os.getenv("DATABASE_POOL_SIZE", "10"))
        self.max_overflow = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))
        
        logger.info(f"Database configured: {self.database_url}")

# Global configuration
db_config = DatabaseConfig()

# Create engines
if db_config.database_url.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        db_config.database_url,
        echo=db_config.echo,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    
    async_engine = create_async_engine(
        db_config.async_database_url,
        echo=db_config.echo,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        db_config.database_url,
        echo=db_config.echo,
        pool_size=db_config.pool_size,
        max_overflow=db_config.max_overflow
    )
    
    async_engine = create_async_engine(
        db_config.async_database_url,
        echo=db_config.echo,
        pool_size=db_config.pool_size,
        max_overflow=db_config.max_overflow
    )

# Session makers
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

def create_tables():
    """Create all database tables"""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

async def create_tables_async():
    """Create all database tables asynchronously"""
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created successfully (async)")
    except Exception as e:
        logger.error(f"Failed to create database tables (async): {e}")
        raise

def get_session() -> Session:
    """Get synchronous database session"""
    session = SessionLocal()
    try:
        return session
    except Exception as e:
        session.close()
        raise

@asynccontextmanager
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get asynchronous database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()

class DatabaseService:
    """Database service for common operations"""
    
    def __init__(self):
        self.engine = engine
        self.async_engine = async_engine
    
    def get_session(self) -> Session:
        """Get synchronous session"""
        return get_session()
    
    async def get_async_session(self) -> AsyncSession:
        """Get asynchronous session"""
        async with get_async_session() as session:
            return session
    
    def create_tables(self):
        """Create all tables"""
        create_tables()
    
    async def create_tables_async(self):
        """Create all tables asynchronously"""
        await create_tables_async()
    
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            async with get_async_session() as session:
                await session.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    async def get_stats(self) -> dict:
        """Get database statistics"""
        try:
            async with get_async_session() as session:
                # Import here to avoid circular imports
                from .models import Task, Node, TaskMetric, NodeMetric
                
                # Count records
                task_count = await session.execute("SELECT COUNT(*) FROM tasks")
                node_count = await session.execute("SELECT COUNT(*) FROM nodes")
                metric_count = await session.execute("SELECT COUNT(*) FROM task_metrics")
                
                return {
                    "database_url": db_config.database_url.split("@")[-1] if "@" in db_config.database_url else db_config.database_url,
                    "engine_type": "postgresql" if "postgresql" in db_config.database_url else "sqlite",
                    "tables": {
                        "tasks": task_count.scalar(),
                        "nodes": node_count.scalar(),
                        "task_metrics": metric_count.scalar()
                    },
                    "connection_pool": {
                        "size": db_config.pool_size,
                        "max_overflow": db_config.max_overflow
                    }
                }
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {"error": str(e)}
    
    async def cleanup_old_records(self, days: int = 30):
        """Clean up old records"""
        try:
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            async with get_async_session() as session:
                # Clean up old completed tasks
                await session.execute(
                    "DELETE FROM tasks WHERE status IN ('completed', 'failed') AND completed_at < :cutoff",
                    {"cutoff": cutoff_date}
                )
                
                # Clean up old metrics
                await session.execute(
                    "DELETE FROM task_metrics WHERE created_at < :cutoff",
                    {"cutoff": cutoff_date}
                )
                
                await session.execute(
                    "DELETE FROM node_metrics WHERE created_at < :cutoff",
                    {"cutoff": cutoff_date}
                )
                
                await session.commit()
                logger.info(f"Cleaned up records older than {days} days")
                
        except Exception as e:
            logger.error(f"Failed to cleanup old records: {e}")
            raise

# Global database service instance
db_service = DatabaseService()

# Dependency for FastAPI
async def get_db_session():
    """FastAPI dependency for database session"""
    async with get_async_session() as session:
        yield session

# Initialize database on import
def init_database():
    """Initialize database tables"""
    try:
        create_tables()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}")
        logger.info("Database will be initialized on first use")

# Auto-initialize if not in test environment
if not os.getenv("TESTING"):
    try:
        init_database()
    except Exception as e:
        logger.warning(f"Database auto-initialization failed: {e}")
        logger.info("Database will be initialized on first use")
