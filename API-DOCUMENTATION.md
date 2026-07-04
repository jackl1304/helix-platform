# 🔌 HELIX Platform - API Documentation

**Version 1.0.0** | Production Ready

---

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [FDA Endpoints](#fda-endpoints)
4. [Dashboard Endpoints](#dashboard-endpoints)
5. [Approvals Endpoints](#approvals-endpoints)
6. [Regulatory Updates Endpoints](#regulatory-updates-endpoints)
7. [Response Formats](#response-formats)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production:  https://api.helix-platform.com/api
```

---

## 🔐 Authentication

Currently, the API is open for development. Production will use JWT tokens:

```http
Authorization: Bearer <your-jwt-token>
```

---

## 📊 FDA Endpoints

### Get FDA Approvals

**Endpoint:** `GET /fda/approvals`

**Description:** Retrieve FDA device approvals (510(k), PMA)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "deviceName": "CardioMonitor Pro",
      "applicant": "MedTech Solutions Inc.",
      "productCode": "DXH",
      "decision": "Approved",
      "decisionDate": "2024-01-15",
      "type": "510(k)",
      "fdaNumber": "K240015"
    }
  ],
  "count": 2,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/fda/approvals \
  -H "Content-Type: application/json"
```

---

### Get FDA Adverse Events

**Endpoint:** `GET /fda/events`

**Description:** Retrieve FDA adverse event reports

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "productName": "InsulinPump X2000",
      "eventType": "Malfunction",
      "severity": "Serious",
      "reportDate": "2024-03-10",
      "description": "Device malfunction reported during normal use"
    }
  ],
  "count": 1,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Get FDA Device Recalls

**Endpoint:** `GET /fda/recalls`

**Description:** Retrieve FDA device recall information

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "productName": "Blood Glucose Monitor Series A",
      "recallNumber": "Z-1234-2024",
      "recallDate": "2024-02-28",
      "classification": "Class II",
      "reason": "Inaccurate readings under certain conditions",
      "status": "Ongoing"
    }
  ],
  "count": 1,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Get All FDA Data

**Endpoint:** `GET /fda/all`

**Description:** Retrieve all FDA data (approvals, events, recalls) in one call

**Response:**
```json
{
  "success": true,
  "data": {
    "approvals": [...],
    "events": [...],
    "recalls": [...],
    "summary": {
      "totalApprovals": 2,
      "totalEvents": 1,
      "totalRecalls": 1,
      "lastUpdated": "2024-11-05T12:00:00Z"
    }
  },
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Get FDA Statistics

**Endpoint:** `GET /fda/stats`

**Description:** Get aggregated FDA statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApprovals": 2,
    "totalEvents": 1,
    "totalRecalls": 1,
    "recentApprovals": [...],
    "lastSync": "2024-11-05T12:00:00Z",
    "status": "active"
  },
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Sync FDA 510(k) Data

**Endpoint:** `POST /fda/sync-510k`

**Description:** Trigger synchronization of FDA 510(k) approvals

**Response:**
```json
{
  "success": true,
  "message": "FDA 510(k) sync completed successfully",
  "synced": 15,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/fda/sync-510k \
  -H "Content-Type: application/json"
```

---

### Sync FDA Recalls

**Endpoint:** `POST /fda/sync-recalls`

**Description:** Trigger synchronization of FDA device recalls

**Response:**
```json
{
  "success": true,
  "message": "FDA recalls sync completed successfully",
  "synced": 8,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Sync All FDA Data

**Endpoint:** `POST /fda/sync-all`

**Description:** Trigger complete FDA data synchronization

**Response:**
```json
{
  "success": true,
  "message": "Complete FDA sync finished successfully",
  "synced": {
    "approvals": 15,
    "events": 23,
    "recalls": 8
  },
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

## 📊 Dashboard Endpoints

### Get Dashboard Statistics

**Endpoint:** `GET /dashboard/stats`

**Description:** Retrieve dashboard statistics and KPIs

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUpdates": 24,
    "legalCases": 65,
    "fdaData": 101,
    "dataSources": 70,
    "activeDataSources": 46,
    "aiInsights": 24,
    "approvals": 6,
    "lastSync": "2024-11-05T12:00:00Z",
    "status": "online"
  },
  "timestamp": "2024-11-05T12:00:00Z"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Content-Type: application/json"
```

---

## ✅ Approvals Endpoints

### Get Pending Approvals

**Endpoint:** `GET /approvals/pending`

**Description:** Retrieve pending approval applications

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "projectName": "CardioMonitor Pro",
      "regulatoryBody": "FDA",
      "submissionType": "510(k)",
      "submissionDate": "2024-01-10",
      "status": "Under Review",
      "expectedDecision": "2024-04-10",
      "priority": "High"
    }
  ],
  "count": 3,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

### Get All Approvals

**Endpoint:** `GET /approvals`

**Description:** Retrieve all approval applications

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 6,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

## 📰 Regulatory Updates Endpoints

### Get Recent Regulatory Updates

**Endpoint:** `GET /v1/regulatory-updates`

**Description:** Retrieve recent regulatory updates from global authorities

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `region` (optional): Filter by region (e.g., "EU", "US", "APAC")
- `priority` (optional): Filter by priority ("high", "medium", "low")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "New FDA Cybersecurity Guidelines",
      "description": "Updated requirements for medical device cybersecurity",
      "source": "FDA",
      "region": "US",
      "priority": "high",
      "publishDate": "2024-11-01",
      "url": "https://www.fda.gov/...",
      "category": "Device Security"
    }
  ],
  "count": 24,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/regulatory-updates?limit=10&region=US" \
  -H "Content-Type: application/json"
```

---

## 📋 Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "timestamp": "2024-11-05T12:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-11-05T12:00:00Z"
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Examples

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request parameters",
  "details": {
    "field": "region",
    "issue": "Must be one of: US, EU, APAC"
  }
}
```

**429 Rate Limit:**
```json
{
  "success": false,
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## 🚦 Rate Limiting

**API Rate Limits:**

| Plan | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Starter | 1,000 | 10,000 |
| Professional | 10,000 | 100,000 |
| Enterprise | Unlimited | Unlimited |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699200000
```

---

## 🔄 Pagination

For endpoints supporting pagination:

**Query Parameters:**
- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Number of results to skip (default: 0)

**Response with Pagination:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 🔍 Filtering & Sorting

**Available Filters:**
- `region`: Filter by geographical region
- `priority`: Filter by priority level
- `type`: Filter by update type
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)

**Sorting:**
- `sort`: Field to sort by (e.g., "date", "priority")
- `order`: Sort order ("asc" or "desc")

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/regulatory-updates?region=US&priority=high&sort=date&order=desc" \
  -H "Content-Type: application/json"
```

---

## 📚 Additional Resources

- **Postman Collection**: [Download](./postman-collection.json)
- **OpenAPI Spec**: [View](./openapi.yaml)
- **Code Examples**: [GitHub](https://github.com/deltaways/helix-examples)
- **Support**: support@helix-platform.com

---

## 🆕 Changelog

### Version 1.0.0 (2024-11-05)
- Initial API release
- FDA endpoints implemented
- Dashboard statistics
- Approvals tracking
- Regulatory updates
- Rate limiting

---

*API Documentation - Last updated: ${new Date().toLocaleDateString('de-DE')}*

