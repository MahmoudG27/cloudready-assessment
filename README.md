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




az ad sp create-for-rbac --name "sp-cloudready-github" --role contributor --scopes /subscriptions/<subscription-id> --sdk-auth

AZURE_CREDENTIALS: Service Principal JSON
TF_VAR_subscription_id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
TF_VAR_tenant_id: ${{ secrets.AZURE_TENANT_ID }}
TF_VAR_object_id: ${{ secrets.AZURE_OBJECT_ID }}
TF_VAR_project: ${{ secrets.TF_PROJECT }}
TF_VAR_environment: ${{ secrets.TF_ENVIRONMENT }}
TF_VAR_location: ${{ secrets.TF_LOCATION }}
TF_VAR_resource_group_name: ${{ secrets.TF_RESOURCE_GROUP_NAME }}

terraform output -raw function_app_name
terraform output -raw function_app_hostname
terraform output -raw static_web_app_api_key

FUNCTION_APP_NAME: func-cloudready-dev
FUNCTION_APP_URL: function app hostname
STATIC_WEB_APP_API_TOKEN: from Terraform output


