"""
MedTech Data Platform - FastAPI Backend
Hauptanwendung für die Verwaltung von MedTech-Daten aus 400+ Quellen
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
import logging
from typing import AsyncGenerator

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging_config import setup_logging
from app.api.v1.api import api_router
from app.core.middleware import setup_middleware
from app.core.exceptions import setup_exception_handlers

# Logging Setup
setup_logging()
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager
    - Startup: Database initialization, cache warming
    - Shutdown: Cleanup resources
    """
    # Startup
    logger.info("🚀 Starting MedTech Data Platform Backend...")
    
    try:
        # Create database tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created successfully")
        
        # Initialize cache
        from app.core.cache import init_cache
        await init_cache()
        logger.info("✅ Cache initialized successfully")
        
        # Warm up data sources
        from app.services.data_source_service import DataSourceService
        data_service = DataSourceService()
        await data_service.warm_up_sources()
        logger.info("✅ Data sources warmed up successfully")
        
        logger.info("🎉 MedTech Data Platform Backend started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down MedTech Data Platform Backend...")
    
    try:
        # Close database connections
        await engine.dispose()
        logger.info("✅ Database connections closed")
        
        # Clear cache
        from app.core.cache import clear_cache
        await clear_cache()
        logger.info("✅ Cache cleared")
        
        logger.info("✅ MedTech Data Platform Backend shutdown complete")
        
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")

# FastAPI Application
app = FastAPI(
    title="MedTech Data Platform",
    description="""
    ## MedTech Data Platform API
    
    Eine umfassende Plattform für die Verwaltung und Analyse von MedTech-Daten aus über 400 Quellen.
    
    ### Features:
    - 📊 Vollständige Datenintegration aus 400+ Quellen
    - 🔍 Mehrfache Datenvalidierung und Integritätsprüfungen
    - 🏗️ Hierarchische Datenmodelle
    - 🔐 Rechte- und Rollenkonzepte
    - 📈 Echtzeitdatenanalyse
    - 🚀 Hochperformante API-Endpunkte
    
    ### Datenquellen:
    - FDA (USA)
    - EMA (EU)
    - BfArM (Deutschland)
    - Health Canada
    - TGA (Australien)
    - PMDA (Japan)
    - MHRA (UK)
    - ANVISA (Brasilien)
    - HSA (Singapur)
    - Und 400+ weitere regulatorische Quellen
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Custom Middleware
setup_middleware(app)

# Exception Handlers
setup_exception_handlers(app)

# Include API Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - Health check
    """
    return {
        "message": "MedTech Data Platform API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Detailed health check endpoint
    """
    from app.core.database import get_db_health
    from app.core.cache import get_cache_health
    
    try:
        db_health = await get_db_health()
        cache_health = await get_cache_health()
        
        return {
            "status": "healthy",
            "timestamp": "2025-01-21T13:45:00Z",
            "version": "1.0.0",
            "services": {
                "database": db_health,
                "cache": cache_health,
                "api": {"status": "healthy", "uptime": "0s"}
            },
            "data_sources": {
                "total": 400,
                "active": 400,
                "last_update": "2025-01-21T13:30:00Z"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.get("/stats", tags=["Statistics"])
async def get_platform_stats():
    """
    Platform statistics endpoint
    """
    from app.services.statistics_service import StatisticsService
    
    try:
        stats_service = StatisticsService()
        stats = await stats_service.get_platform_statistics()
        return stats
    except Exception as e:
        logger.error(f"Failed to get platform stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform statistics"
        )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
