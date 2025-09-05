    terraform {
      backend "gcs" {
        bucket = "rit_migration_terraform_state" 
        # Common backend configuration, specific details will be overridden by --backend-config
      }
    }
