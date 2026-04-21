variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "storage_account_name" {
  type = string
}

variable "storage_account_access_key" {
  type      = string
  sensitive = true
}

variable "app_insights_connection_string" {
  type      = string
  sensitive = true
}

variable "key_vault_id" {
  type = string
}

variable "key_vault_name" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "openai_deployment_name" {
  type = string
}

variable "static_web_app_hostname" {
  type = string
}