module "resource_group" {
  source      = "./modules/resource-group"
  name        = var.resource_group_name
  location    = var.location
  environment = var.environment
  project     = var.project
}

module "key_vault" {
  source              = "./modules/key-vault"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name

  tenant_id = var.tenant_id
  object_id = var.object_id
}

module "monitoring" {
  source              = "./modules/monitoring"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

module "storage" {
  source              = "./modules/storage"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = module.storage.primary_connection_string
  key_vault_id = module.key_vault.id

  depends_on = [module.key_vault]
}

module "cosmos_db" {
  source              = "./modules/cosmos-db"
  project             = var.project
  environment         = var.environment
  location            = "northeurope"
  resource_group_name = module.resource_group.name
}

resource "azurerm_key_vault_secret" "cosmos_connection_string" {
  name         = "cosmos-connection-string"
  value        = module.cosmos_db.connection_string
  key_vault_id = module.key_vault.id

  depends_on = [module.key_vault]
}

module "functions" {
  source              = "./modules/functions"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name

  storage_account_name           = module.storage.account_name
  storage_account_access_key     = module.storage.primary_access_key
  app_insights_connection_string = module.monitoring.connection_string
  openai_deployment_name         = module.openai.deployment_name
  key_vault_id                   = module.key_vault.id
  key_vault_name                 = module.key_vault.name
  static_web_app_hostname        = module.static_web_app.hostname
  tenant_id                      = var.tenant_id
}

resource "azurerm_key_vault_access_policy" "functions" {
  key_vault_id = module.key_vault.id
  tenant_id    = var.tenant_id
  object_id    = module.functions.principal_id

  secret_permissions = [
    "Get", "List"
  ]
}

module "static_web_app" {
  source              = "./modules/static-web-app"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

module "openai" {
  source              = "./modules/openai"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

resource "azurerm_key_vault_secret" "openai_api_key" {
  name         = "openai-api-key"
  value        = module.openai.primary_key
  key_vault_id = module.key_vault.id

  depends_on = [module.key_vault]
}

resource "azurerm_key_vault_secret" "openai_endpoint" {
  name         = "openai-endpoint"
  value        = module.openai.endpoint
  key_vault_id = module.key_vault.id

  depends_on = [module.key_vault]
}

module "logic_apps" {
  source              = "./modules/logic-apps"
  project             = var.project
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

resource "azurerm_key_vault_secret" "logic_app_trigger_url" {
  name         = "logic-app-trigger-url"
  value        = module.logic_apps.trigger_url
  key_vault_id = module.key_vault.id

  depends_on = [module.key_vault]
}