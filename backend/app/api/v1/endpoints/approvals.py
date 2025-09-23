"""
MedTech Data Platform - Approval API Endpoints
API-Endpunkte für Zulassungen und Registrierungen
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import logging

from app.core.database import get_db
from app.core.validation import DataValidator, ValidationLevel, BatchValidator
from app.models.approval import Approval, ApprovalType, ApprovalStatus, DeviceClass, Priority
from app.models.data_source import DataSource
from app.schemas.approval import (
    ApprovalCreate, 
    ApprovalUpdate, 
    ApprovalResponse, 
    ApprovalListResponse,
    ApprovalSearchRequest,
    ApprovalStatistics
)
from app.services.approval_service import ApprovalService
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ApprovalResponse, status_code=status.HTTP_201_CREATED)
async def create_approval(
    approval_data: ApprovalCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Erstellt eine neue Zulassung
    
    - **title**: Titel der Zulassung
    - **approval_type**: Typ der Zulassung (FDA 510(k), CE Mark, etc.)
    - **status**: Status der Zulassung
    - **region**: Region der Zulassung
    - **authority**: Zulassungsbehörde
    """
    try:
        # Datenvalidierung
        validator = DataValidator(ValidationLevel.STRICT)
        validation_result = await validator.validate_approval(approval_data.dict())
        
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Validation failed",
                    "errors": validation_result.errors,
                    "warnings": validation_result.warnings
                }
            )
        
        # Service aufrufen
        approval_service = ApprovalService(db)
        approval = await approval_service.create_approval(approval_data, current_user.id)
        
        # Background-Tasks
        background_tasks.add_task(
            approval_service.post_create_tasks,
            approval.id,
            validation_result
        )
        
        logger.info(f"Created approval {approval.id} by user {current_user.id}")
        
        return ApprovalResponse.from_orm(approval)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating approval: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create approval"
        )

@router.get("/", response_model=ApprovalListResponse)
async def get_approvals(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    approval_type: Optional[ApprovalType] = Query(None, description="Filter by approval type"),
    status: Optional[ApprovalStatus] = Query(None, description="Filter by status"),
    region: Optional[str] = Query(None, description="Filter by region"),
    authority: Optional[str] = Query(None, description="Filter by authority"),
    device_class: Optional[DeviceClass] = Query(None, description="Filter by device class"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ruft eine Liste von Zulassungen ab
    
    Unterstützt Filterung, Suche und Sortierung
    """
    try:
        approval_service = ApprovalService(db)
        
        # Filter-Parameter
        filters = {
            "approval_type": approval_type,
            "status": status,
            "region": region,
            "authority": authority,
            "device_class": device_class,
            "priority": priority
        }
        
        # Leere Filter entfernen
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # Zulassungen abrufen
        approvals, total = await approval_service.get_approvals(
            skip=skip,
            limit=limit,
            filters=filters,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return ApprovalListResponse(
            items=[ApprovalResponse.from_orm(approval) for approval in approvals],
            total=total,
            skip=skip,
            limit=limit,
            has_more=skip + limit < total
        )
        
    except Exception as e:
        logger.error(f"Error getting approvals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve approvals"
        )

@router.get("/{approval_id}", response_model=ApprovalResponse)
async def get_approval(
    approval_id: str = Path(..., description="Approval ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ruft eine spezifische Zulassung ab
    """
    try:
        approval_service = ApprovalService(db)
        approval = await approval_service.get_approval_by_id(approval_id)
        
        if not approval:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval not found"
            )
        
        return ApprovalResponse.from_orm(approval)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting approval {approval_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve approval"
        )

@router.put("/{approval_id}", response_model=ApprovalResponse)
async def update_approval(
    approval_id: str = Path(..., description="Approval ID"),
    approval_data: ApprovalUpdate = None,
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aktualisiert eine Zulassung
    """
    try:
        approval_service = ApprovalService(db)
        
        # Existierende Zulassung abrufen
        existing_approval = await approval_service.get_approval_by_id(approval_id)
        if not existing_approval:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval not found"
            )
        
        # Datenvalidierung
        update_data = approval_data.dict(exclude_unset=True)
        validator = DataValidator(ValidationLevel.STRICT)
        validation_result = await validator.validate_approval(update_data)
        
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Validation failed",
                    "errors": validation_result.errors,
                    "warnings": validation_result.warnings
                }
            )
        
        # Zulassung aktualisieren
        updated_approval = await approval_service.update_approval(
            approval_id, 
            approval_data, 
            current_user.id
        )
        
        # Background-Tasks
        if background_tasks:
            background_tasks.add_task(
                approval_service.post_update_tasks,
                approval_id,
                validation_result
            )
        
        logger.info(f"Updated approval {approval_id} by user {current_user.id}")
        
        return ApprovalResponse.from_orm(updated_approval)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating approval {approval_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update approval"
        )

@router.delete("/{approval_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_approval(
    approval_id: str = Path(..., description="Approval ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Löscht eine Zulassung (Soft Delete)
    """
    try:
        approval_service = ApprovalService(db)
        
        # Zulassung löschen
        success = await approval_service.delete_approval(approval_id, current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval not found"
            )
        
        logger.info(f"Deleted approval {approval_id} by user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting approval {approval_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete approval"
        )

@router.post("/search", response_model=ApprovalListResponse)
async def search_approvals(
    search_request: ApprovalSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Erweiterte Suche nach Zulassungen
    
    Unterstützt komplexe Suchanfragen mit mehreren Kriterien
    """
    try:
        approval_service = ApprovalService(db)
        
        approvals, total = await approval_service.search_approvals(search_request)
        
        return ApprovalListResponse(
            items=[ApprovalResponse.from_orm(approval) for approval in approvals],
            total=total,
            skip=search_request.skip,
            limit=search_request.limit,
            has_more=search_request.skip + search_request.limit < total
        )
        
    except Exception as e:
        logger.error(f"Error searching approvals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search approvals"
        )

@router.get("/statistics/overview", response_model=ApprovalStatistics)
async def get_approval_statistics(
    region: Optional[str] = Query(None, description="Filter by region"),
    authority: Optional[str] = Query(None, description="Filter by authority"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ruft Statistiken über Zulassungen ab
    """
    try:
        approval_service = ApprovalService(db)
        
        filters = {}
        if region:
            filters["region"] = region
        if authority:
            filters["authority"] = authority
        
        statistics = await approval_service.get_approval_statistics(filters)
        
        return ApprovalStatistics(**statistics)
        
    except Exception as e:
        logger.error(f"Error getting approval statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )

@router.post("/batch", response_model=Dict[str, Any])
async def create_approvals_batch(
    approvals_data: List[ApprovalCreate],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Erstellt mehrere Zulassungen in einem Batch
    
    Optimiert für große Datenmengen mit Validierung und Fehlerbehandlung
    """
    try:
        approval_service = ApprovalService(db)
        validator = DataValidator(ValidationLevel.STRICT)
        batch_validator = BatchValidator(validator)
        
        # Batch-Validierung
        validation_results = await batch_validator.validate_batch(
            [approval.dict() for approval in approvals_data]
        )
        
        # Statistiken
        batch_stats = await batch_validator.get_batch_statistics(validation_results)
        
        # Erfolgreiche Zulassungen erstellen
        created_approvals = []
        failed_approvals = []
        
        for i, (approval_data, validation_result) in enumerate(zip(approvals_data, validation_results.values())):
            if validation_result.is_valid:
                try:
                    approval = await approval_service.create_approval(approval_data, current_user.id)
                    created_approvals.append(approval.id)
                except Exception as e:
                    failed_approvals.append({
                        "index": i,
                        "error": str(e),
                        "data": approval_data.dict()
                    })
            else:
                failed_approvals.append({
                    "index": i,
                    "error": "Validation failed",
                    "validation_errors": validation_result.errors,
                    "data": approval_data.dict()
                })
        
        # Background-Tasks für erfolgreiche Zulassungen
        for approval_id in created_approvals:
            background_tasks.add_task(
                approval_service.post_create_tasks,
                approval_id,
                None
            )
        
        logger.info(f"Batch created {len(created_approvals)} approvals, {len(failed_approvals)} failed")
        
        return {
            "total_requested": len(approvals_data),
            "created_count": len(created_approvals),
            "failed_count": len(failed_approvals),
            "created_approvals": created_approvals,
            "failed_approvals": failed_approvals,
            "batch_statistics": batch_stats
        }
        
    except Exception as e:
        logger.error(f"Error in batch creation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create approvals batch"
        )

@router.get("/export/csv")
async def export_approvals_csv(
    approval_type: Optional[ApprovalType] = Query(None, description="Filter by approval type"),
    status: Optional[ApprovalStatus] = Query(None, description="Filter by status"),
    region: Optional[str] = Query(None, description="Filter by region"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exportiert Zulassungen als CSV-Datei
    """
    try:
        approval_service = ApprovalService(db)
        
        filters = {}
        if approval_type:
            filters["approval_type"] = approval_type
        if status:
            filters["status"] = status
        if region:
            filters["region"] = region
        
        csv_data = await approval_service.export_approvals_csv(filters)
        
        return JSONResponse(
            content={"csv_data": csv_data},
            headers={"Content-Type": "application/json"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting approvals: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export approvals"
        )
