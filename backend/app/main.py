import sys
from typing import Dict, Any

try:
    from fastapi import FastAPI, Request, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
except ImportError:
    # Minimal fallback mock for pure syntax validation when fastapi is not in sys.path
    class FastAPI:
        def __init__(self, *args, **kwargs): pass
        def add_middleware(self, *args, **kwargs): pass
        def include_router(self, *args, **kwargs): pass
        def get(self, *args, **kwargs):
            def d(f): return f
            return d
    class CORSMiddleware: pass
    class JSONResponse: pass

from backend.app.core.config import settings
from backend.app.api.router import api_router
from backend.app.utils.logging import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# -----------------------------------------------------------------------------
# CORS Configuration
# Properly restricted for local development and preview hosts
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Global Safe Exception Handler
# Prevents exposing internal Python stack traces, secrets, or file paths
# -----------------------------------------------------------------------------
@app.middleware("http")
async def safe_error_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        logger.error(f"Unhandled error on {request.method} {request.url.path}: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal processing error",
                "message": "An error occurred in the VEYRiX analysis engine. Please verify the request parameters.",
                "status_code": 500
            }
        )

# -----------------------------------------------------------------------------
# Mount API v1 Router
# -----------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root_info() -> Dict[str, Any]:
    return {
        "system": "VEYRiX Voice Impersonation & Scam Defense Core",
        "api_docs": "/docs",
        "api_v1_prefix": settings.API_V1_PREFIX,
        "health_check": f"{settings.API_V1_PREFIX}/health",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
