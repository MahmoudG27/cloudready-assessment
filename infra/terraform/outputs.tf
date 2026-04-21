output "resource_group_name" {
  value = module.resource_group.name
}

output "resource_group_location" {
  value = module.resource_group.location
}

output "function_app_name" {
  value = module.functions.function_app_name
}

output "function_app_hostname" {
  value = module.functions.default_hostname
}

output "static_web_app_api_key" {
  value     = module.static_web_app.api_key
  sensitive = true
}

output "static_web_app_hostname" {
  value = module.static_web_app.hostname
}

output "cosmos_endpoint" {
  value = module.cosmos_db.endpoint
}

output "openai_endpoint" {
  value = module.openai.endpoint
}