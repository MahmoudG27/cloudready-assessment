# CloudReady Assessment

AI-powered Cloud Readiness Assessment Tool built on Azure for KlayyTech.
Helps sales engineers assess client cloud readiness and generate professional reports.

## Status
Phase 2 complete — planning and design done.
Phase 3 next — Infrastructure (Terraform + Azure setup).

## Docs
- `docs/architecture.md` — full architecture and tech stack
- `docs/assessment-questions.md` — 15 assessment questions + scoring logic
- `docs/report-structure.md` — 10-section report design decisions
- `docs/cosmos-schema.json` — Cosmos DB document schema
- `docs/prompts/system-prompt.txt` — Azure OpenAI system prompt
- `docs/prompts/user-prompt.txt` — Azure OpenAI user prompt template

1. اختار **Send an email (V2)**
2. سجل دخول بـ account بتاعك
3. في الـ **To** field حط:
```
@{triggerBody()?['to']}
```
4. **Subject**:
```
@{triggerBody()?['subject']}
```
5. **Body**:
```
Dear Client,

Your Cloud Readiness Report for @{triggerBody()?['companyName']} is ready.

Report ID: @{triggerBody()?['reportId']}

Download your report: @{triggerBody()?['reportUrl']}

Best regards,
KlayyTech Cloud Team
```