variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}
variable "tenant_id" {
  description = "Azure Tenant ID"
  type        = string
  sensitive   = true
}

variable "object_id" {
  description = "Azure Object ID"
  type        = string
  sensitive   = true
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "cloudready"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "uaenorth"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "rg-cloudready-dev"
}