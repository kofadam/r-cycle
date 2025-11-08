# Rebuild Instructions

The Dockerfile has been updated to include the `scripts/` directory needed for database initialization.

## Rebuild the Image

You need to rebuild the Docker image to include the database setup script.

### Option 1: Quick Rebuild (Same Version)

```bash
# From project root
docker build --build-arg APP_VERSION=0.1.0 \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
  -t kofadam/r-cycle:0.1.0 .
```

### Option 2: New Version

```bash
# Bump version to 0.1.1
docker build --build-arg APP_VERSION=0.1.1 \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
  -t kofadam/r-cycle:0.1.1 .

# Update k8s manifests to use 0.1.1
# - 20-db-init-job.yaml
# - 30-r-cycle-deployment.yaml
```

## Verify Scripts Directory

After rebuild, verify the scripts are included:

```bash
docker run --rm kofadam/r-cycle:0.1.0 ls -la /app/scripts/
```

Expected output:
```
total 12
drwxr-xr-x    2 root     root          4096 Nov  8 19:40 .
drwxr-xr-x    1 root     root          4096 Nov  8 19:40 ..
-rw-r--r--    1 root     root          7123 Nov  8 11:16 setup-db.js
```

## For Air-Gap Deployment

After rebuilding, re-export the image:

```bash
# Export updated image
docker save kofadam/r-cycle:0.1.0 -o r-cycle-0.1.0.tar

# Transfer to restricted network and load
docker load -i r-cycle-0.1.0.tar
```

## What Changed

The Dockerfile now includes this line in the runner stage:
```dockerfile
COPY --from=builder /app/scripts ./scripts
```

This ensures the `scripts/setup-db.js` file is available in the final image at `/app/scripts/setup-db.js`, which is required by the `db-init` Kubernetes Job.
