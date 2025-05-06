variable "project_id" {
  type        = string
  description = "Project ID"
}

variable "gcp_region" {
  type        = string
  description = "GCP region"
}

variable "gcp_zone" {
  type        = string
  description = "GCP zone"
}

variable "ssh_username" {
  type        = string
  description = "Default username for the OS image"
}

variable "ssh_public_key_path" {
  description = "Path to your public SSH key"
}

variable "ssh_agent_identity" {
  type        = string
  description = "SSH agent identity"
  sensitive   = true
}

variable "instance_name" {
  type        = string
  description = "Name of the instance"
}

variable "instance_type" {
  type        = string
  description = "Instance type"
}

variable "disk_image" {
  type        = string
  description = "Disk image type"
}

variable "disk_size" {
  type        = number
  description = "Disk size in GB"
}

variable "disk_type" {
  type        = string
  description = "Disk type"
}
