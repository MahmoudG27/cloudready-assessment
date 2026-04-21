resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "azurerm_cosmosdb_account" "main" {
  name                = "cosmos-${var.project}-${var.environment}-${random_string.suffix.result}"
  location            = var.location
  resource_group_name = var.resource_group_name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
    zone_redundant    = false
  }

  capabilities {
    name = "EnableServerless"
  }

  tags = {
    environment = var.environment
    project     = var.project
    managed_by  = "terraform"
  }
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "cloudready-db"
  resource_group_name = var.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
}

resource "azurerm_cosmosdb_sql_container" "assessments" {
  name                = "assessments"
  resource_group_name = var.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/userId"]

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    excluded_path {
      path = "/report/data/*"
    }

    composite_index {
      index {
        path  = "/userId"
        order = "Ascending"
      }
      index {
        path  = "/createdAt"
        order = "Descending"
      }
    }
  }
}


# Serverless — We chose "EnableServerless" instead of provisioned throughput because it saves a lot of cost in development. If we later need a constant throughput in production, we'll change this.

# Partition key "/userId" — This makes all user queries fast and go to the same partition.

# Indexing — We set the excluded_path to /report/data/* because the report data is large and doesn't need to be indexed — this saves storage and speeds up writes.