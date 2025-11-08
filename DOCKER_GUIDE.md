# R-Cycle Docker Container Guide

## Quick Start

### Option 1: Docker with Neon Database (Recommended for Testing)

```bash
# 1. Update next.config.js with standalone output
cp next.config.js.docker next.config.js

# 2. Build the Docker image
docker build -t r-cycle:latest .

# 3. Run the container with your Neon database
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://neondb_owner:npg_sVNbKfyo9hC0@ep-jolly-base-ado1t81a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  --name r-cycle \
  r-cycle:latest

# 4. Access the application
# Open http://localhost:3000
```

### Option 2: Docker Compose with Local PostgreSQL

```bash
# 1. Update next.config.js
cp next.config.js.docker next.config.js

# 2. Start everything (app + local database)
docker-compose up -d

# 3. Access the application
# Open http://localhost:3000

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Building for Different Environments

### Development Build
```bash
docker build -t r-cycle:dev .
```

### Production Build with Tag
```bash
docker build -t r-cycle:1.0.0 -t r-cycle:latest .
```

### Build for Specific Platform (for Kubernetes/ARM)
```bash
# For ARM64 (Apple Silicon, some cloud platforms)
docker build --platform linux/arm64 -t r-cycle:latest-arm64 .

# For AMD64 (Most servers)
docker build --platform linux/amd64 -t r-cycle:latest-amd64 .

# Multi-platform (requires buildx)
docker buildx build --platform linux/amd64,linux/arm64 -t r-cycle:latest .
```

## Managing the Container

### Run with Environment File
```bash
# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://neondb_owner:npg_sVNbKfyo9hC0@ep-jolly-base-ado1t81a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
EOF

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name r-cycle \
  r-cycle:latest
```

### Container Management Commands
```bash
# View logs
docker logs r-cycle
docker logs -f r-cycle  # Follow logs

# Stop container
docker stop r-cycle

# Start container
docker start r-cycle

# Restart container
docker restart r-cycle

# Remove container
docker rm -f r-cycle

# Execute command in running container
docker exec -it r-cycle sh
```

## Pushing to Container Registry

### Docker Hub
```bash
# Login
docker login

# Tag image
docker tag r-cycle:latest yourusername/r-cycle:latest
docker tag r-cycle:latest yourusername/r-cycle:1.0.0

# Push
docker push yourusername/r-cycle:latest
docker push yourusername/r-cycle:1.0.0
```

### Private Registry (for your organization)
```bash
# Login to your private registry
docker login registry.your-company.com

# Tag image
docker tag r-cycle:latest registry.your-company.com/r-cycle:latest

# Push
docker push registry.your-company.com/r-cycle:latest
```

### GitHub Container Registry
```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag r-cycle:latest ghcr.io/yourusername/r-cycle:latest

# Push
docker push ghcr.io/yourusername/r-cycle:latest
```

## Kubernetes Deployment

Once you have the container image in a registry, you can deploy to Kubernetes:

### Create Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: r-cycle
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: r-cycle
  template:
    metadata:
      labels:
        app: r-cycle
    spec:
      containers:
      - name: r-cycle
        image: registry.your-company.com/r-cycle:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: r-cycle-secrets
              key: database-url
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
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: r-cycle
spec:
  selector:
    app: r-cycle
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: v1
kind: Secret
metadata:
  name: r-cycle-secrets
type: Opaque
stringData:
  database-url: "postgresql://user:password@postgres-service:5432/rcycle"
```

### Deploy to Kubernetes
```bash
# Create secret for database
kubectl create secret generic r-cycle-secrets \
  --from-literal=database-url="postgresql://..."

# Apply deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/r-cycle

# Port forward for testing
kubectl port-forward service/r-cycle 3000:80
```

## Health Checks

The container exposes port 3000 and responds to HTTP requests on `/`

### Docker Health Check (add to Dockerfile if needed)
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs r-cycle

# Common issues:
# - DATABASE_URL not set
# - Database not accessible
# - Port 3000 already in use
```

### Can't connect to database
```bash
# Test database connection from container
docker exec -it r-cycle sh
# Inside container:
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', (err, res) => {console.log(err || res.rows); pool.end();})"
```

### Build fails
```bash
# Clear Docker cache and rebuild
docker build --no-cache -t r-cycle:latest .

# Check if all files are present
docker run --rm -it r-cycle:latest sh
ls -la
```

### Performance optimization
```bash
# Use .dockerignore to exclude large files
# Ensure node_modules and .next are excluded

# Multi-stage builds reduce final image size
# Current Dockerfile uses this approach
```

## Image Size Optimization

Current Dockerfile uses:
- ✅ Multi-stage builds
- ✅ Alpine Linux base (minimal size)
- ✅ Standalone Next.js output
- ✅ Only production dependencies

Expected image size: ~200-300MB

## Security Considerations

For production deployment:
1. **Don't expose database credentials in plain text**
   - Use Kubernetes secrets
   - Use environment variable injection
   - Use secret management tools (Vault, etc.)

2. **Run as non-root user** (already configured in Dockerfile)

3. **Scan images for vulnerabilities**
   ```bash
   docker scan r-cycle:latest
   ```

4. **Use specific versions**
   ```dockerfile
   FROM node:18.19.0-alpine AS base
   ```

5. **Keep base images updated**
   ```bash
   docker pull node:18-alpine
   docker build --no-cache -t r-cycle:latest .
   ```

## Air-Gapped Environment

For deployment in your air-gapped environment:

1. **Export image to tar file**
   ```bash
   docker save r-cycle:latest -o r-cycle-latest.tar
   ```

2. **Transfer to air-gapped environment**
   - Copy tar file via approved methods
   - USB drive, secure transfer, etc.

3. **Load image in air-gapped environment**
   ```bash
   docker load -i r-cycle-latest.tar
   ```

4. **Push to internal registry**
   ```bash
   docker tag r-cycle:latest internal-registry.company.local/r-cycle:latest
   docker push internal-registry.company.local/r-cycle:latest
   ```

## Next Steps

1. Test container locally with `docker-compose up`
2. Push to your organization's container registry
3. Deploy to development Kubernetes cluster
4. Test with real Keycloak OIDC integration
5. Deploy to production after approval
