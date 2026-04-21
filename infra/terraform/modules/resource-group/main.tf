resource "azurerm_resource_group" "main" {
  name     = var.name
  location = var.location

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}