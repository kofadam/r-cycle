# R-Cycle Kubernetes Architecture

## Overview

This document describes the Kubernetes architecture for R-Cycle deployment in restricted/air-gap environments.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Namespace: r-cycle                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Ingress (Optional)                  │ │
│  │                      r-cycle.local → :80                    │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │                    Service: r-cycle                         │ │
│  │                    ClusterIP :80 → :3000                    │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │              Deployment: r-cycle (2 replicas)               │ │
│  │  ┌──────────────────┐         ┌──────────────────┐         │ │
│  │  │  Pod: r-cycle-1  │         │  Pod: r-cycle-2  │         │ │
│  │  │                  │         │                  │         │ │
│  │  │  Container:      │         │  Container:      │         │ │
│  │  │  r-cycle:0.1.0   │         │  r-cycle:0.1.0   │         │ │
│  │  │  Port: 3000      │         │  Port: 3000      │         │ │
│  │  │                  │         │                  │         │ │
│  │  │  Resources:      │         │  Resources:      │         │ │
│  │  │  256Mi-512Mi     │         │  256Mi-512Mi     │         │ │
│  │  │  250m-500m CPU   │         │  250m-500m CPU   │         │ │
│  │  └──────────────────┘         └──────────────────┘         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                     │
│                             │ DATABASE_URL                        │
│                             ▼                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Service: postgres                          │ │
│  │                   ClusterIP :5432                            │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │             Deployment: postgres (1 replica)                 │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │           Pod: postgres                                │  │ │
│  │  │                                                         │  │ │
│  │  │  Container: postgres:15-alpine                         │  │ │
│  │  │  Port: 5432                                            │  │ │
│  │  │                                                         │  │ │
│  │  │  Volume: postgres-pvc (5Gi)                            │  │ │
│  │  │  Mount: /var/lib/postgresql/data                       │  │ │
│  │  │                                                         │  │ │
│  │  │  Resources:                                            │  │ │
│  │  │  256Mi-512Mi                                           │  │ │
│  │  │  250m-500m CPU                                         │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │             PersistentVolumeClaim: postgres-pvc              │ │
│  │                        5Gi RWO                               │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│                             ▼                                     │
│                  PersistentVolume (cluster storage)               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Job: db-init (run once)                    │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │  InitContainer: wait-for-postgres                      │  │ │
│  │  │  → Waits until pg_isready                              │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │  Container: db-init                                    │  │ │
│  │  │  Image: r-cycle:0.1.0                                  │  │ │
│  │  │  Command: node /app/scripts/setup-db.js               │  │ │
│  │  │  → Creates schema (users, listings, claims)            │  │ │
│  │  │  → Seeds sample data                                   │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  ConfigMap: r-cycle-config                   │ │
│  │  - NODE_ENV=production                                       │ │
│  │  - NEXT_TELEMETRY_DISABLED=1                                 │ │
│  │  - PORT=3000                                                 │ │
│  │  - HOSTNAME=0.0.0.0                                          │ │
│  │  - POSTGRES_DB=r_cycle                                       │ │
│  │  - POSTGRES_HOST=postgres                                    │ │
│  │  - POSTGRES_PORT=5432                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Secret: r-cycle-secrets                    │ │
│  │  - POSTGRES_PASSWORD (base64)                                │ │
│  │  - DATABASE_URL (base64)                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Namespace: `r-cycle`
- Isolates all R-Cycle resources
- Enables easy cleanup and resource quotas
- Single file: `00-namespace.yaml`

### 2. ConfigMap: `r-cycle-config`
- Non-sensitive environment variables
- Shared across all pods
- File: `01-configmap.yaml`

### 3. Secret: `r-cycle-secrets`
- Sensitive data (passwords, connection strings)
- Base64 encoded
- File: `02-secret.yaml` (created from template)

### 4. PostgreSQL Database

#### PersistentVolumeClaim: `postgres-pvc`
- 5Gi storage
- ReadWriteOnce access mode
- File: `10-postgres-pvc.yaml`

#### Deployment: `postgres`
- 1 replica (single instance for POC)
- Image: `postgres:15-alpine`
- Resources: 256Mi-512Mi RAM, 250m-500m CPU
- Health checks: liveness + readiness probes
- File: `11-postgres-deployment.yaml`

#### Service: `postgres`
- ClusterIP (internal only)
- Port 5432
- File: `12-postgres-service.yaml`

### 5. Database Initialization Job: `db-init`
- Runs once to set up schema
- InitContainer waits for PostgreSQL readiness
- Executes `/app/scripts/setup-db.js`
- Creates tables: users, listings, claims
- Seeds 4 sample users and 6 hardware listings
- Auto-cleanup after 1 hour
- File: `20-db-init-job.yaml`

### 6. R-Cycle Application

#### Deployment: `r-cycle`
- 2 replicas (for HA)
- Image: `kofadam/r-cycle:0.1.0`
- Resources: 256Mi-512Mi RAM, 250m-500m CPU
- Health checks: liveness + readiness probes (HTTP on :3000)
- InitContainer waits for database
- File: `30-r-cycle-deployment.yaml`

#### Service: `r-cycle`
- ClusterIP
- Port 80 → 3000 (internal)
- File: `31-r-cycle-service.yaml`

#### Ingress (Optional): `r-cycle`
- External access via ingress controller
- Host: `r-cycle.local` (configurable)
- TLS support (optional)
- File: `32-r-cycle-ingress.yaml`

## Data Flow

### Application Startup
```
1. Namespace created
2. ConfigMap + Secret created
3. PostgreSQL PVC provisioned
4. PostgreSQL pod starts
5. PostgreSQL readiness probe passes
6. db-init Job runs (creates schema + seeds data)
7. db-init Job completes
8. R-Cycle pods start
9. R-Cycle initContainers wait for PostgreSQL
10. R-Cycle containers start
11. R-Cycle readiness probes pass
12. Service routes traffic to ready pods
```

### Request Flow
```
User Request
    ↓
Ingress (optional)
    ↓
Service: r-cycle (:80)
    ↓
Pod: r-cycle-1 or r-cycle-2 (:3000)
    ↓
Next.js Application
    ↓
API Routes (/api/listings, /api/claims)
    ↓
PostgreSQL Client (pg library)
    ↓
Service: postgres (:5432)
    ↓
Pod: postgres
    ↓
PostgreSQL Database (r_cycle)
    ↓
Data stored in PersistentVolume
```

## Resource Requirements

### Minimum Cluster Requirements
- **Nodes:** 1 node (for POC)
- **CPU:** 1.5 cores total (750m + 750m)
- **Memory:** 1.5 GB total (768Mi + 768Mi)
- **Storage:** 5 GB persistent storage

### Recommended for Production
- **Nodes:** 3+ nodes (HA)
- **CPU:** 4+ cores
- **Memory:** 4+ GB
- **Storage:** 50+ GB (with backups)

### Per-Component Resources

| Component | Requests | Limits | Replicas | Total (Limits) |
|-----------|----------|--------|----------|----------------|
| r-cycle | 256Mi / 250m | 512Mi / 500m | 2 | 1024Mi / 1000m |
| postgres | 256Mi / 250m | 512Mi / 500m | 1 | 512Mi / 500m |
| db-init | 128Mi / 100m | 256Mi / 200m | 1 (job) | 256Mi / 200m |
| **Total** | | | | **1.75 GB / 1.7 CPU** |

## Network Policies (Optional Enhancement)

For enhanced security, you can add NetworkPolicies:

```yaml
# Allow r-cycle to talk to postgres only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-netpol
  namespace: r-cycle
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: r-cycle
    ports:
    - protocol: TCP
      port: 5432
```

## Scaling Strategy

### Horizontal Scaling (Application)
```bash
# Manual scaling
kubectl scale deployment r-cycle -n r-cycle --replicas=5

# Auto-scaling (HPA)
kubectl autoscale deployment r-cycle -n r-cycle \
  --min=2 --max=10 --cpu-percent=70
```

### Vertical Scaling (Resources)
Update resource requests/limits in deployment YAML and apply:
```bash
kubectl apply -f 30-r-cycle-deployment.yaml
kubectl rollout status deployment/r-cycle -n r-cycle
```

### Database Scaling
⚠️ Current setup uses single PostgreSQL instance (POC only)

For production:
- Use managed PostgreSQL (RDS, Cloud SQL)
- Deploy PostgreSQL StatefulSet with replication
- Consider read replicas for scaling reads

## High Availability Considerations

### Current Setup (POC)
- ✅ R-Cycle: 2 replicas (HA)
- ❌ PostgreSQL: 1 replica (single point of failure)
- ✅ Services: ClusterIP (automatic pod routing)

### Production Improvements
1. **Database HA:**
   - PostgreSQL StatefulSet with replication
   - Or use managed database service

2. **Pod Anti-Affinity:**
   - Spread r-cycle pods across nodes
   - Prevent all replicas on same node

3. **Pod Disruption Budgets:**
   - Ensure minimum pods during updates
   - Prevent all pods being evicted

4. **Multi-Zone Deployment:**
   - Deploy across availability zones
   - Use zone-aware storage

## Security Features

### Implemented
- ✅ Non-root containers (user 1001:nextjs)
- ✅ Secrets for sensitive data
- ✅ Resource limits (prevent resource exhaustion)
- ✅ Readiness/Liveness probes
- ✅ Namespace isolation

### Recommended Additions
- NetworkPolicies (restrict pod-to-pod traffic)
- Pod Security Standards (enforce security policies)
- RBAC (role-based access control)
- Image scanning (vulnerability detection)
- Secret encryption at rest
- mTLS between services (service mesh)

## Monitoring & Observability

### Recommended Stack
- **Metrics:** Prometheus + Grafana
- **Logs:** Loki, ELK, or cloud logging
- **Tracing:** Jaeger or OpenTelemetry
- **Alerts:** Alertmanager

### Key Metrics to Monitor
- Pod CPU/Memory usage
- Database connection pool
- Request latency (p50, p95, p99)
- Error rates
- Database query performance

## Backup Strategy

### Database Backups
```bash
# Manual backup
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- \
  pg_dump -U postgres r_cycle > backup-$(date +%Y%m%d).sql

# Automated (CronJob)
# See production setup for scheduled backups
```

### Persistent Volume Backups
- Use volume snapshots (CSI driver support)
- Or backup at application level (pg_dump)

## Disaster Recovery

### RTO/RPO Targets
- **RTO (Recovery Time Objective):** < 30 minutes
- **RPO (Recovery Point Objective):** < 1 hour

### Recovery Procedure
1. Restore PersistentVolume from snapshot
2. Deploy PostgreSQL
3. Restore database from backup if needed
4. Deploy R-Cycle application
5. Verify data integrity

## Air-Gap Considerations

### Image Management
- Pre-load all required images
- Use internal container registry
- Document all image dependencies

### Updates in Air-Gap
1. Export updated images on internet-connected machine
2. Transfer to air-gap environment
3. Load images
4. Update deployments with new image tags
5. Perform rolling update

### Dependencies
- No external CDN dependencies ✅
- No external API calls (except mock hardware API) ✅
- All assets bundled in container ✅

## File Reference

| File | Purpose | Required |
|------|---------|----------|
| `00-namespace.yaml` | Namespace | ✅ Yes |
| `01-configmap.yaml` | Configuration | ✅ Yes |
| `02-secret.yaml.template` | Secret template | ✅ Yes (customize) |
| `10-postgres-pvc.yaml` | Database storage | ✅ Yes |
| `11-postgres-deployment.yaml` | Database | ✅ Yes |
| `12-postgres-service.yaml` | Database service | ✅ Yes |
| `20-db-init-job.yaml` | Schema setup | ✅ Yes |
| `30-r-cycle-deployment.yaml` | Application | ✅ Yes |
| `31-r-cycle-service.yaml` | App service | ✅ Yes |
| `32-r-cycle-ingress.yaml` | External access | ❌ Optional |
| `deploy.sh` | Automated deployment | ❌ Helper |
| `create-secret.sh` | Secret generation | ❌ Helper |
| `README.md` | Full documentation | 📚 Docs |
| `QUICKSTART.md` | Quick reference | 📚 Docs |
| `ARCHITECTURE.md` | This file | 📚 Docs |

## Next Steps

1. **Review Configuration:** Check ConfigMap and Secret values
2. **Update Images:** If using internal registry, update image references
3. **Deploy:** Follow QUICKSTART.md or run `bash deploy.sh`
4. **Verify:** Test application functionality
5. **Monitor:** Set up monitoring and alerting
6. **Plan Production:** Review HA and security recommendations
