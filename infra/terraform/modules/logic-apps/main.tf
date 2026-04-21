resource "azurerm_logic_app_workflow" "email" {
  name                = "logic-${var.project}-email-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}

resource "azurerm_logic_app_trigger_http_request" "email_trigger" {
  name         = "email-trigger"
  logic_app_id = azurerm_logic_app_workflow.email.id

  schema = jsonencode({
    type = "object"
    properties = {
      to = {
        type = "string"
      }
      subject = {
        type = "string"
      }
      reportId = {
        type = "string"
      }
      companyName = {
        type = "string"
      }
      reportUrl = {
        type = "string"
      }
    }
    required = ["to", "subject", "reportId", "companyName", "reportUrl"]
  })
}