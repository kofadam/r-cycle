# R-Cycle Kubernetes Quick Start

This is a condensed guide for deploying R-Cycle to Kubernetes in restricted/air-gap environments.

## Pre-Deployment (Air-Gap Preparation)

### On Internet-Connected Machine

```bash
# Export Docker images
docker save kofadam/r-cycle:0.1.0 -o r-cycle-0.1.0.tar
docker save postgres:15-alpine -o postgres-15-alpine.tar

# Transfer both .tar files to restricted environment via USB/secure transfer
```

### On Restricted Network

```bash
# Load images
docker load -i r-cycle-0.1.0.tar
docker load -i postgres-15-alpine.tar

# If using internal registry, tag and push
docker tag kofadam/r-cycle:0.1.0 registry.internal/r-cycle:0.1.0
docker tag postgres:15-alpine registry.internal/postgres:15-alpine
docker push registry.internal/r-cycle:0.1.0
docker push registry.internal/postgres:15-alpine

# Update image references in YAML files if using internal registry
```

## Deployment (5 Steps)

### 1. Create Namespace & ConfigMap

```bash
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-configmap.yaml
```

### 2. Create Secrets

**Option A - Quick (default POC credentials):**
```bash
cp 02-secret.yaml.template 02-secret.yaml
kubectl apply -f 02-secret.yaml
rm 02-secret.yaml
```

**Option B - Automated with custom password:**
```bash
bash create-secret.sh
```

### 3. Deploy PostgreSQL

```bash
kubectl apply -f 10-postgres-pvc.yaml
kubectl apply -f 11-postgres-deployment.yaml
kubectl apply -f 12-postgres-service.yaml

# Wait for ready
kubectl wait --for=condition=ready pod -l app=postgres -n r-cycle --timeout=180s
```

### 4. Initialize Database

```bash
kubectl apply -f 20-db-init-job.yaml

# Wait for completion
kubectl wait --for=condition=complete job/db-init -n r-cycle --timeout=120s

# Verify logs
kubectl logs -n r-cycle -l component=db-init
```

### 5. Deploy Application

```bash
kubectl apply -f 30-r-cycle-deployment.yaml
kubectl apply -f 31-r-cycle-service.yaml

# Wait for ready
kubectl wait --for=condition=available deployment/r-cycle -n r-cycle --timeout=300s
```

## Access Application

```bash
# Port forward to localhost
kubectl port-forward -n r-cycle svc/r-cycle 8080:80

# Open browser to http://localhost:8080
```

## One-Command Deployment

```bash
# Automated deployment (interactive)
bash deploy.sh
```

## Verification

```bash
# Check all resources
kubectl get all -n r-cycle

# Check logs
kubectl logs -n r-cycle -l app=r-cycle --tail=50

# Test database
kubectl exec -it -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U postgres -d r_cycle -c "SELECT COUNT(*) FROM listings;"
```

## Common Issues

### Image Pull Error
- Images not loaded: `docker load -i <file>.tar`
- Internal registry: Update image paths in YAML files

### Database Init Job Fails
```bash
# Check logs
kubectl logs -n r-cycle -l component=db-init

# Common fix: PostgreSQL not ready, wait and rerun
kubectl delete job db-init -n r-cycle
kubectl apply -f 20-db-init-job.yaml
```

### Pods Not Starting
```bash
# Check events
kubectl get events -n r-cycle --sort-by='.lastTimestamp'

# Check specific pod
kubectl describe pod -n r-cycle <pod-name>
```

## Quick Commands

```bash
# Restart app
kubectl rollout restart deployment/r-cycle -n r-cycle

# Scale
kubectl scale deployment r-cycle -n r-cycle --replicas=5

# Delete everything
kubectl delete namespace r-cycle

# Backup database
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- pg_dump -U postgres r_cycle > backup.sql
```

## File Order

Deploy in this order:
1. `00-namespace.yaml` - Namespace
2. `01-configmap.yaml` - Configuration
3. `02-secret.yaml` - Secrets (from template)
4. `10-postgres-pvc.yaml` - Storage
5. `11-postgres-deployment.yaml` - Database
6. `12-postgres-service.yaml` - Database service
7. `20-db-init-job.yaml` - Schema initialization
8. `30-r-cycle-deployment.yaml` - Application
9. `31-r-cycle-service.yaml` - Application service
10. `32-r-cycle-ingress.yaml` - Optional ingress

## Default Credentials (POC)

- **PostgreSQL User:** `postgres`
- **PostgreSQL Password:** `postgres`
- **Database Name:** `r_cycle`
- **Connection String:** `postgresql://postgres:postgres@postgres:5432/r_cycle`

**⚠️ Change these for production!**

## Support

Full documentation: [README.md](README.md)
