resource "azurerm_static_web_app" "main" {
  name                = "stapp-${var.project}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}