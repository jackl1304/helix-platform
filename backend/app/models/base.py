"""
MedTech Data Platform - Base Database Models
Grundlegende Datenbankmodelle für alle Entitäten
"""

from sqlalchemy import Column, Integer, DateTime, Boolean, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

Base = declarative_base()

class TimestampMixin:
    """Mixin für Zeitstempel-Felder"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class SoftDeleteMixin:
    """Mixin für Soft Delete Funktionalität"""
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class UUIDMixin:
    """Mixin für UUID-Primärschlüssel"""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)

class BaseModel(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """
    Basis-Modell für alle Entitäten
    - UUID als Primärschlüssel
    - Zeitstempel für Erstellung und Aktualisierung
    - Soft Delete Funktionalität
    """
    __abstract__ = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Konvertiert das Modell zu einem Dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Aktualisiert das Modell aus einem Dictionary"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BaseModel':
        """Erstellt eine neue Instanz aus einem Dictionary"""
        return cls(**data)
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"
