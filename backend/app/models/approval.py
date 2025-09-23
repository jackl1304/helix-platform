"""
MedTech Data Platform - Approval Models
Modelle für MedTech-Zulassungen und Registrierungen
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, JSON, ForeignKey, Enum, Float, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum as PyEnum
from typing import List, Optional, Dict, Any
from datetime import date, datetime

from app.models.base import BaseModel

class ApprovalType(PyEnum):
    """Typen von Zulassungen"""
    FDA_510K = "fda_510k"
    FDA_PMA = "fda_pma"
    CE_MARK = "ce_mark"
    MDR = "mdr"
    IVDR = "ivdr"
    ISO_13485 = "iso_13485"
    TGA_ARTG = "tga_artg"
    PMDA_APPROVAL = "pmda_approval"
    MHRA_LICENSE = "mhra_license"
    ANVISA_REGISTRATION = "anvisa_registration"
    HSA_REGISTRATION = "hsa_registration"
    HEALTH_CANADA_LICENSE = "health_canada_license"
    CUSTOM = "custom"

class ApprovalStatus(PyEnum):
    """Status einer Zulassung"""
    APPROVED = "approved"
    PENDING = "pending"
    SUBMITTED = "submitted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    UNDER_REVIEW = "under_review"

class DeviceClass(PyEnum):
    """Klassifizierung von Medizinprodukten"""
    CLASS_I = "class_i"
    CLASS_II = "class_ii"
    CLASS_IIA = "class_iia"
    CLASS_IIB = "class_iib"
    CLASS_III = "class_iii"
    IVD = "ivd"
    IVD_A = "ivd_a"
    IVD_B = "ivd_b"
    IVD_C = "ivd_c"
    IVD_D = "ivd_d"

class Priority(PyEnum):
    """Priorität einer Zulassung"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Approval(BaseModel):
    """
    Modell für eine MedTech-Zulassung
    Repräsentiert eine einzelne Zulassung oder Registrierung
    """
    __tablename__ = "approvals"
    
    # Grundlegende Informationen
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Typ und Status
    approval_type = Column(Enum(ApprovalType), nullable=False, index=True)
    status = Column(Enum(ApprovalStatus), nullable=False, index=True)
    device_class = Column(Enum(DeviceClass), nullable=True, index=True)
    priority = Column(Enum(Priority), default=Priority.MEDIUM, nullable=False)
    
    # Identifikation
    reference_number = Column(String(100), nullable=True, index=True)  # K-Nummer, CE-Nummer, etc.
    internal_id = Column(String(100), nullable=True, index=True)
    applicant_name = Column(String(255), nullable=True, index=True)
    manufacturer_name = Column(String(255), nullable=True, index=True)
    
    # Daten
    submitted_date = Column(Date, nullable=True, index=True)
    decision_date = Column(Date, nullable=True, index=True)
    expiry_date = Column(Date, nullable=True, index=True)
    
    # Geografische Informationen
    region = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=True, index=True)
    authority = Column(String(100), nullable=False, index=True)
    
    # Kategorisierung
    category = Column(String(100), nullable=True, index=True)  # device, software, diagnostic, etc.
    subcategory = Column(String(100), nullable=True, index=True)
    therapeutic_area = Column(String(100), nullable=True, index=True)
    indication = Column(Text, nullable=True)
    
    # Tags und Keywords
    tags = Column(JSON, nullable=True)  # List of strings
    keywords = Column(JSON, nullable=True)  # List of strings
    
    # URLs und Dokumente
    source_url = Column(String(500), nullable=True)
    document_urls = Column(JSON, nullable=True)  # List of URLs
    attachments = Column(JSON, nullable=True)  # List of file references
    
    # Volltext und Details
    full_text = Column(Text, nullable=True)
    detailed_analysis = Column(JSON, nullable=True)
    
    # Risikobewertung
    risk_assessment = Column(Text, nullable=True)
    clinical_data = Column(Text, nullable=True)
    regulatory_pathway = Column(Text, nullable=True)
    market_impact = Column(Text, nullable=True)
    compliance_requirements = Column(JSON, nullable=True)  # List of requirements
    
    # Metadaten
    confidence_score = Column(Float, default=1.0, nullable=False)  # 0.0 - 1.0
    verification_status = Column(String(50), default="unverified", nullable=False)
    last_verified = Column(String(50), nullable=True)
    
    # Beziehung zur Datenquelle
    source_id = Column(String(36), ForeignKey("data_sources.id"), nullable=False, index=True)
    source = relationship("DataSource", back_populates="approvals")
    
    # Beziehungen
    related_documents = relationship("RelatedDocument", back_populates="approval", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="approval", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Approval(title={self.title[:50]}..., type={self.approval_type}, status={self.status})>"
    
    @property
    def is_active(self) -> bool:
        """Prüft ob die Zulassung aktiv ist"""
        return self.status in [ApprovalStatus.APPROVED, ApprovalStatus.UNDER_REVIEW]
    
    @property
    def is_expired(self) -> bool:
        """Prüft ob die Zulassung abgelaufen ist"""
        if not self.expiry_date:
            return False
        return date.today() > self.expiry_date
    
    @property
    def days_until_expiry(self) -> Optional[int]:
        """Anzahl Tage bis zum Ablauf"""
        if not self.expiry_date:
            return None
        delta = self.expiry_date - date.today()
        return delta.days
    
    @property
    def age_days(self) -> Optional[int]:
        """Alter der Zulassung in Tagen"""
        if not self.decision_date:
            return None
        delta = date.today() - self.decision_date
        return delta.days
    
    def to_dict(self) -> Dict[str, Any]:
        """Erweiterte Dictionary-Konvertierung mit berechneten Feldern"""
        base_dict = super().to_dict()
        base_dict.update({
            "is_active": self.is_active,
            "is_expired": self.is_expired,
            "days_until_expiry": self.days_until_expiry,
            "age_days": self.age_days,
            "related_documents_count": len(self.related_documents) if self.related_documents else 0,
            "compliance_checks_count": len(self.compliance_checks) if self.compliance_checks else 0
        })
        return base_dict

class RelatedDocument(BaseModel):
    """
    Modell für zugehörige Dokumente
    Referenziert Dokumente die zu einer Zulassung gehören
    """
    __tablename__ = "related_documents"
    
    # Beziehung zur Zulassung
    approval_id = Column(String(36), ForeignKey("approvals.id"), nullable=False, index=True)
    approval = relationship("Approval", back_populates="related_documents")
    
    # Dokumentinformationen
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)  # summary, clinical_data, risk_assessment, etc.
    url = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)  # Bytes
    mime_type = Column(String(100), nullable=True)
    
    # Metadaten
    language = Column(String(10), default="en", nullable=False)
    version = Column(String(20), nullable=True)
    checksum = Column(String(64), nullable=True)  # SHA-256
    
    def __repr__(self) -> str:
        return f"<RelatedDocument(title={self.title}, type={self.document_type})>"

class ComplianceCheck(BaseModel):
    """
    Modell für Compliance-Prüfungen
    Verfolgt den Status von Compliance-Anforderungen
    """
    __tablename__ = "compliance_checks"
    
    # Beziehung zur Zulassung
    approval_id = Column(String(36), ForeignKey("approvals.id"), nullable=False, index=True)
    approval = relationship("Approval", back_populates="compliance_checks")
    
    # Compliance-Informationen
    requirement = Column(String(255), nullable=False)
    requirement_type = Column(String(100), nullable=False)  # regulatory, quality, safety, etc.
    status = Column(String(20), nullable=False)  # compliant, non_compliant, pending, not_applicable
    description = Column(Text, nullable=True)
    
    # Prüfungsdaten
    checked_by = Column(String(100), nullable=True)
    checked_at = Column(String(50), nullable=True)
    next_check_due = Column(String(50), nullable=True)
    
    # Metadaten
    severity = Column(String(20), nullable=True)  # low, medium, high, critical
    evidence = Column(JSON, nullable=True)  # References to supporting documents
    
    def __repr__(self) -> str:
        return f"<ComplianceCheck(requirement={self.requirement}, status={self.status})>"
