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
    SYSTEM_PROMPT                         = "@Microsoft.KeyVault(VaultName=${var.key_vault_name};SecretName=system-prompt)"
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