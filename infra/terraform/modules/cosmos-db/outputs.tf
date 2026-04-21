output "account_name" {
  value = azurerm_cosmosdb_account.main.name
}

output "account_id" {
  value = azurerm_cosmosdb_account.main.id
}

output "endpoint" {
  value = azurerm_cosmosdb_account.main.endpoint
}

output "primary_key" {
  value     = azurerm_cosmosdb_account.main.primary_key
  sensitive = true
}

output "connection_string" {
  value     = azurerm_cosmosdb_account.main.primary_sql_connection_string
  sensitive = true
}

output "database_name" {
  value = azurerm_cosmosdb_sql_database.main.name
}

output "container_name" {
  value = azurerm_cosmosdb_sql_container.assessments.name
}