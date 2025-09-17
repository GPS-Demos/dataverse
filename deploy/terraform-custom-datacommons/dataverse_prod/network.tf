resource "google_compute_subnetwork" "default_subnet" {
  name          = var.vpc_network_subnet_name
  region        = "us-central1"
  network       = resource.google_compute_network.default.id
  ip_cidr_range = "10.0.0.0/16"
}

resource "google_compute_network" "default" {
  name                    = var.vpc_network_name
  auto_create_subnetworks = false
}
