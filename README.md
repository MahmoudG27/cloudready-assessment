# MG CloudReady — SME Cloud Readiness Assessment Tool

> An AI-powered cloud readiness assessment platform that helps 
> sales engineers evaluate SME clients and generate professional 
> migration reports in minutes.

## 🔗 Live Demo
[https://gentle-field-0f601ca03.7.azurestaticapps.net](https://gentle-field-0f601ca03.7.azurestaticapps.net)

---

## 🧩 What Problem Does It Solve?

Sales engineers at cloud consultancies spend hours manually 
assessing client infrastructure before recommending Azure services. 
This tool automates that process:

1. Client answers 20 questions about their infrastructure
2. A rule engine calculates a readiness score with conditional penalties
3. Azure OpenAI generates a professional, industry-specific report
4. The report is delivered as a PDF via email in under 2 minutes

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│         React + TypeScript on Azure Static Web Apps │
└─────────────────────┬───────────────────────────────┘
│ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                    Backend                          │
│              Azure Functions (Node.js)              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Assessment │  │   Report     │  │    PDF     │  │
│  │     API     │  │  Generator   │  │  Service   │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
└─────────┼────────────────┼────────────────┼─────────┘
│                │                │
┌─────────▼────┐  ┌────────▼──────┐  ┌─────▼────────┐
│  Cosmos DB   │  │ Azure OpenAI  │  │ Blob Storage │
│  (NoSQL)     │  │   (GPT-4o)    │  │  (PDF store) │
└──────────────┘  └───────────────┘  └──────────────┘
│                                  │
┌─────────▼──────────────────────────────────▼───────┐
│                  Supporting Services                │
│   Key Vault  │  App Insights  │  Logic Apps (Email) │
└─────────────────────────────────────────────────────┘

---

## 🧠 How the Intelligence Works

### 1. Scoring Engine (Rule-based)
Located in `apps/frontend/src/utils/scoring.ts`

The score is calculated across 3 dimensions:
- **Infrastructure (40%)** — hosting type, age, availability, backup
- **Security (35%)** — data sensitivity, IAM, incidents, compliance  
- **Team Readiness (25%)** — IT capacity, priorities

**Conditional Penalties** — critical combinations trigger score caps:
```typescript
// Example: Health data + no IAM = security capped at 35%
if (sensitiveDataType === "Health data" && accessControl === "No formal system") {
  security = Math.min(security, 35);
}
```

### 2. Recommendation Rules Engine (Deterministic)
Located in `apps/backend/src/lib/recommendationRules.ts`

Before calling the AI, a rule engine determines:
- Which Azure services to recommend (based on answers)
- Architecture layer mapping
- Migration warnings

```typescript
// Example: Containers + small team = Container Apps, not AKS
if (infraType === "Containers" && !hasDevOps && !isBigCompany) {
  recommend("Azure Container Apps"); // not AKS — overkill
}
```

### 3. AI Report Generation (Explainer)
Located in `apps/backend/src/lib/openaiClient.ts`

Azure OpenAI (GPT-4o) receives:
- Assessment answers
- Pre-calculated score
- Deterministic recommendations from the rules engine
- Industry-specific context (Healthcare/Fintech/SaaS etc.)

The AI **explains** the decisions — it doesn't make them.
This ensures consistency, reduces hallucination, and improves trust.

### 4. Confidence Score
Dynamically calculated based on answer quality:
```typescript
confidence = 95 - (notSureAnswers * 8) - penalties
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| Axios | HTTP client |
| Azure Static Web Apps | Hosting |

### Backend
| Technology | Purpose |
|---|---|
| Azure Functions v4 (Node.js) | Serverless API |
| TypeScript | Type safety |
| Azure Cosmos DB | NoSQL document storage |
| Azure OpenAI (GPT-4o) | Report generation |
| Azure Blob Storage | PDF storage |
| Azure Key Vault | Secrets management |
| Logic Apps | Email delivery |
| Application Insights | Monitoring |

### Infrastructure
| Technology | Purpose |
|---|---|
| Terraform | Infrastructure as Code |
| GitHub Actions | CI/CD pipeline |
| Azure Static Web Apps | Frontend hosting |
| Azure Functions (Consumption) | Backend hosting |

---

## 📁 Project Structure
cloudready-assessment/
├── apps/
│   ├── frontend/                 # React application
│   │   └── src/
│   │       ├── pages/            # Route pages
│   │       ├── components/       # Reusable UI components
│   │       ├── services/         # API client
│   │       ├── hooks/            # Custom React hooks
│   │       ├── types/            # TypeScript interfaces
│   │       └── utils/            # Scoring + confidence engine
│   └── backend/                  # Azure Functions
│       └── src/
│           ├── functions/        # HTTP endpoints
│           ├── lib/              # Shared services
│           │   ├── cosmosClient.ts
│           │   ├── openaiClient.ts
│           │   ├── storageClient.ts
│           │   ├── pdfGenerator.ts
│           │   └── recommendationRules.ts
│           └── types/            # Shared TypeScript types
├── infra/
│   └── terraform/                # Azure infrastructure
│       ├── main.tf
│       ├── variables.tf
│       └── modules/              # One module per Azure service
└── .github/
└── workflows/                # CI/CD pipelines

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/assessment` | Submit assessment answers |
| POST | `/api/assessment/{id}/generate` | Generate AI report |
| GET | `/api/assessments` | List all assessments |
| GET | `/api/assessment/{id}` | Get single assessment |
| GET | `/api/assessment/{id}/report` | Get full report |
| POST | `/api/assessment/{id}/pdf` | Generate PDF |
| GET | `/api/assessment/{id}/pdf-url` | Get SAS URL for PDF |
| POST | `/api/assessment/{id}/send` | Send report via email |

---

## 🚀 Local Development

### Prerequisites
- Node.js 22+
- Azure Functions Core Tools v4
- Terraform 1.12+
- Azure CLI

### Setup

```bash
# Clone the repository
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
VITE_API_URL=http://localhost:7071/api
VITE_FUNCTION_KEY=
VITE_USER_ID=anonymous

**Backend** (`local.settings.json`):
```json
{
  "Values": {
    "COSMOS_CONNECTION_STRING": "...",
    "OPENAI_API_KEY": "...",
    "OPENAI_ENDPOINT": "...",
    "OPENAI_DEPLOYMENT_NAME": "gpt-4o",
    "STORAGE_CONNECTION_STRING": "...",
    "LOGIC_APP_TRIGGER_URL": "...",
    "SYSTEM_PROMPT": "..."
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

**1. Rule Engine + AI (not AI-only)**  
Pure AI recommendations are inconsistent. The rule engine ensures deterministic, defensible recommendations while AI adds professional narrative.

**2. Serverless-first**  
Azure Functions Consumption plan keeps costs near zero during development and scales automatically in production.

**3. Cosmos DB over SQL**  
Assessment documents have variable structure per industry. NoSQL avoids schema migrations as the product evolves.

**4. PDF generated server-side**  
Enables email automation and SAS URL sharing — client-side PDF generation can't support these workflows.

**5. Score override after AI response**  
The AI cannot modify calculated scores. Scores are computed deterministically and injected post-generation.

---

## 📊 Assessment Scoring

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

## 🗺️ Roadmap

- [ ] Azure AD B2C — client authentication + invitation system
- [ ] Migration Complexity Score
- [ ] Executive Summary section
- [ ] Assessment Knowledge Layer (JSON-based rules)
- [ ] Multi-language support (Arabic)

---

## 👤 Author

**Mahmoud Gamal**  
Cloud & DevOps Engineer | AZ-400 | AZ-204 | AZ-104 | CKA | RHCE  
[LinkedIn](www.linkedin.com/in/mahmoud-gamal-593039257) | [GitHub](https://github.com/MahmoudG27)

---

*Built with Azure OpenAI, Azure Functions, Terraform, and React*