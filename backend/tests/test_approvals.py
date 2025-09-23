"""
MedTech Data Platform - Approval API Tests
Umfassende Tests für die Approval API-Endpunkte
"""

import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.testclient import TestClient

from app.main import app
from app.models.approval import Approval, ApprovalType, ApprovalStatus, DeviceClass, Priority
from app.models.data_source import DataSource, SourceType, SourceStatus
from app.models.user import User
from app.core.database import get_db
from app.tests.conftest import create_test_user, create_test_data_source
from app.tests.factories import ApprovalFactory, DataSourceFactory, UserFactory

class TestApprovalAPI:
    """Test-Klasse für Approval API-Endpunkte"""

    @pytest.fixture
    async def test_user(self, db: AsyncSession) -> User:
        """Erstellt einen Test-Benutzer"""
        return await create_test_user(db)

    @pytest.fixture
    async def test_data_source(self, db: AsyncSession) -> DataSource:
        """Erstellt eine Test-Datenquelle"""
        return await create_test_data_source(db)

    @pytest.fixture
    async def auth_headers(self, test_user: User) -> dict:
        """Erstellt Authentifizierungs-Headers"""
        # Hier würde normalerweise ein JWT-Token erstellt werden
        return {"Authorization": f"Bearer test-token-{test_user.id}"}

    @pytest.mark.asyncio
    async def test_create_approval_success(self, client: AsyncClient, auth_headers: dict, test_data_source: DataSource):
        """Test: Erfolgreiche Erstellung einer Zulassung"""
        approval_data = {
            "title": "Test FDA 510(k) Zulassung",
            "description": "Test-Beschreibung für eine FDA 510(k) Zulassung",
            "approval_type": "fda_510k",
            "status": "approved",
            "region": "US",
            "authority": "FDA",
            "applicant_name": "Test Medical Corp",
            "reference_number": "K123456",
            "source_id": str(test_data_source.id)
        }

        response = await client.post("/api/v1/approvals/", json=approval_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["title"] == approval_data["title"]
        assert data["approval_type"] == approval_data["approval_type"]
        assert data["status"] == approval_data["status"]
        assert data["region"] == approval_data["region"]
        assert data["authority"] == approval_data["authority"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_approval_validation_error(self, client: AsyncClient, auth_headers: dict):
        """Test: Validierungsfehler bei Zulassungserstellung"""
        invalid_approval_data = {
            "title": "",  # Leerer Titel sollte fehlschlagen
            "approval_type": "invalid_type",  # Ungültiger Typ
            "status": "invalid_status",  # Ungültiger Status
            "region": "US",
            "authority": "FDA"
        }

        response = await client.post("/api/v1/approvals/", json=invalid_approval_data, headers=auth_headers)
        
        assert response.status_code == 422
        data = response.json()
        assert "errors" in data["detail"]
        assert len(data["detail"]["errors"]) > 0

    @pytest.mark.asyncio
    async def test_get_approvals_list(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Abrufen der Zulassungsliste"""
        # Erstelle Test-Zulassungen
        approval1 = await ApprovalFactory.create(db, title="Test Zulassung 1")
        approval2 = await ApprovalFactory.create(db, title="Test Zulassung 2")
        approval3 = await ApprovalFactory.create(db, title="Test Zulassung 3")

        response = await client.get("/api/v1/approvals/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert "skip" in data
        assert "limit" in data
        assert "has_more" in data
        assert data["total"] >= 3
        assert len(data["items"]) >= 3

    @pytest.mark.asyncio
    async def test_get_approvals_with_filters(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Zulassungsliste mit Filtern"""
        # Erstelle Test-Zulassungen mit verschiedenen Status
        approved_approval = await ApprovalFactory.create(
            db, 
            title="Genehmigte Zulassung",
            status=ApprovalStatus.APPROVED
        )
        pending_approval = await ApprovalFactory.create(
            db, 
            title="Ausstehende Zulassung",
            status=ApprovalStatus.PENDING
        )

        # Filter nach Status
        response = await client.get(
            "/api/v1/approvals/?status=approved", 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Alle zurückgegebenen Zulassungen sollten den Status "approved" haben
        for item in data["items"]:
            assert item["status"] == "approved"

    @pytest.mark.asyncio
    async def test_get_approvals_with_search(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Zulassungsliste mit Suchfunktion"""
        # Erstelle Test-Zulassungen mit spezifischen Begriffen
        cardiac_approval = await ApprovalFactory.create(
            db, 
            title="Cardiac Monitoring Device",
            description="Ein Gerät zur Überwachung der Herzfunktion"
        )
        orthopedic_approval = await ApprovalFactory.create(
            db, 
            title="Orthopedic Implant",
            description="Ein orthopädisches Implantat"
        )

        # Suche nach "cardiac"
        response = await client.get(
            "/api/v1/approvals/?search=cardiac", 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Mindestens eine Zulassung sollte gefunden werden
        assert data["total"] >= 1
        found_cardiac = any("cardiac" in item["title"].lower() or "cardiac" in item.get("description", "").lower() 
                           for item in data["items"])
        assert found_cardiac

    @pytest.mark.asyncio
    async def test_get_approval_by_id(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Abrufen einer spezifischen Zulassung"""
        approval = await ApprovalFactory.create(db, title="Test Zulassung für Detailansicht")

        response = await client.get(f"/api/v1/approvals/{approval.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == str(approval.id)
        assert data["title"] == approval.title
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_get_approval_not_found(self, client: AsyncClient, auth_headers: dict):
        """Test: Zulassung nicht gefunden"""
        non_existent_id = "00000000-0000-0000-0000-000000000000"

        response = await client.get(f"/api/v1/approvals/{non_existent_id}", headers=auth_headers)
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_update_approval_success(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Erfolgreiche Aktualisierung einer Zulassung"""
        approval = await ApprovalFactory.create(
            db, 
            title="Originaler Titel",
            status=ApprovalStatus.PENDING
        )

        update_data = {
            "title": "Aktualisierter Titel",
            "status": "approved",
            "description": "Aktualisierte Beschreibung"
        }

        response = await client.put(
            f"/api/v1/approvals/{approval.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == update_data["title"]
        assert data["status"] == update_data["status"]
        assert data["description"] == update_data["description"]
        assert data["id"] == str(approval.id)

    @pytest.mark.asyncio
    async def test_delete_approval_success(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Erfolgreiche Löschung einer Zulassung (Soft Delete)"""
        approval = await ApprovalFactory.create(db, title="Zu löschende Zulassung")

        response = await client.delete(f"/api/v1/approvals/{approval.id}", headers=auth_headers)
        
        assert response.status_code == 204

        # Überprüfe, dass die Zulassung nicht mehr in der Liste erscheint
        list_response = await client.get("/api/v1/approvals/", headers=auth_headers)
        assert list_response.status_code == 200
        list_data = list_response.json()
        
        deleted_approval_ids = [item["id"] for item in list_data["items"]]
        assert str(approval.id) not in deleted_approval_ids

    @pytest.mark.asyncio
    async def test_search_approvals_advanced(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Erweiterte Suchfunktion"""
        # Erstelle Test-Zulassungen mit verschiedenen Eigenschaften
        fda_approval = await ApprovalFactory.create(
            db,
            title="FDA Test Device",
            authority="FDA",
            region="US",
            approval_type=ApprovalType.FDA_510K
        )
        
        ema_approval = await ApprovalFactory.create(
            db,
            title="EMA Test Device",
            authority="EMA",
            region="EU",
            approval_type=ApprovalType.CE_MARK
        )

        search_request = {
            "query": "FDA",
            "filters": {
                "authority": "FDA",
                "region": "US"
            },
            "skip": 0,
            "limit": 10
        }

        response = await client.post(
            "/api/v1/approvals/search", 
            json=search_request, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        
        # Alle gefundenen Zulassungen sollten FDA-Zulassungen sein
        for item in data["items"]:
            assert item["authority"] == "FDA"
            assert item["region"] == "US"

    @pytest.mark.asyncio
    async def test_get_approval_statistics(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: Abrufen von Zulassungsstatistiken"""
        # Erstelle Test-Zulassungen mit verschiedenen Status
        await ApprovalFactory.create(db, status=ApprovalStatus.APPROVED)
        await ApprovalFactory.create(db, status=ApprovalStatus.APPROVED)
        await ApprovalFactory.create(db, status=ApprovalStatus.PENDING)
        await ApprovalFactory.create(db, status=ApprovalStatus.REJECTED)

        response = await client.get("/api/v1/approvals/statistics/overview", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_approvals" in data
        assert "status_distribution" in data
        assert "region_distribution" in data
        assert "authority_distribution" in data
        assert "recent_activity" in data
        assert data["total_approvals"] >= 4

    @pytest.mark.asyncio
    async def test_create_approvals_batch(self, client: AsyncClient, auth_headers: dict, test_data_source: DataSource):
        """Test: Batch-Erstellung von Zulassungen"""
        approvals_data = [
            {
                "title": "Batch Zulassung 1",
                "approval_type": "fda_510k",
                "status": "approved",
                "region": "US",
                "authority": "FDA",
                "applicant_name": "Test Corp 1",
                "source_id": str(test_data_source.id)
            },
            {
                "title": "Batch Zulassung 2",
                "approval_type": "ce_mark",
                "status": "pending",
                "region": "EU",
                "authority": "EMA",
                "applicant_name": "Test Corp 2",
                "source_id": str(test_data_source.id)
            },
            {
                "title": "Batch Zulassung 3",  # Diese wird fehlschlagen (fehlende Pflichtfelder)
                "approval_type": "invalid_type",
                "status": "invalid_status"
            }
        ]

        response = await client.post(
            "/api/v1/approvals/batch", 
            json=approvals_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_requested" in data
        assert "created_count" in data
        assert "failed_count" in data
        assert "created_approvals" in data
        assert "failed_approvals" in data
        assert "batch_statistics" in data
        
        assert data["total_requested"] == 3
        assert data["created_count"] >= 2  # Mindestens 2 sollten erfolgreich sein
        assert data["failed_count"] >= 1   # Mindestens 1 sollte fehlschlagen

    @pytest.mark.asyncio
    async def test_export_approvals_csv(self, client: AsyncClient, auth_headers: dict, db: AsyncSession):
        """Test: CSV-Export von Zulassungen"""
        # Erstelle Test-Zulassungen
        await ApprovalFactory.create(db, title="Export Test 1", region="US")
        await ApprovalFactory.create(db, title="Export Test 2", region="EU")

        response = await client.get(
            "/api/v1/approvals/export/csv?region=US", 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "csv_data" in data
        assert isinstance(data["csv_data"], str)
        
        # Überprüfe, dass CSV-Daten vorhanden sind
        csv_content = data["csv_data"]
        assert "title" in csv_content.lower()  # Header sollte enthalten sein
        assert "export test 1" in csv_content.lower()  # Daten sollten enthalten sein

    @pytest.mark.asyncio
    async def test_unauthorized_access(self, client: AsyncClient):
        """Test: Unautorisierter Zugriff"""
        response = await client.get("/api/v1/approvals/")
        
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_rate_limiting(self, client: AsyncClient, auth_headers: dict):
        """Test: Rate Limiting"""
        # Führe viele Anfragen schnell hintereinander aus
        tasks = []
        for _ in range(10):
            task = client.get("/api/v1/approvals/", headers=auth_headers)
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Die meisten Anfragen sollten erfolgreich sein
        successful_responses = [r for r in responses if hasattr(r, 'status_code') and r.status_code == 200]
        assert len(successful_responses) >= 8  # Mindestens 80% sollten erfolgreich sein

class TestApprovalValidation:
    """Test-Klasse für Datenvalidierung"""

    @pytest.mark.asyncio
    async def test_approval_validation_strict_mode(self):
        """Test: Strikte Validierung"""
        from app.core.validation import DataValidator, ValidationLevel
        
        validator = DataValidator(ValidationLevel.STRICT)
        
        # Test mit vollständigen, gültigen Daten
        valid_data = {
            "title": "Valid Test Approval",
            "approval_type": "fda_510k",
            "status": "approved",
            "region": "US",
            "authority": "FDA",
            "applicant_name": "Test Company",
            "reference_number": "K123456",
            "submitted_date": "2024-01-01",
            "decision_date": "2024-02-01"
        }
        
        result = await validator.validate_approval(valid_data)
        assert result.is_valid
        assert result.score >= 0.8
        assert len(result.errors) == 0

    @pytest.mark.asyncio
    async def test_approval_validation_missing_required_fields(self):
        """Test: Validierung mit fehlenden Pflichtfeldern"""
        from app.core.validation import DataValidator, ValidationLevel
        
        validator = DataValidator(ValidationLevel.STRICT)
        
        # Test mit fehlenden Pflichtfeldern
        invalid_data = {
            "title": "",  # Leerer Titel
            "approval_type": "invalid_type",  # Ungültiger Typ
            # Fehlende Pflichtfelder: status, region, authority
        }
        
        result = await validator.validate_approval(invalid_data)
        assert not result.is_valid
        assert len(result.errors) > 0
        assert result.score < 0.8

    @pytest.mark.asyncio
    async def test_batch_validation(self):
        """Test: Batch-Validierung"""
        from app.core.validation import DataValidator, BatchValidator, ValidationLevel
        
        validator = DataValidator(ValidationLevel.STRICT)
        batch_validator = BatchValidator(validator)
        
        # Test-Daten für Batch-Validierung
        batch_data = [
            {
                "title": "Valid Approval 1",
                "approval_type": "fda_510k",
                "status": "approved",
                "region": "US",
                "authority": "FDA"
            },
            {
                "title": "Valid Approval 2",
                "approval_type": "ce_mark",
                "status": "pending",
                "region": "EU",
                "authority": "EMA"
            },
            {
                "title": "",  # Ungültige Zulassung
                "approval_type": "invalid_type",
                "status": "invalid_status"
            }
        ]
        
        results = await batch_validator.validate_batch(batch_data)
        stats = await batch_validator.get_batch_statistics(results)
        
        assert len(results) == 3
        assert stats["total_items"] == 3
        assert stats["valid_items"] >= 2
        assert stats["invalid_items"] >= 1
        assert stats["success_rate"] >= 0.6

class TestApprovalIntegration:
    """Integrationstests für Approval-Funktionalität"""

    @pytest.mark.asyncio
    async def test_approval_workflow_complete(self, client: AsyncClient, auth_headers: dict, db: AsyncSession, test_data_source: DataSource):
        """Test: Vollständiger Zulassungsworkflow"""
        # 1. Erstelle Zulassung
        create_data = {
            "title": "Integration Test Approval",
            "approval_type": "fda_510k",
            "status": "submitted",
            "region": "US",
            "authority": "FDA",
            "applicant_name": "Integration Test Corp",
            "reference_number": "K999999",
            "source_id": str(test_data_source.id)
        }
        
        create_response = await client.post("/api/v1/approvals/", json=create_data, headers=auth_headers)
        assert create_response.status_code == 201
        approval_id = create_response.json()["id"]
        
        # 2. Überprüfe, dass Zulassung in der Liste erscheint
        list_response = await client.get("/api/v1/approvals/", headers=auth_headers)
        assert list_response.status_code == 200
        list_data = list_response.json()
        
        created_approval = next((item for item in list_data["items"] if item["id"] == approval_id), None)
        assert created_approval is not None
        assert created_approval["status"] == "submitted"
        
        # 3. Aktualisiere Zulassung
        update_data = {
            "status": "approved",
            "decision_date": "2024-01-15",
            "description": "Integration test approval updated"
        }
        
        update_response = await client.put(f"/api/v1/approvals/{approval_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        updated_approval = update_response.json()
        assert updated_approval["status"] == "approved"
        
        # 4. Überprüfe Statistiken
        stats_response = await client.get("/api/v1/approvals/statistics/overview", headers=auth_headers)
        assert stats_response.status_code == 200
        stats_data = stats_response.json()
        assert stats_data["total_approvals"] >= 1
        
        # 5. Exportiere Zulassungen
        export_response = await client.get("/api/v1/approvals/export/csv", headers=auth_headers)
        assert export_response.status_code == 200
        export_data = export_response.json()
        assert "Integration Test Approval" in export_data["csv_data"]
        
        # 6. Lösche Zulassung
        delete_response = await client.delete(f"/api/v1/approvals/{approval_id}", headers=auth_headers)
        assert delete_response.status_code == 204
        
        # 7. Überprüfe, dass Zulassung gelöscht wurde
        final_list_response = await client.get("/api/v1/approvals/", headers=auth_headers)
        assert final_list_response.status_code == 200
        final_list_data = final_list_response.json()
        
        deleted_approval = next((item for item in final_list_data["items"] if item["id"] == approval_id), None)
        assert deleted_approval is None
