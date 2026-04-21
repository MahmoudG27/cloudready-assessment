# CloudReady Assessment — Architecture

## Overview

SME Cloud Readiness Assessment Tool built on Azure.
Helps KlayyTech sales engineers assess client cloud readiness and generate AI-powered reports.

---

## Tech Stack

| Layer | Service | Notes |
|---|---|---|
| Frontend | Azure Static Web Apps | React |
| Backend | Azure Functions | API endpoints |
| Identity | Azure AD B2C | Admin + Client roles |
| AI | Azure OpenAI | Report generation |
| Database | Azure Cosmos DB | NoSQL — JSON documents |
| Storage | Azure Blob Storage | PDF report storage |
| Automation | Logic Apps | Email delivery |
| CI/CD | GitHub Actions | Deploy to Azure |
| Secrets | Azure Key Vault | API keys + connection strings |
| Monitoring | Application Insights | Logs + performance |

---

## User Roles

### Admin / Sales Engineer
- Sees all assessments and clients
- Can create, edit, and delete assessments
- Access to analytics dashboard
- Role enforced via Azure AD B2C

### Client
- Sees only their own assessment
- Cannot access other clients' data
- Role enforced via Azure AD B2C + Azure Function user ID filter

---

## Core Flow

```
User Login (Azure AD B2C)
        ↓
Dashboard (Admin: all assessments / Client: own only)
        ↓
New Assessment (multi-step form — 5 sections / 15 questions)
        ↓
Save Draft (optional — resume later)
        ↓
Assessment Summary (score preview + highlights)
        ↓
Loading State (AI generating report)
        ↓
Full Report Page (10 sections — scrollable)
        ↓
Actions (Download PDF / Share link / Send email / Schedule consultation)
```

---

## Azure Functions — API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/assessment | Save assessment answers + calculated score |
| POST | /api/generate-report | Send to Azure OpenAI, store result in Cosmos DB |
| GET | /api/assessments | Get all assessments (Admin only) |
| GET | /api/assessment/{id} | Get single assessment (filtered by userId) |
| GET | /api/report/{id} | Get generated report |
| POST | /api/report/{id}/share | Generate shareable link |

---

## Removed Services

| Service | Reason |
|---|---|
| API Management | Not needed at MVP scale — Azure Functions handle auth directly |

---

## Deferred to Post-MVP

- Validation Engine (AI output validation layer)
- Sales Mode / Neutral Mode toggle
- Collapsed sections / progressive disclosure
- Data confidence per section
- Executive Summary section
- Cost estimation formula