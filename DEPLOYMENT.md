# Deployment Guide

## Air-Gapped Environment Deployment

This guide covers deploying HardwareHub to your air-gapped Kubernetes cluster.

## Pre-Deployment Checklist

### 1. Infrastructure Requirements

- [ ] Kubernetes cluster access
- [ ] PostgreSQL database provisioned
- [ ] Keycloak OIDC realm configured
- [ ] Internal container registry access
- [ ] Network policies configured for database access

### 2. Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE hardware_marketplace;
   CREATE USER hardware_app WITH ENCRYPTED PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE hardware_marketplace TO hardware_app;
   ```

2. **Run Schema Setup**
   ```bash
   # From a machine with database access
   DATABASE_URL="postgresql://hardware_app:password@your-db-host:5432/hardware_marketplace" \
     node scripts/setup-db.js
   ```

### 3. Keycloak Configuration

1. **Create Realm** (if not exists): `hardware-marketplace`

2. **Create Client**:
   - Client ID: `hardware-marketplace`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `https://hardware.company.com/*`
   - Web Origins: `https://hardware.company.com`

3. **Client Scopes**: Enable `profile`, `email`, `openid`

4. **Save Client Secret** for configuration

### 4. Environment Configuration

Create Kubernetes secret with all environment variables:

```bash
kubectl create secret generic hardware-marketplace-secrets \
  --from-literal=database-url="postgresql://hardware_app:password@postgres-host:5432/hardware_marketplace" \
  --from-literal=keycloak-issuer="https://keycloak.company.com/realms/hardware-marketplace" \
  --from-literal=keycloak-client-id="hardware-marketplace" \
  --from-literal=keycloak-client-secret="your-client-secret" \
  --from-literal=nextauth-url="https://hardware.company.com" \
  --from-literal=nextauth-secret="$(openssl rand -base64 32)"
```

## Container Image Preparation

### 1. Build Image

```bash
# From project root
docker build -t hardware-marketplace:v1.0.0 .
```

### 2. Transfer to Air-Gap Registry

**Option A: Direct Push** (if registry accessible from build machine)
```bash
docker tag hardware-marketplace:v1.0.0 registry.company.com/apps/hardware-marketplace:v1.0.0
docker push registry.company.com/apps/hardware-marketplace:v1.0.0
```

**Option B: Save and Transfer** (for completely air-gapped)
```bash
# Save image as tar
docker save hardware-marketplace:v1.0.0 -o hardware-marketplace-v1.0.0.tar

# Transfer tar file to air-gapped environment (USB, secure transfer, etc.)

# Load in air-gap environment
docker load -i hardware-marketplace-v1.0.0.tar

# Tag and push to internal registry
docker tag hardware-marketplace:v1.0.0 registry.company.com/apps/hardware-marketplace:v1.0.0
docker push registry.company.com/apps/hardware-marketplace:v1.0.0
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace hardware-marketplace
```

### 2. Apply Deployment Configuration

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hardware-marketplace
  namespace: hardware-marketplace
  labels:
    app: hardware-marketplace
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hardware-marketplace
  template:
    metadata:
      labels:
        app: hardware-marketplace
    spec:
      containers:
      - name: hardware-marketplace
        image: registry.company.com/apps/hardware-marketplace:v1.0.0
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: database-url
        - name: KEYCLOAK_ISSUER
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: keycloak-issuer
        - name: KEYCLOAK_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: keycloak-client-id
        - name: KEYCLOAK_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: keycloak-client-secret
        - name: NEXTAUTH_URL
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: nextauth-url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: nextauth-secret
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-credentials
```

**service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: hardware-marketplace
  namespace: hardware-marketplace
spec:
  selector:
    app: hardware-marketplace
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  type: ClusterIP
```

**ingress.yaml** (adjust for your ingress controller):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hardware-marketplace
  namespace: hardware-marketplace
  annotations:
    # Add your ingress controller specific annotations
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - hardware.company.com
    secretName: hardware-marketplace-tls
  rules:
  - host: hardware.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hardware-marketplace
            port:
              number: 80
```

### 3. Deploy

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n hardware-marketplace

# Check logs
kubectl logs -n hardware-marketplace -l app=hardware-marketplace

# Check service
kubectl get svc -n hardware-marketplace

# Check ingress
kubectl get ingress -n hardware-marketplace
```

## Post-Deployment

### 1. Verify Application

1. Access application: `https://hardware.company.com`
2. Test Keycloak login flow
3. Verify database connectivity
4. Test hardware listing creation
5. Test claim workflow

### 2. Monitoring Setup

**Recommended metrics to monitor**:
- Pod health and restart count
- Database connection pool utilization
- API response times
- Authentication success/failure rates

### 3. Backup Strategy

**Database Backups**:
```bash
# Daily automated backup
pg_dump -h postgres-host -U hardware_app hardware_marketplace > backup-$(date +%Y%m%d).sql
```

## Scaling

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hardware-marketplace-hpa
  namespace: hardware-marketplace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hardware-marketplace
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

## Troubleshooting

### Pod Crashes

```bash
# View pod events
kubectl describe pod -n hardware-marketplace <pod-name>

# View container logs
kubectl logs -n hardware-marketplace <pod-name>

# View previous container logs (if restarted)
kubectl logs -n hardware-marketplace <pod-name> --previous
```

### Database Connection Issues

```bash
# Test database connectivity from pod
kubectl exec -it -n hardware-marketplace <pod-name> -- sh
# Inside pod:
psql $DATABASE_URL
```

### Keycloak Integration Issues

1. Verify redirect URIs in Keycloak match your deployment URL
2. Check client secret is correctly set
3. Verify issuer URL is accessible from pods
4. Check CORS configuration if experiencing browser errors

### Image Pull Issues

```bash
# Verify image exists in registry
docker pull registry.company.com/apps/hardware-marketplace:v1.0.0

# Check imagePullSecrets
kubectl get secret registry-credentials -n hardware-marketplace
```

## Rollback Procedure

```bash
# View deployment history
kubectl rollout history deployment/hardware-marketplace -n hardware-marketplace

# Rollback to previous version
kubectl rollout undo deployment/hardware-marketplace -n hardware-marketplace

# Rollback to specific revision
kubectl rollout undo deployment/hardware-marketplace -n hardware-marketplace --to-revision=2
```

## Updates and Maintenance

### Updating the Application

1. Build new version: `docker build -t hardware-marketplace:v1.1.0 .`
2. Push to registry
3. Update deployment:
   ```bash
   kubectl set image deployment/hardware-marketplace \
     hardware-marketplace=registry.company.com/apps/hardware-marketplace:v1.1.0 \
     -n hardware-marketplace
   ```
4. Monitor rollout: `kubectl rollout status deployment/hardware-marketplace -n hardware-marketplace`

### Database Migrations

```bash
# Connect to database
psql $DATABASE_URL

# Run migration SQL
\i migration-001.sql

# Verify
\dt
```

## Security Hardening

1. **Network Policies**: Restrict pod-to-pod communication
2. **Pod Security Standards**: Run as non-root user (already configured in Dockerfile)
3. **Secrets Management**: Consider external secrets management (Vault, etc.)
4. **TLS**: Ensure all traffic uses HTTPS
5. **RBAC**: Limit service account permissions

## Support

For deployment issues:
1. Check pod logs
2. Verify all secrets are correctly configured
3. Test database and Keycloak connectivity
4. Contact infrastructure team for cluster-level issues
5. Contact security team for Keycloak configuration issues
