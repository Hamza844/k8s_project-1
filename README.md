<div align="center">

# K8s Project-1 — Inkwell Blog Platform

### 2-Tier React + PostgreSQL App Deployed on Kubernetes (KIND Cluster)

[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

</div>

---

## Overview

**Inkwell** is a full-stack blog platform built with React and PostgreSQL, containerized with Docker, and deployed on a local Kubernetes cluster using KIND (Kubernetes IN Docker). This project demonstrates production-style Kubernetes deployment patterns — service discovery, persistent storage, secrets management, and stateful workloads — all running locally without any cloud dependency.

---

## Application Screenshots

<div align="center">

**Sign In Page**

![Inkwell Sign In](./attached_assets/signin.png)

**Explore Topics**

![Inkwell Explore](./attached_assets/explore.png)

**KIND Cluster — Pods Running**

![K8s Pods](./attached_assets/k8s_pods.png)

**Terminal — Deployment Output**

![Terminal Deploy](./attached_assets/terminal_deploy.png)

</div>

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          KIND Cluster                            │
│                                                                  │
│   ┌───────────────────┐           ┌──────────────────────────┐   │
│   │   FRONTEND TIER   │           │      BACKEND TIER        │   │
│   │                   │  REST     │                          │   │
│   │  React + Vite     │◄─────────►│  Node.js / Express       │   │
│   │  TypeScript       │  API      │  Drizzle ORM             │   │
│   │                   │           │                          │   │
│   │  [Deployment]     │           │  [Deployment]            │   │
│   │  [Service:NodePort]           │  [Service:ClusterIP]     │   │
│   └───────────────────┘           └────────────┬─────────────┘   │
│                                                │                 │
│                                                ▼                 │
│                                   ┌────────────────────────┐     │
│                                   │     DATABASE TIER      │     │
│                                   │                        │     │
│                                   │  PostgreSQL 15         │     │
│                                   │  [StatefulSet]         │     │
│                                   │  [PersistentVolume]    │     │
│                                   └────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

**Application**

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 |
| ORM | Drizzle ORM |

**Infrastructure**

| Tool | Purpose |
|------|---------|
| Docker | Containerization & multi-stage builds |
| Docker Compose | Local development environment |
| Kubernetes (KIND) | Container orchestration on local cluster |
| kubectl | Cluster management |

---

## Kubernetes Resources

| Resource | Type | Purpose |
|----------|------|---------|
| `frontend-deployment` | Deployment | Manages React app pods |
| `frontend-service` | NodePort | Exposes app to external traffic |
| `backend-deployment` | Deployment | Manages API server pods |
| `backend-service` | ClusterIP | Internal cluster communication |
| `postgres-statefulset` | StatefulSet | Stable identity for database pod |
| `postgres-service` | Headless Service | DNS-based DB discovery |
| `postgres-pvc` | PersistentVolumeClaim | Data persistence across restarts |
| `app-configmap` | ConfigMap | Non-sensitive environment config |
| `app-secret` | Secret | Encrypted database credentials |

---

## Project Structure

```
k8s_project-1/
├── client/                  # React frontend (TypeScript + Vite)
├── server/                  # Node.js backend API
├── shared/                  # Shared types between client and server
├── script/                  # Utility and deployment scripts
├── .local/                  # Kubernetes manifests
├── attached_assets/         # Project screenshots
├── Dockerfile               # Multi-stage production build
├── docker-compose.yaml      # Local development setup
├── drizzle.config.ts        # ORM + migration configuration
├── components.json          # UI components config
└── package-lock.json        # Dependency lock file
```

---

## Getting Started

### Prerequisites

```bash
docker --version        # Docker 20+
kubectl version         # kubectl CLI
kind version            # KIND CLI
node --version          # Node.js 18+
```

### 1. Clone the Repository

```bash
git clone https://github.com/Hamza844/k8s_project-1.git
cd k8s_project-1
```

### 2. Create the KIND Cluster

```bash
kind create cluster --name blog-cluster
kubectl cluster-info --context kind-blog-cluster
```

### 3. Build and Load the Docker Image

```bash
# Build the production image
docker build -t blog-app:latest .

# Load into KIND (no registry needed)
kind load docker-image blog-app:latest --name blog-cluster
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f .local/

# Verify everything is running
kubectl get pods
kubectl get services
kubectl get pvc
```

### 5. Access the Application

```bash
# Port-forward the frontend service
kubectl port-forward svc/frontend-service 3000:3000
```

Open **http://localhost:3000** in your browser.

---

## Local Development

```bash
# Start all services with Docker Compose
docker-compose up --build

# Run database migrations
npm run db:push
```

---

## Kubernetes Concepts Demonstrated

- **Deployments** — Declarative pod management with replica control
- **StatefulSet** — Stable network identity and ordered pod management for PostgreSQL
- **Services** — NodePort for external access, ClusterIP for internal communication
- **PersistentVolumeClaim** — Data durability across pod restarts and rescheduling
- **ConfigMap & Secrets** — Decoupled, secure configuration management
- **KIND** — Full Kubernetes environment running inside Docker locally

---

## Author

<div align="center">

**Hamza Ejaz** — DevOps Engineer

[![GitHub](https://img.shields.io/badge/GitHub-Hamza844-181717?style=flat&logo=github)](https://github.com/Hamza844)

</div>

---

<div align="center">

*If this project was useful to you, consider leaving a ⭐*

</div>
