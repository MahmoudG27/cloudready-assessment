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
      companyName = {
        type = "string"
      }
      level = {
        type = "string"
      }
      pdfBase64 = {
        type = "string"
      }
      pdfFileName = {
        type = "string"
      }
      reportId = {
        type = "string"
      }
      score = {
        type = "number"
      }
      subject = {
        type = "string"
      }
      to = {
        type = "string"
      }
    }
    required = ["to", "subject", "companyName", "reportId", "pdfBase64", "pdfFileName"]
  })
}
