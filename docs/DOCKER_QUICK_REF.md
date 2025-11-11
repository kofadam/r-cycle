# R-Cycle Docker Quick Reference

## 🚀 Quick Start

```bash
# 1. Add these files to your project:
#    - Dockerfile
#    - .dockerignore
#    - docker-compose.yml (optional)
#    - Update next.config.js to include: output: 'standalone'

# 2. Build
docker build -t r-cycle:latest .

# 3. Run (with Neon DB)
docker run -d -p 3000:3000 \
  -e DATABASE_URL="your_neon_connection_string" \
  --name r-cycle \
  r-cycle:latest

# 4. Test
curl http://localhost:3000
```

## 📦 Essential Commands

```bash
# Build
docker build -t r-cycle:latest .

# Run
docker run -d -p 3000:3000 --name r-cycle r-cycle:latest

# Logs
docker logs -f r-cycle

# Stop
docker stop r-cycle

# Remove
docker rm r-cycle

# Restart
docker restart r-cycle
```

## 🎯 For Your Air-Gapped Environment

```bash
# 1. Build on internet-connected machine
docker build -t r-cycle:latest .

# 2. Export to tar file
docker save r-cycle:latest -o r-cycle.tar

# 3. Transfer file to air-gapped environment

# 4. Load in air-gapped environment
docker load -i r-cycle.tar

# 5. Tag for internal registry
docker tag r-cycle:latest internal-registry.local/r-cycle:latest

# 6. Push to internal registry
docker push internal-registry.local/r-cycle:latest
```

## ☸️ Deploy to Kubernetes

```bash
# 1. Create secret for database
kubectl create secret generic r-cycle-secrets \
  --from-literal=database-url="postgresql://..."

# 2. Create deployment (see DOCKER_GUIDE.md for YAML)
kubectl apply -f k8s-deployment.yaml

# 3. Check status
kubectl get pods -l app=r-cycle
kubectl logs -f deployment/r-cycle
```

## 🔧 Troubleshooting

```bash
# View logs
docker logs r-cycle

# Shell into container
docker exec -it r-cycle sh

# Test database connection
docker exec -it r-cycle node -e "const {Pool}=require('pg');new Pool({connectionString:process.env.DATABASE_URL}).query('SELECT 1')"

# Rebuild without cache
docker build --no-cache -t r-cycle:latest .
```

## 📝 Files Needed

Add these to your project root:

1. **Dockerfile** - Container definition
2. **.dockerignore** - Exclude unnecessary files
3. **next.config.js** - Must include `output: 'standalone'`
4. **docker-compose.yml** - Optional, for local testing

All files are in your outputs folder!
