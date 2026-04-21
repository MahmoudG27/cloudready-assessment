output "endpoint" {
  value = azurerm_cognitive_account.main.endpoint
}

output "primary_key" {
  value     = azurerm_cognitive_account.main.primary_access_key
  sensitive = true
}

output "id" {
  value = azurerm_cognitive_account.main.id
}

output "deployment_name" {
  value = azurerm_cognitive_deployment.gpt4o.name
}