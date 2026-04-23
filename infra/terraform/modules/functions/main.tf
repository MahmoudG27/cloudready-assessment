resource "azurerm_service_plan" "main" {
  name                = "asp-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = "Y1"

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}

resource "azurerm_linux_function_app" "main" {
  name                       = "func-${var.project}-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  service_plan_id            = azurerm_service_plan.main.id
  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_account_access_key
  https_only                 = true

  site_config {
    application_stack {
      node_version = "22"
    }
    cors {
      allowed_origins = ["https://${var.static_web_app_hostname}"]
    }
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME              = "node"
    WEBSITE_RUN_FROM_PACKAGE              = "1"
    APPLICATIONINSIGHTS_CONNECTION_STRING = var.app_insights_connection_string
    COSMOS_CONNECTION_STRING              = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=cosmos-connection-string)"
    OPENAI_API_KEY                        = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=openai-api-key)"
    STORAGE_CONNECTION_STRING             = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=storage-connection-string)"
    OPENAI_ENDPOINT                       = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=openai-endpoint)"
    LOGIC_APP_TRIGGER_URL                 = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=logic-app-trigger-url)"
    OPENAI_DEPLOYMENT_NAME                = var.openai_deployment_name
    SYSTEM_PROMPT                         = "You are a senior Azure Cloud Solutions Architect at KlayyTech, a Microsoft partner specializing in cloud transformation for SMEs and enterprises in Egypt and the MENA region. Your task is to analyze cloud readiness assessment data and generate a structured, actionable Cloud Readiness Report. STRICT RULES: Always return valid JSON only. No explanations, no markdown, no extra text. Return JSON matching the required schema as closely as possible. Do not invent new fields. Keep responses concise, clear, and professional. All recommendations must be based on the provided inputs — no generic advice. Only recommend Microsoft Azure services. Use realistic, conservative estimates — avoid exaggeration. If data is insufficient for any field, return insufficient data in that field instead of guessing. CONTENT RULES: IT maturity must be justified with a clear, specific reason based on the inputs. Key findings must include both risks and strengths. Risk assessment must focus on business impact, not just technical issues. Include mitigation steps. Recommended services must explain WHY each service fits this specific company profile. Each recommended service must lead with a business outcome, not a technical description. Architecture must be simple, layered App Data Security, and aligned with the company profile. Roadmap must be practical, phased, and reference KlayyTech support where relevant. Assumptions made during report generation must be noted in estimatedMonthlyCost notes. CRITICAL: Return raw JSON only. Do NOT wrap in markdown. Do NOT use backticks. Do NOT write json before the opening brace."
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}