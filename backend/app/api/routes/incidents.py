from typing import List
try:
    from fastapi import APIRouter, HTTPException
except ImportError:
    class APIRouter:
        def __init__(self, *args, **kwargs):
            self.routes = []
        def get(self, *args, **kwargs):
            def decorator(f): return f
            return decorator
    class HTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

from backend.app.schemas.incident import IncidentRecordSchema, IncidentListResponse
from backend.app.services.analysis_service import analysis_service

router = APIRouter(prefix="/incidents", tags=["Incidents & Audit Log"])

@router.get("", response_model=IncidentListResponse)
def get_all_incidents():
    """
    Retrieves history of analyzed calls and voice fraud incidents.
    """
    items = analysis_service.list_incidents()
    return IncidentListResponse(
        total_count=len(items),
        incidents=items
    )

@router.get("/{incident_id}", response_model=IncidentRecordSchema)
def get_incident_by_id(incident_id: str):
    """
    Retrieves complete forensic assessment details for a specific incident.
    """
    inc = analysis_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")
    return inc
