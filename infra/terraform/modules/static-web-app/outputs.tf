output "id" {
  value = azurerm_static_web_app.main.id
}

output "hostname" {
  value = azurerm_static_web_app.main.default_host_name
}

output "api_key" {
  value     = azurerm_static_web_app.main.api_key
  sensitive = true
}