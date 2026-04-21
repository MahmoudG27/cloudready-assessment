output "workflow_id" {
  value = azurerm_logic_app_workflow.email.id
}

output "workflow_name" {
  value = azurerm_logic_app_workflow.email.name
}

output "trigger_url" {
  value     = azurerm_logic_app_trigger_http_request.email_trigger.callback_url
  sensitive = true
}