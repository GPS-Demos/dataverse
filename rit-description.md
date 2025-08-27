# Data Commons Website - Application Description

## Application Overview

The application is the official website for [Data Commons](https://datacommons.org/), an open knowledge graph that provides a unified view across multiple public data sets and statistics. It allows users to browse, visualize, and analyze data from various sources. The platform is designed to make public data accessible to everyone, from students to researchers.

## Code Languages and Versions

The application is built using a combination of languages and frameworks:

*   **Backend:**
    *   **Language:** Python
    *   **Version:** 3.11
    *   **Framework:** Flask
*   **Frontend:**
    *   **Language:** TypeScript
    *   **Version:** Node.js 18
    *   **Framework/Library:** React, Webpack, D3.js for visualizations.
*   **Testing:**
    *   **Language:** Go is used for testing the Terraform modules.

## Infrastructure

The application is designed to run on a cloud-native infrastructure:

*   **Containerization:** The application and its services are containerized using **Docker**.
*   **Orchestration:** **Google Kubernetes Engine (GKE)** is used for deploying and managing the containerized application.
*   **Package Management:** **Helm** is used for packaging and deploying applications on Kubernetes.
*   **Local Development:** **Skaffold** is used to facilitate local development with **Minikube**.
*   **CI/CD:** **Google Cloud Build** is used for continuous integration and deployment pipelines.

## Google Cloud Platform (GCP) Services Used

The application leverages a variety of GCP services:

*   **Compute:** Google Kubernetes Engine (GKE)
*   **CI/CD:** Cloud Build
*   **Database & Storage:**
    *   Cloud Memorystore for Redis
    *   Cloud Bigtable
    *   Cloud Storage
*   **Security & Identity:** Secret Manager
*   **AI/ML:**
    *   AI Platform (Vertex AI)
    *   Generative Language API
*   **Data & Analytics:** Dataflow
*   **Networking & APIs:**
    *   Anthos
    *   Maps & Places APIs
*   **Management & Governance:**
    *   Cloud Resource Manager
    *   Service Control

## Terraform

Yes, **Terraform** is included in the repository for infrastructure as code. The Terraform configurations can be found in the `deploy/terraform-datacommons-website/` directory. These configurations are used to provision and manage the cloud infrastructure required by the application.
