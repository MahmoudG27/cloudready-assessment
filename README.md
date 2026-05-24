# KlayyTech CloudReady — SME Cloud Readiness Assessment Tool

> An AI-powered cloud readiness assessment platform that helps sales engineers evaluate SME clients and generate professional Azure migration reports in minutes.

---

## 🧩 What Problem Does It Solve?

Sales engineers at cloud consultancies spend hours manually assessing client infrastructure before recommending Azure services. This tool automates that process:

1. Sales engineer creates a secure invitation link for the client
2. Client answers 21 questions about their infrastructure
3. A rule engine calculates a readiness score with conditional penalties
4. Azure OpenAI generates a professional, industry-specific report
5. The report is delivered as a PDF attachment via email in under 2 minutes

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│            React + TypeScript on Azure Static Web Apps      │
│                                                             │
│  ┌─────────────────────┐    ┌───────────────────────────┐   │
│  │   Admin Dashboard   │    │     Client Portal         │   │
│  │  (Entra ID auth)    │    │  (Token-based /a/:token)  │   │
│  └─────────────────────┘    └───────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────┐
│                        Backend                              │
│                  Azure Functions v4 (Node.js)               │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌────────┐   │
│  │ Assessment │  │   Report   │  │   PDF    │  │Invite  │   │
│  │    API     │  │ Generator  │  │ Service  │  │System  │   │
│  └─────┬──────┘  └─────┬──────┘  └────┬─────┘  └───┬────┘   │
└────────┼───────────────┼──────────────┼─────────────┼───────┘
         │               │              │             │
┌────────▼──────┐ ┌──────▼───────┐ ┌───▼──────┐ ┌───▼──────┐
│  Cosmos DB    │ │ Azure OpenAI │ │  Blob    │ │  Cosmos  │
│ (assessments) │ │   (GPT-4o)   │ │ Storage  │ │(invites) │
└───────────────┘ └──────────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────┐
│ Supporting Services                                         │
│  Key Vault │ App Insights │ Logic Apps (Email + PDF attach) │
│  Microsoft Entra ID (Admin auth)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Model

| User Type | Access Method | Routes |
|---|---|---|
| Sales / Admin | Microsoft Entra ID (SSO) | `/dashboard`, `/report`, `/invitations` |
| Client | Secure invitation token | `/a/:token` only |

The client never creates an account. A 64-character cryptographic token grants time-limited, one-time access to their assessment and report.

---

## 📩 Invitation Flow

```text
Sales Engineer
    │
    ├─► Creates invitation (email + company + industry)
    │         │
    │         └─► Backend generates secure token (crypto.randomBytes(32))
    │                   │
    │                   └─► Link: /a/{token}  (14-day expiry)
    │
Client
    │
    ├─► Opens link → Assessment form
    ├─► Submits answers → AI report generated
    └─► Views readonly report (token marked "completed")
```

---

## 🧠 Intelligence Layers

### 1. Scoring Engine (Rule-based)
`apps/frontend/src/utils/scoring.ts`

Calculates score across 3 dimensions:
- **Infrastructure (40%)** — hosting type, age, availability, backup
- **Security (35%)** — data sensitivity, IAM, incidents, compliance
- **Team Readiness (25%)** — IT capacity, priorities

**Conditional Penalties** — critical combinations trigger score caps:
```typescript
// Health data + no IAM = security capped at 35%
if (sensitiveDataType === "Health data" && accessControl === "No formal system") {
  security = Math.min(security, 35);
}
```

### 2. Recommendation Rules Engine (Deterministic)
`apps/backend/src/lib/recommendationRules.ts`

Determines Azure services, architecture layers, and migration warnings before the AI is called:
```typescript
// Containers + small team = Container Apps, not AKS
if (infraType === "Containers" && !hasDevOps && !isBigCompany) {
  recommend("Azure Container Apps");
}
```

### 3. AI Report Generation (Explainer, not decision-maker)
`apps/backend/src/lib/openaiClient.ts`

Azure OpenAI (GPT-4o) receives pre-calculated scores and deterministic recommendations. It explains and narrates — it does not decide. This ensures consistency and reduces hallucination.

### 4. Score + Cost Override Pattern
After AI response is parsed, deterministic values are injected:
```typescript
parsed.readinessScore = calculatedScore;      // AI cannot change scores
parsed.estimatedMonthlyCost = pricingEngine;  // AI cannot change costs
```

### 5. Pricing Engine
`apps/backend/src/lib/pricingEngine.ts`

Calculates cost estimates based on recommended services, company size multipliers, and priority settings (lowest cost / balanced / maximum security).

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| MSAL Browser + React | Microsoft Entra ID authentication |
| Axios | HTTP client |
| Azure Static Web Apps | Hosting |

### Backend
| Technology | Purpose |
|---|---|
| Azure Functions v4 (Node.js) | Serverless API |
| TypeScript | Type safety |
| Azure Cosmos DB | NoSQL document storage (2 containers) |
| Azure OpenAI (GPT-4o) | Report generation |
| Azure Blob Storage | PDF storage with SAS URLs |
| Azure Key Vault | Secrets management |
| Logic Apps | Email delivery with PDF attachment |
| Application Insights | Monitoring and logging |
| PDFKit | Server-side PDF generation |

### Infrastructure
| Technology | Purpose |
|---|---|
| Terraform + AzAPI | Infrastructure as Code |
| GitHub Actions | CI/CD pipelines |
| Microsoft Entra ID | Admin authentication |

---

## 📁 Project Structure

```text
cloudready-assessment/
├── apps/
│   ├── frontend/
│   │   └── src/
│   │       ├── auth/             # MSAL config, AuthProvider, ProtectedRoute
│   │       ├── pages/            # Dashboard, Assessment, Report, Invitations,
│   │       │                     # ClientPortal, ClientReport, ClientError
│   │       ├── components/
│   │       │   ├── common/       # Button, Card, LoadingSpinner
│   │       │   └── assessment/   # AssessmentForm (reusable)
│   │       ├── services/         # API client (api.ts)
│   │       ├── hooks/            # useAssessment
│   │       ├── types/            # TypeScript interfaces
│   │       └── utils/            # scoring.ts (rule engine + confidence)
│   └── backend/
│       └── src/
│           ├── functions/        # 12 HTTP endpoints
│           ├── lib/
│           │   ├── cosmosClient.ts
│           │   ├── openaiClient.ts
│           │   ├── storageClient.ts
│           │   ├── recommendationRules.ts
│           │   ├── pricingEngine.ts
│           │   └── pdf/                  # Modular PDF generator
│           │       ├── constants.ts      # Colors, spacing, fonts
│           │       ├── helpers.ts        # Drawing utilities
│           │       ├── pageManager.ts    # Pagination + overflow
│           │       ├── cover.ts          # Cover page
│           │       ├── sections.ts       # All report sections
│           │       ├── generator.ts      # Entry point
│           │       └── components/       # badges, layout, progress, typography
│           └── types/
├── infra/
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       └── modules/              # resource-group, cosmos-db, functions,
│                                 # storage, key-vault, openai, logic-apps,
│                                 # static-web-app, app-insights
└── .github/
    └── workflows/
        ├── frontend.yml
        ├── backend.yml
        └── terraform.yml
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/assessment` | function key | Submit assessment |
| POST | `/api/assessment/{id}/generate` | function key | Generate AI report |
| GET | `/api/assessments` | function key | List all assessments |
| GET | `/api/assessment/{id}` | function key | Get single assessment |
| GET | `/api/assessment/{id}/report` | function key | Get full report |
| POST | `/api/assessment/{id}/pdf` | function key | Generate PDF |
| GET | `/api/assessment/{id}/pdf-url` | function key | Get SAS URL (24hr) |
| POST | `/api/assessment/{id}/send` | function key | Send PDF via email |
| POST | `/api/invitations/create` | function key | Create invitation |
| GET | `/api/invitations` | function key | List all invitations |
| GET | `/api/invitations/{token}/validate` | anonymous | Validate client token |
| POST | `/api/invitations/{token}/complete` | anonymous | Mark invitation complete |

---

## 📄 PDF Report Structure

The PDF is generated server-side using PDFKit with a modular architecture:

| Page | Content |
|---|---|
| 1 | Cover — company name, score badge, prepared by, metadata |
| 2 | Executive Summary + Cloud Readiness Score |
| 3 | Key Findings + Business Risk Assessment |
| 4 | Recommended Azure Services + Migration Roadmap |
| 5 | Estimated Cost & ROI + Next Steps + CTA + Disclaimer |

The `PageManager` class handles automatic pagination — sections overflow to new pages when content exceeds page boundaries.

---

## 🚀 Local Development

### Prerequisites
- Node.js 22+
- Azure Functions Core Tools v4
- Terraform 1.12+
- Azure CLI

### Setup

```bash
git clone https://github.com/MahmoudG27/cloudready-assessment

# Frontend
cd apps/frontend
npm install
npm run dev

# Backend
cd apps/backend
npm install
npm run build
func start
```

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_URL=http://localhost:7071/api
VITE_FUNCTION_KEY=your_function_key
VITE_USER_ID=anonymous
VITE_ENTRA_CLIENT_ID=your_client_id
VITE_ENTRA_TENANT_ID=your_tenant_id
```

**Backend** (`local.settings.json`):
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "...",
    "STORAGE_CONNECTION_STRING": "...",
    "COSMOS_CONNECTION_STRING": "...",
    "COSMOS_DATABASE_NAME": "...",
    "COSMOS_INVITATIONS_CONTAINER": "...",
    "OPENAI_API_KEY": "...",
    "OPENAI_ENDPOINT": "...",
    "LOGIC_APP_TRIGGER_URL": "...",
    "OPENAI_DEPLOYMENT_NAME": "gpt-4o",
    "SYSTEM_PROMPT": "...",
    "FRONTEND_URL": "http://localhost:5173"
  },
  "Host": {
  "CORS": "*"
  }
}
```

---

## ☁️ Infrastructure Deployment

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

---

## 🔑 Key Design Decisions

**1. Token-based client access (not B2C)**
Clients are one-time users — they fill one assessment and receive one report. A cryptographic invitation token is simpler, cheaper, and more appropriate than a full identity platform.

**2. Rule Engine + AI (not AI-only)**
Pure AI recommendations are inconsistent. The rule engine ensures deterministic, defensible recommendations while AI adds professional narrative.

**3. Score and cost override after AI**
The AI cannot modify calculated scores or costs. Both are computed deterministically and injected post-generation, preventing hallucination.

**4. PDF generated server-side**
Enables email delivery as attachment and SAS URL sharing. Client-side PDF generation cannot support these workflows.

**5. Serverless-first**
Azure Functions Consumption plan keeps costs near zero during development and scales automatically in production.

**6. Cosmos DB over SQL**
Assessment documents have variable structure per industry. NoSQL avoids schema migrations as the product evolves.

---

## 📊 Scoring Reference

| Category | Weight | Key Factors |
|---|---|---|
| Infrastructure | 40% | Hosting type, age, availability, backup |
| Security | 35% | Data sensitivity, IAM, incidents, compliance |
| Team Readiness | 25% | IT capacity, new app plans, priorities |

| Score | Level |
|---|---|
| 71–100 | Advanced |
| 41–70 | Developing |
| 0–40 | Beginner |

---

## 👤 Author

**Mahmoud Gamal**
Cloud & DevOps Engineer | AZ-104 | AZ-204 | AZ-400 | CKA | RHCSA | RHCE

[LinkedIn](https://www.linkedin.com/in/mahmoud-gamal-593039257) | [GitHub](https://www.github.com/MahmoudG27)

---