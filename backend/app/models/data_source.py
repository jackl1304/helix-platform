"""
MedTech Data Platform - Data Source Models
Modelle für Datenquellen und deren Metadaten
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, JSON, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum as PyEnum
from typing import List, Optional, Dict, Any
import json

from app.models.base import BaseModel

class SourceType(PyEnum):
    """Typen von Datenquellen"""
    FDA = "fda"
    EMA = "ema"
    BFARM = "bfarm"
    HEALTH_CANADA = "health_canada"
    TGA = "tga"
    PMDA = "pmda"
    MHRA = "mhra"
    ANVISA = "anvisa"
    HSA = "hsa"
    CUSTOM = "custom"
    API = "api"
    DATABASE = "database"
    FILE = "file"
    WEB_SCRAPING = "web_scraping"

class SourceStatus(PyEnum):
    """Status einer Datenquelle"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    PENDING = "pending"

class DataSource(BaseModel):
    """
    Modell für eine Datenquelle
    Repräsentiert eine der 400+ MedTech-Datenquellen
    """
    __tablename__ = "data_sources"
    
    # Grundlegende Informationen
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    source_type = Column(Enum(SourceType), nullable=False, index=True)
    status = Column(Enum(SourceStatus), default=SourceStatus.ACTIVE, nullable=False)
    
    # URL und Zugriff
    url = Column(String(500), nullable=True)
    api_endpoint = Column(String(500), nullable=True)
    authentication_type = Column(String(50), nullable=True)  # basic, oauth, api_key, none
    authentication_config = Column(JSON, nullable=True)
    
    # Konfiguration
    update_frequency = Column(Integer, default=3600, nullable=False)  # Sekunden
    timeout = Column(Integer, default=30, nullable=False)  # Sekunden
    retry_count = Column(Integer, default=3, nullable=False)
    priority = Column(Integer, default=1, nullable=False)  # 1-10, 1 = höchste Priorität
    
    # Metadaten
    region = Column(String(100), nullable=True, index=True)
    authority = Column(String(100), nullable=True, index=True)
    language = Column(String(10), default="en", nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Datenqualität
    data_quality_score = Column(Float, default=0.0, nullable=False)  # 0.0 - 1.0
    last_successful_update = Column(String(50), nullable=True)
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0, nullable=False)
    
    # Statistiken
    total_records = Column(Integer, default=0, nullable=False)
    last_record_count = Column(Integer, default=0, nullable=False)
    average_response_time = Column(Float, default=0.0, nullable=False)  # Millisekunden
    
    # Konfiguration
    parsing_config = Column(JSON, nullable=True)
    validation_rules = Column(JSON, nullable=True)
    mapping_config = Column(JSON, nullable=True)
    
    # Beziehungen
    approvals = relationship("Approval", back_populates="source", cascade="all, delete-orphan")
    regulatory_updates = relationship("RegulatoryUpdate", back_populates="source", cascade="all, delete-orphan")
    sync_logs = relationship("SyncLog", back_populates="source", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<DataSource(name={self.name}, type={self.source_type}, status={self.status})>"
    
    @property
    def is_healthy(self) -> bool:
        """Prüft ob die Datenquelle gesund ist"""
        return self.status == SourceStatus.ACTIVE and self.error_count < 5
    
    @property
    def needs_update(self) -> bool:
        """Prüft ob die Datenquelle aktualisiert werden muss"""
        if not self.last_successful_update:
            return True
        
        from datetime import datetime, timedelta
        last_update = datetime.fromisoformat(self.last_successful_update.replace('Z', '+00:00'))
        next_update = last_update + timedelta(seconds=self.update_frequency)
        return datetime.utcnow() > next_update
    
    def to_dict(self) -> Dict[str, Any]:
        """Erweiterte Dictionary-Konvertierung mit Metadaten"""
        base_dict = super().to_dict()
        base_dict.update({
            "is_healthy": self.is_healthy,
            "needs_update": self.needs_update,
            "approvals_count": len(self.approvals) if self.approvals else 0,
            "updates_count": len(self.regulatory_updates) if self.regulatory_updates else 0
        })
        return base_dict

class SyncLog(BaseModel):
    """
    Log für Synchronisationsvorgänge
    Protokolliert alle Datenabrufe und deren Ergebnisse
    """
    __tablename__ = "sync_logs"
    
    # Beziehung zur Datenquelle
    source_id = Column(String(36), ForeignKey("data_sources.id"), nullable=False, index=True)
    source = relationship("DataSource", back_populates="sync_logs")
    
    # Synchronisation
    sync_type = Column(String(50), nullable=False)  # full, incremental, manual
    status = Column(String(20), nullable=False)  # success, error, partial
    started_at = Column(String(50), nullable=False)
    completed_at = Column(String(50), nullable=True)
    duration = Column(Float, nullable=True)  # Sekunden
    
    # Ergebnisse
    records_processed = Column(Integer, default=0, nullable=False)
    records_added = Column(Integer, default=0, nullable=False)
    records_updated = Column(Integer, default=0, nullable=False)
    records_deleted = Column(Integer, default=0, nullable=False)
    records_errors = Column(Integer, default=0, nullable=False)
    
    # Fehler und Warnungen
    error_message = Column(Text, nullable=True)
    warnings = Column(JSON, nullable=True)
    
    # Metadaten
    response_size = Column(Integer, nullable=True)  # Bytes
    response_time = Column(Float, nullable=True)  # Millisekunden
    http_status = Column(Integer, nullable=True)
    
    def __repr__(self) -> str:
        return f"<SyncLog(source={self.source_id}, status={self.status}, records={self.records_processed})>"
