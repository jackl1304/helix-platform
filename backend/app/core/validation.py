"""
MedTech Data Platform - Data Validation
Mehrfache Datenvalidierung und Integritätsprüfungen
"""

from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional, Dict, Any, Union
from datetime import date, datetime
from enum import Enum
import re
import json
from decimal import Decimal

class ValidationLevel(str, Enum):
    """Validierungsstufen"""
    STRICT = "strict"
    MODERATE = "moderate"
    LENIENT = "lenient"

class ValidationResult(BaseModel):
    """Ergebnis einer Validierung"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    score: float = Field(ge=0.0, le=1.0, default=1.0)
    validated_fields: Dict[str, Any] = {}

class DataValidator:
    """
    Hauptklasse für Datenvalidierung
    Implementiert mehrfache Validierungsschritte
    """
    
    def __init__(self, level: ValidationLevel = ValidationLevel.STRICT):
        self.level = level
        self.validation_rules = self._load_validation_rules()
    
    def _load_validation_rules(self) -> Dict[str, Any]:
        """Lädt Validierungsregeln aus Konfiguration"""
        return {
            "approval": {
                "required_fields": ["title", "approval_type", "status", "region", "authority"],
                "field_patterns": {
                    "reference_number": r"^[A-Z0-9\-_]{3,50}$",
                    "url": r"^https?://[^\s/$.?#].[^\s]*$"
                },
                "field_lengths": {
                    "title": {"min": 10, "max": 500},
                    "description": {"min": 0, "max": 10000},
                    "summary": {"min": 0, "max": 2000}
                }
            },
            "data_source": {
                "required_fields": ["name", "source_type", "url"],
                "field_patterns": {
                    "url": r"^https?://[^\s/$.?#].[^\s]*$",
                    "name": r"^[A-Za-z0-9\s\-_\.]{3,255}$"
                }
            }
        }
    
    async def validate_approval(self, data: Dict[str, Any]) -> ValidationResult:
        """
        Validiert eine Zulassung mit mehrfachen Prüfungen
        """
        result = ValidationResult(is_valid=True)
        
        try:
            # 1. Grundlegende Feldvalidierung
            await self._validate_required_fields(data, "approval", result)
            await self._validate_field_patterns(data, "approval", result)
            await self._validate_field_lengths(data, "approval", result)
            
            # 2. Datumsvalidierung
            await self._validate_dates(data, result)
            
            # 3. Enumerationsvalidierung
            await self._validate_enums(data, result)
            
            # 4. Geschäftslogik-Validierung
            await self._validate_business_logic(data, result)
            
            # 5. Datenintegrität
            await self._validate_data_integrity(data, result)
            
            # 6. Qualitätsbewertung
            result.score = await self._calculate_quality_score(data, result)
            
            # 7. Gesamtbewertung
            result.is_valid = (
                len(result.errors) == 0 and 
                result.score >= (0.8 if self.level == ValidationLevel.STRICT else 0.6)
            )
            
        except Exception as e:
            result.is_valid = False
            result.errors.append(f"Validation error: {str(e)}")
        
        return result
    
    async def validate_data_source(self, data: Dict[str, Any]) -> ValidationResult:
        """
        Validiert eine Datenquelle
        """
        result = ValidationResult(is_valid=True)
        
        try:
            # Grundlegende Validierung
            await self._validate_required_fields(data, "data_source", result)
            await self._validate_field_patterns(data, "data_source", result)
            
            # URL-Validierung
            await self._validate_url(data.get("url"), result)
            
            # Konfigurationsvalidierung
            await self._validate_config(data, result)
            
            result.score = await self._calculate_quality_score(data, result)
            result.is_valid = len(result.errors) == 0
            
        except Exception as e:
            result.is_valid = False
            result.errors.append(f"Data source validation error: {str(e)}")
        
        return result
    
    async def _validate_required_fields(self, data: Dict[str, Any], entity_type: str, result: ValidationResult):
        """Validiert Pflichtfelder"""
        required_fields = self.validation_rules[entity_type]["required_fields"]
        
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == "":
                result.errors.append(f"Required field '{field}' is missing or empty")
    
    async def _validate_field_patterns(self, data: Dict[str, Any], entity_type: str, result: ValidationResult):
        """Validiert Feldmuster"""
        patterns = self.validation_rules[entity_type].get("field_patterns", {})
        
        for field, pattern in patterns.items():
            if field in data and data[field]:
                if not re.match(pattern, str(data[field])):
                    result.errors.append(f"Field '{field}' does not match required pattern")
    
    async def _validate_field_lengths(self, data: Dict[str, Any], entity_type: str, result: ValidationResult):
        """Validiert Feldlängen"""
        lengths = self.validation_rules[entity_type].get("field_lengths", {})
        
        for field, constraints in lengths.items():
            if field in data and data[field]:
                value_len = len(str(data[field]))
                if "min" in constraints and value_len < constraints["min"]:
                    result.errors.append(f"Field '{field}' is too short (minimum: {constraints['min']})")
                if "max" in constraints and value_len > constraints["max"]:
                    result.errors.append(f"Field '{field}' is too long (maximum: {constraints['max']})")
    
    async def _validate_dates(self, data: Dict[str, Any], result: ValidationResult):
        """Validiert Datumsfelder"""
        date_fields = ["submitted_date", "decision_date", "expiry_date"]
        
        for field in date_fields:
            if field in data and data[field]:
                try:
                    if isinstance(data[field], str):
                        datetime.fromisoformat(data[field].replace('Z', '+00:00'))
                    elif isinstance(data[field], date):
                        pass  # Already a date
                    else:
                        result.errors.append(f"Invalid date format for '{field}'")
                except ValueError:
                    result.errors.append(f"Invalid date format for '{field}'")
        
        # Datumslogik-Validierung
        if "submitted_date" in data and "decision_date" in data:
            if data["submitted_date"] and data["decision_date"]:
                submitted = self._parse_date(data["submitted_date"])
                decision = self._parse_date(data["decision_date"])
                if submitted and decision and submitted > decision:
                    result.warnings.append("Submitted date is after decision date")
    
    async def _validate_enums(self, data: Dict[str, Any], result: ValidationResult):
        """Validiert Enumerationswerte"""
        enum_validations = {
            "approval_type": ["fda_510k", "fda_pma", "ce_mark", "mdr", "ivdr", "iso_13485", "tga_artg", "pmda_approval", "mhra_license", "anvisa_registration", "hsa_registration", "health_canada_license", "custom"],
            "status": ["approved", "pending", "submitted", "rejected", "withdrawn", "suspended", "expired", "under_review"],
            "device_class": ["class_i", "class_ii", "class_iia", "class_iib", "class_iii", "ivd", "ivd_a", "ivd_b", "ivd_c", "ivd_d"],
            "priority": ["low", "medium", "high", "critical"]
        }
        
        for field, valid_values in enum_validations.items():
            if field in data and data[field]:
                if data[field] not in valid_values:
                    result.errors.append(f"Invalid value for '{field}': {data[field]}")
    
    async def _validate_business_logic(self, data: Dict[str, Any], result: ValidationResult):
        """Validiert Geschäftslogik"""
        # Status-spezifische Validierungen
        if data.get("status") == "approved":
            if not data.get("decision_date"):
                result.warnings.append("Approved approval should have a decision date")
        
        # Region-Authority-Konsistenz
        region_authority_map = {
            "US": ["FDA"],
            "EU": ["EMA", "BfArM"],
            "Germany": ["BfArM"],
            "UK": ["MHRA"],
            "Canada": ["Health Canada"],
            "Australia": ["TGA"],
            "Japan": ["PMDA"],
            "Brazil": ["ANVISA"],
            "Singapore": ["HSA"]
        }
        
        region = data.get("region")
        authority = data.get("authority")
        if region and authority:
            valid_authorities = region_authority_map.get(region, [])
            if valid_authorities and authority not in valid_authorities:
                result.warnings.append(f"Authority '{authority}' may not be valid for region '{region}'")
    
    async def _validate_data_integrity(self, data: Dict[str, Any], result: ValidationResult):
        """Validiert Datenintegrität"""
        # URL-Validierung
        if "source_url" in data and data["source_url"]:
            await self._validate_url(data["source_url"], result)
        
        # JSON-Feld-Validierung
        json_fields = ["tags", "keywords", "document_urls", "attachments", "detailed_analysis", "compliance_requirements"]
        for field in json_fields:
            if field in data and data[field]:
                try:
                    if isinstance(data[field], str):
                        json.loads(data[field])
                except json.JSONDecodeError:
                    result.errors.append(f"Invalid JSON format for field '{field}'")
    
    async def _validate_url(self, url: str, result: ValidationResult):
        """Validiert URL-Format"""
        if url:
            url_pattern = r"^https?://[^\s/$.?#].[^\s]*$"
            if not re.match(url_pattern, url):
                result.errors.append("Invalid URL format")
    
    async def _validate_config(self, data: Dict[str, Any], result: ValidationResult):
        """Validiert Konfigurationsfelder"""
        config_fields = ["authentication_config", "parsing_config", "validation_rules", "mapping_config"]
        
        for field in config_fields:
            if field in data and data[field]:
                try:
                    if isinstance(data[field], str):
                        json.loads(data[field])
                except json.JSONDecodeError:
                    result.errors.append(f"Invalid JSON configuration for field '{field}'")
    
    async def _calculate_quality_score(self, data: Dict[str, Any], result: ValidationResult) -> float:
        """Berechnet Qualitätsscore basierend auf Validierungsergebnissen"""
        base_score = 1.0
        
        # Abzüge für Fehler
        base_score -= len(result.errors) * 0.2
        
        # Abzüge für Warnungen
        base_score -= len(result.warnings) * 0.05
        
        # Bonuspunkte für vollständige Daten
        completeness_bonus = 0
        important_fields = ["title", "description", "summary", "reference_number", "applicant_name", "source_url"]
        for field in important_fields:
            if field in data and data[field]:
                completeness_bonus += 0.02
        
        base_score += completeness_bonus
        
        return max(0.0, min(1.0, base_score))
    
    def _parse_date(self, date_value: Any) -> Optional[date]:
        """Hilfsfunktion zum Parsen von Datumsangaben"""
        try:
            if isinstance(date_value, str):
                return datetime.fromisoformat(date_value.replace('Z', '+00:00')).date()
            elif isinstance(date_value, date):
                return date_value
            elif isinstance(date_value, datetime):
                return date_value.date()
        except:
            pass
        return None

class BatchValidator:
    """
    Validator für Batch-Verarbeitung
    Optimiert für große Datenmengen
    """
    
    def __init__(self, validator: DataValidator):
        self.validator = validator
    
    async def validate_batch(self, data_list: List[Dict[str, Any]]) -> Dict[str, ValidationResult]:
        """
        Validiert eine Batch von Daten
        """
        results = {}
        
        for i, data in enumerate(data_list):
            try:
                result = await self.validator.validate_approval(data)
                results[f"item_{i}"] = result
            except Exception as e:
                results[f"item_{i}"] = ValidationResult(
                    is_valid=False,
                    errors=[f"Batch validation error: {str(e)}"]
                )
        
        return results
    
    async def get_batch_statistics(self, results: Dict[str, ValidationResult]) -> Dict[str, Any]:
        """
        Berechnet Statistiken für Batch-Validierung
        """
        total = len(results)
        valid = sum(1 for r in results.values() if r.is_valid)
        invalid = total - valid
        
        error_counts = {}
        warning_counts = {}
        
        for result in results.values():
            for error in result.errors:
                error_counts[error] = error_counts.get(error, 0) + 1
            for warning in result.warnings:
                warning_counts[warning] = warning_counts.get(warning, 0) + 1
        
        avg_score = sum(r.score for r in results.values()) / total if total > 0 else 0
        
        return {
            "total_items": total,
            "valid_items": valid,
            "invalid_items": invalid,
            "success_rate": valid / total if total > 0 else 0,
            "average_quality_score": avg_score,
            "common_errors": sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:10],
            "common_warnings": sorted(warning_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        }
