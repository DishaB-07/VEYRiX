try:
    from fastapi import APIRouter
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs):
            self.routes = []
        def include_router(self, router, **kwargs):
            pass

from backend.app.api.routes import health, analysis, voice, incidents

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(analysis.router)
api_router.include_router(voice.router)
api_router.include_router(incidents.router)
