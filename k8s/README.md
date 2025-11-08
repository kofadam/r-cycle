# R-Cycle Kubernetes Deployment Guide

This guide covers deploying R-Cycle to a Kubernetes cluster, including air-gapped/restricted network environments.

## Overview

The deployment includes:
- **PostgreSQL 15** (Alpine) - 1 replica with persistent storage
- **R-Cycle application** - 2 replicas with auto-scaling capability
- **Database initialization Job** - Runs once to create schema and seed data
- **ConfigMaps** - Non-sensitive configuration
- **Secrets** - Sensitive data (passwords, DATABASE_URL)

## Prerequisites

### Required Images
You need these Docker images available in your cluster:
- `kofadam/r-cycle:0.1.0` (your application)
- `postgres:15-alpine` (database)

### For Air-Gapped Deployment

#### 1. Export Images (on internet-connected machine)

```bash
# Export R-Cycle application
docker save kofadam/r-cycle:0.1.0 -o r-cycle-0.1.0.tar

# Export PostgreSQL
docker pull postgres:15-alpine
docker save postgres:15-alpine -o postgres-15-alpine.tar

# Verify files
ls -lh *.tar
```

#### 2. Transfer to Air-Gapped Environment
Transfer both `.tar` files via:
- USB drive
- Secure file transfer
- Physical media

#### 3. Load Images in Air-Gapped Environment

```bash
# Load images
docker load -i r-cycle-0.1.0.tar
docker load -i postgres-15-alpine.tar

# Verify
docker images | grep -E 'r-cycle|postgres'
```

#### 4. Tag and Push to Internal Registry (if using one)

```bash
# Tag for internal registry
docker tag kofadam/r-cycle:0.1.0 registry.internal.company/r-cycle:0.1.0
docker tag postgres:15-alpine registry.internal.company/postgres:15-alpine

# Push to internal registry
docker push registry.internal.company/r-cycle:0.1.0
docker push registry.internal.company/postgres:15-alpine
```

**Note:** If using an internal registry, update image references in all YAML files:
- `11-postgres-deployment.yaml` - Change `postgres:15-alpine`
- `20-db-init-job.yaml` - Change both images
- `30-r-cycle-deployment.yaml` - Change `kofadam/r-cycle:0.1.0`

## Deployment Steps

### 1. Create Namespace

```bash
kubectl apply -f 00-namespace.yaml
```

### 2. Create ConfigMap

```bash
kubectl apply -f 01-configmap.yaml
```

**Optional:** Verify ConfigMap
```bash
kubectl get configmap -n r-cycle r-cycle-config -o yaml
```

### 3. Create Secrets

⚠️ **IMPORTANT:** The template uses default POC credentials. For production, generate strong credentials.

#### Option A: Use Default POC Credentials (Quick Start)

```bash
# Copy template and apply
cp 02-secret.yaml.template 02-secret.yaml
kubectl apply -f 02-secret.yaml
rm 02-secret.yaml  # Clean up (never commit!)
```

#### Option B: Generate Strong Credentials (Recommended)

```bash
# Generate a strong password
POSTGRES_PASSWORD=$(openssl rand -base64 32)
echo "Generated password: $POSTGRES_PASSWORD"

# Encode password
POSTGRES_PASSWORD_B64=$(echo -n "$POSTGRES_PASSWORD" | base64)

# Build and encode DATABASE_URL
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/r_cycle"
DATABASE_URL_B64=$(echo -n "$DATABASE_URL" | base64)

# Create secret directly
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: r-cycle-secrets
  namespace: r-cycle
  labels:
    app: r-cycle
type: Opaque
data:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD_B64}
  DATABASE_URL: ${DATABASE_URL_B64}
EOF
```

**Verify Secret (without exposing values):**
```bash
kubectl get secret -n r-cycle r-cycle-secrets -o yaml
```

### 4. Deploy PostgreSQL

```bash
# Create PersistentVolumeClaim
kubectl apply -f 10-postgres-pvc.yaml

# Deploy PostgreSQL
kubectl apply -f 11-postgres-deployment.yaml

# Create PostgreSQL Service
kubectl apply -f 12-postgres-service.yaml
```

**Wait for PostgreSQL to be ready:**
```bash
kubectl wait --for=condition=ready pod -l app=postgres -n r-cycle --timeout=180s
```

**Verify PostgreSQL:**
```bash
kubectl get pods -n r-cycle -l app=postgres
kubectl logs -n r-cycle -l app=postgres
```

### 5. Initialize Database Schema

```bash
kubectl apply -f 20-db-init-job.yaml
```

**Monitor initialization:**
```bash
# Watch job status
kubectl get jobs -n r-cycle -w

# View logs
kubectl logs -n r-cycle -l component=db-init -f
```

**Expected output:**
```
Creating database schema...
✓ Schema created successfully
Seeding sample data...
✓ Sample data inserted successfully

Database setup complete!
Sample users created:
  - john.doe@company.com (IT Infrastructure)
  - jane.smith@company.com (Data Center Operations)
  - bob.johnson@company.com (Development Team)
  - alice.williams@company.com (Security Team)

Sample hardware listings: 6 items
```

**Verify job completion:**
```bash
kubectl get job -n r-cycle db-init
# Should show COMPLETIONS: 1/1
```

### 6. Deploy R-Cycle Application

```bash
# Deploy application
kubectl apply -f 30-r-cycle-deployment.yaml

# Create service
kubectl apply -f 31-r-cycle-service.yaml

# (Optional) Create ingress if you have an ingress controller
kubectl apply -f 32-r-cycle-ingress.yaml
```

**Wait for deployment:**
```bash
kubectl wait --for=condition=available deployment/r-cycle -n r-cycle --timeout=300s
```

**Verify deployment:**
```bash
kubectl get pods -n r-cycle -l app=r-cycle
kubectl get svc -n r-cycle
```

### 7. Access the Application

#### Option A: Port Forward (Quick Test)

```bash
kubectl port-forward -n r-cycle svc/r-cycle 8080:80
```

Then open: http://localhost:8080

#### Option B: Ingress (External Access)

If you deployed the ingress:
1. Add to `/etc/hosts`: `<ingress-ip> r-cycle.local`
2. Open: http://r-cycle.local

#### Option C: NodePort (No Ingress Controller)

Edit `31-r-cycle-service.yaml`:
```yaml
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 3000
    nodePort: 30080  # Choose port 30000-32767
```

Apply and access: `http://<node-ip>:30080`

## Verification Steps

### 1. Check All Resources

```bash
kubectl get all -n r-cycle
```

Expected output:
```
NAME                            READY   STATUS      RESTARTS   AGE
pod/db-init-xxxxx               0/1     Completed   0          5m
pod/postgres-xxxxx-xxxxx        1/1     Running     0          10m
pod/r-cycle-xxxxx-xxxxx         1/1     Running     0          3m
pod/r-cycle-xxxxx-xxxxx         1/1     Running     0          3m

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/postgres     ClusterIP   10.96.xxx.xxx   <none>        5432/TCP   10m
service/r-cycle      ClusterIP   10.96.xxx.xxx   <none>        80/TCP     3m

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/postgres   1/1     1            1           10m
deployment.apps/r-cycle    2/2     2            2           3m
```

### 2. Check Logs

```bash
# PostgreSQL logs
kubectl logs -n r-cycle -l app=postgres --tail=50

# R-Cycle logs
kubectl logs -n r-cycle -l app=r-cycle --tail=50

# Database init logs
kubectl logs -n r-cycle -l component=db-init
```

### 3. Test Database Connection

```bash
# Connect to PostgreSQL pod
kubectl exec -it -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U postgres -d r_cycle

# Run test queries
\dt                          # List tables
SELECT COUNT(*) FROM users;  # Should return 4
SELECT COUNT(*) FROM listings;  # Should return 6
\q                           # Exit
```

### 4. Test Application

```bash
# Port forward
kubectl port-forward -n r-cycle svc/r-cycle 8080:80

# In another terminal, test endpoints
curl http://localhost:8080/
curl http://localhost:8080/api/listings
```

## Troubleshooting

### Database Init Job Fails

```bash
# Check job status
kubectl describe job -n r-cycle db-init

# View detailed logs
kubectl logs -n r-cycle -l component=db-init

# Common issues:
# 1. PostgreSQL not ready - wait longer
# 2. Connection refused - check service name (should be "postgres")
# 3. Authentication failed - verify secret
```

### R-Cycle Pods Not Starting

```bash
# Check pod status
kubectl describe pod -n r-cycle -l app=r-cycle

# Check events
kubectl get events -n r-cycle --sort-by='.lastTimestamp'

# Common issues:
# 1. Image pull error - verify image is available
# 2. Database connection error - check DATABASE_URL secret
# 3. Crash loop - check application logs
```

### PostgreSQL Connection Issues

```bash
# Verify service exists
kubectl get svc -n r-cycle postgres

# Test connectivity from another pod
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -n r-cycle -- \
  psql -h postgres -U postgres -d r_cycle
```

### Image Pull Errors (Air-Gap)

If you see `ImagePullBackOff`:
```bash
# Check if image exists locally
docker images | grep r-cycle

# If using internal registry, verify:
kubectl get pods -n r-cycle -o yaml | grep image:
# Should match your internal registry URL
```

## Scaling

### Manual Scaling

```bash
# Scale r-cycle deployment
kubectl scale deployment r-cycle -n r-cycle --replicas=5

# Verify
kubectl get pods -n r-cycle -l app=r-cycle
```

### Auto-Scaling (Optional)

Create `40-hpa.yaml`:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: r-cycle-hpa
  namespace: r-cycle
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: r-cycle
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

Apply:
```bash
kubectl apply -f 40-hpa.yaml
```

## Updating the Application

### Rolling Update

```bash
# Update deployment with new image
kubectl set image deployment/r-cycle -n r-cycle \
  r-cycle=kofadam/r-cycle:0.2.0

# Watch rollout
kubectl rollout status deployment/r-cycle -n r-cycle

# Verify new version
kubectl get pods -n r-cycle -l app=r-cycle -o jsonpath='{.items[*].spec.containers[*].image}'
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/r-cycle -n r-cycle

# Rollback to previous version
kubectl rollout undo deployment/r-cycle -n r-cycle

# Rollback to specific revision
kubectl rollout undo deployment/r-cycle -n r-cycle --to-revision=2
```

## Backup and Restore

### Backup Database

```bash
# Create backup
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- \
  pg_dump -U postgres r_cycle > r-cycle-backup-$(date +%Y%m%d).sql

# Or backup to pod and copy out
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- \
  pg_dump -U postgres r_cycle > /tmp/backup.sql

kubectl cp r-cycle/$(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}'):/tmp/backup.sql ./backup.sql
```

### Restore Database

```bash
# Copy backup to pod
kubectl cp ./backup.sql r-cycle/$(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}'):/tmp/restore.sql

# Restore
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- \
  psql -U postgres r_cycle < /tmp/restore.sql
```

## Cleanup

### Delete Everything

```bash
# Delete all r-cycle resources
kubectl delete namespace r-cycle

# This will delete:
# - All pods
# - All services
# - All deployments
# - All configmaps and secrets
# - The namespace itself

# Note: PersistentVolumes may need manual cleanup depending on your storage class
```

### Delete Specific Resources

```bash
# Delete only the application (keep database)
kubectl delete deployment r-cycle -n r-cycle
kubectl delete service r-cycle -n r-cycle

# Delete only the database (keep application)
kubectl delete deployment postgres -n r-cycle
kubectl delete service postgres -n r-cycle
kubectl delete pvc postgres-pvc -n r-cycle
```

## Production Considerations

### 1. Database
- ⚠️ **Do NOT use single-pod PostgreSQL in production**
- Use managed PostgreSQL (AWS RDS, GCP Cloud SQL, Azure Database)
- Or deploy PostgreSQL StatefulSet with replication
- Set up regular backups (pg_dump, WAL archiving)

### 2. Secrets Management
- Use external secrets manager (Vault, AWS Secrets Manager)
- Rotate credentials regularly
- Never commit secrets to git

### 3. Monitoring
- Set up Prometheus + Grafana
- Monitor pod health, database connections
- Set up alerts for failures

### 4. Logging
- Centralize logs (ELK, Loki, CloudWatch)
- Retain logs for audit trail

### 5. High Availability
- Run multiple replicas (already configured: 2)
- Use anti-affinity rules to spread across nodes
- Set up pod disruption budgets

### 6. Security
- Enable NetworkPolicies
- Use Pod Security Standards
- Run as non-root (already configured)
- Scan images for vulnerabilities

## File Reference

```
k8s/
├── 00-namespace.yaml              # Namespace
├── 01-configmap.yaml              # Non-sensitive config
├── 02-secret.yaml.template        # Secret template (copy and customize)
├── 10-postgres-pvc.yaml           # PostgreSQL persistent storage
├── 11-postgres-deployment.yaml    # PostgreSQL deployment
├── 12-postgres-service.yaml       # PostgreSQL service
├── 20-db-init-job.yaml            # Database initialization job
├── 30-r-cycle-deployment.yaml     # R-Cycle deployment
├── 31-r-cycle-service.yaml        # R-Cycle service
├── 32-r-cycle-ingress.yaml        # Ingress (optional)
└── README.md                      # This file
```

## Support

For issues or questions:
1. Check logs: `kubectl logs -n r-cycle <pod-name>`
2. Check events: `kubectl get events -n r-cycle`
3. Review application logs in the pod
4. Check database connectivity

## Quick Reference Commands

```bash
# View all resources
kubectl get all -n r-cycle

# View logs
kubectl logs -n r-cycle -l app=r-cycle --tail=100 -f

# Access PostgreSQL
kubectl exec -it -n r-cycle <postgres-pod> -- psql -U postgres -d r_cycle

# Port forward to app
kubectl port-forward -n r-cycle svc/r-cycle 8080:80

# Restart deployment
kubectl rollout restart deployment/r-cycle -n r-cycle

# Scale up
kubectl scale deployment r-cycle -n r-cycle --replicas=5

# Check resource usage
kubectl top pods -n r-cycle
```
