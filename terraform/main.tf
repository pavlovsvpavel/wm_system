terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.33.0"
    }

    tls = {
      source  = "hashicorp/tls"
      version = "4.1.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
}

resource "google_service_account" "instance_service_account" {
  account_id   = "bucket-sa"
  display_name = "Instance Custom Service Account"
  description  = "Service Account for Bucket Access"
}

resource "google_project_iam_member" "instance_sa_roles" {
  for_each = toset([
    "roles/iam.serviceAccountUser",
    "roles/storage.objectCreator",
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.instance_service_account.email}"
}

resource "google_compute_network" "wm_system_network" {
  name                    = "wm-system-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "wm_subnet" {
  name          = "wm-subnet"
  ip_cidr_range = "192.168.33.0/24"
  region        = var.gcp_region
  network       = google_compute_network.wm_system_network.id
}

resource "google_compute_firewall" "allow_ssh" {
  name          = "allow-ssh"
  network       = google_compute_network.wm_system_network.name
  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh"]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}

resource "google_compute_firewall" "allow_web" {
  name          = "allow-web-traffic"
  network       = google_compute_network.wm_system_network.name
  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server", "http-server", "https-server"]

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  description = "Allow incoming HTTP and HTTPS traffic"
}

resource "google_compute_firewall" "allow_outbound" {
  name               = "allow-outbound-traffic"
  network            = google_compute_network.wm_system_network.name
  direction          = "EGRESS"
  priority           = 100
  destination_ranges = ["0.0.0.0/0"]
  target_tags        = ["outbound-access"]

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "53"] # HTTP, HTTPS, DNS
  }

  allow {
    protocol = "udp"
    ports    = ["53", "123"] # DNS, NTP
  }

  allow {
    protocol = "icmp"
  }
}

# Use if static IP is present
data "google_compute_address" "existing_static_ip" {
  project = var.project_id
  name    = var.existing_static_ip_name
  region  = var.gcp_region
}

resource "google_compute_instance" "instance_creation" {
  name                      = var.instance_name
  machine_type              = var.instance_type
  zone                      = var.gcp_zone
  allow_stopping_for_update = true
  tags                      = ["ssh", "web-server", "http-server", "https-server", "outbound-access"]

  boot_disk {
    initialize_params {
      image = var.disk_image
      size  = var.disk_size
      type  = var.disk_type
    }
  }

  network_interface {
    network    = google_compute_network.wm_system_network.id
    subnetwork = google_compute_subnetwork.wm_subnet.id

    access_config {
      // Ephemeral public IP
      # use if static IP is present
      nat_ip = data.google_compute_address.existing_static_ip.address
    }
  }

  service_account {
    email = google_service_account.instance_service_account.email
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  metadata = {
    ssh-keys = "${var.ssh_username}:${file(var.ssh_public_key_path)}"
  }
}

resource "null_resource" "install_packages" {
  triggers = {
    instance_id = google_compute_instance.instance_creation.id
  }

  connection {
    type           = "ssh"
    user           = var.ssh_username
    host           = google_compute_instance.instance_creation.network_interface[0].access_config[0].nat_ip
    agent          = true
    timeout        = "5m"
    agent_identity = var.ssh_agent_identity
  }

  provisioner "remote-exec" {
    inline = [
      <<-EOT
        mkdir -p \
          /home/ubuntu/app/envs/backend \
          /home/ubuntu/app/envs/frontend \
          /home/ubuntu/app/scripts
      EOT
    ]
  }

  provisioner "file" {
    source      = "${path.module}/../backend/envs/.env.prod"
    destination = "/home/ubuntu/app/envs/backend/.env.prod"
  }

  provisioner "file" {
    source      = "${path.module}/../frontend/envs/.env.prod"
    destination = "/home/ubuntu/app/envs/frontend/.env.prod"
  }

  provisioner "file" {
    source      = "${path.module}/scripts/setup.sh"
    destination = "/home/ubuntu/app/scripts/setup.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "echo '----- Changing permissions of setup.sh script -----'",
      "if ! chmod +x /home/ubuntu/app/scripts/setup.sh; then",
      "  echo '----- Error: Failed to change permissions -----'",
      "  exit 1",
      "fi",

      "echo '----- Executing setup.sh script -----'",
      "if ! /home/ubuntu/app/scripts/setup.sh; then",
      "  echo '----- Error: Script execution failed -----'",
      "  exit 1",
      "fi",

      "echo '----- Script completed successfully -----'"
    ]
  }
}

output "connection_command" {
  value = format(
    "ssh -i 'google_private_key.pem' ubuntu@%s",
    google_compute_instance.instance_creation.network_interface[0].access_config[0].nat_ip
  )
}
