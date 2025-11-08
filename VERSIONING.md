# R-Cycle Versioning Guide

## Current Version: 0.1.0

This document explains how versioning works in R-Cycle across different deployment scenarios.

## Version Sources

### 1. package.json (NPM Version)
```json
{
  "version": "0.1.0"
}
```
- Used by npm/node ecosystem
- Single source of truth for the project version

### 2. lib/version.ts (Application Display)
```typescript
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
```
- Used by the application UI (displayed in sidebar)
- Can be overridden at build time via environment variable
- Fallback: `0.1.0`

### 3. Docker Build Args
```bash
docker build --build-arg APP_VERSION=0.1.0 ...
```
- Sets `NEXT_PUBLIC_APP_VERSION` environment variable at build time
- Overrides the default in `lib/version.ts`

### 4. Kubernetes ConfigMap
```yaml
data:
  APP_VERSION: "0.1.0"
```
- Can override the version at runtime (optional)
- Currently set to `0.1.0`

## How Versioning Works

### Priority Order (Highest to Lowest)

1. **Runtime Environment Variable** (`NEXT_PUBLIC_APP_VERSION` set at runtime)
2. **Build-time Environment Variable** (from Docker `--build-arg APP_VERSION`)
3. **Default Fallback** (hardcoded in `lib/version.ts`: `0.1.0`)

### Deployment Scenarios

#### Vercel Deployment
```
No NEXT_PUBLIC_APP_VERSION set
    ↓
Falls back to lib/version.ts default
    ↓
Shows: 0.1.0
```

#### Docker Deployment
```
docker build --build-arg APP_VERSION=0.1.0
    ↓
Sets NEXT_PUBLIC_APP_VERSION=0.1.0 at build time
    ↓
Shows: 0.1.0
```

#### Kubernetes Deployment
```
ConfigMap: APP_VERSION=0.1.0 (optional)
    ↓
Can override at runtime
    ↓
Shows: 0.1.0 (or ConfigMap value if mapped)
```

## Updating the Version

### Step 1: Update package.json

```bash
# Manual edit
vim package.json
# Change "version": "0.1.0" to "0.2.0"

# Or use npm
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

### Step 2: Update lib/version.ts (Optional)

If you want to change the default fallback:

```typescript
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0';
```

### Step 3: Update Docker Build

```bash
# Build with new version
docker build --build-arg APP_VERSION=0.2.0 \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t kofadam/r-cycle:0.2.0 .

# Tag as latest
docker tag kofadam/r-cycle:0.2.0 kofadam/r-cycle:latest
```

### Step 4: Update Kubernetes Manifests

Update image tags in:
- `k8s/20-db-init-job.yaml`: `image: kofadam/r-cycle:0.2.0`
- `k8s/30-r-cycle-deployment.yaml`: `image: kofadam/r-cycle:0.2.0`

Update ConfigMap (optional):
- `k8s/01-configmap.yaml`: `APP_VERSION: "0.2.0"`

### Step 5: Update Vercel (Optional)

Set environment variable in Vercel dashboard:
- Variable: `NEXT_PUBLIC_APP_VERSION`
- Value: `0.2.0`
- Redeploy

## Verification

### Check Version in Running Container

```bash
# Docker
docker run --rm kofadam/r-cycle:0.1.0 node -e "console.log(process.env.NEXT_PUBLIC_APP_VERSION || 'not set')"

# Kubernetes
kubectl exec -n r-cycle $(kubectl get pod -n r-cycle -l app=r-cycle -o jsonpath='{.items[0].metadata.name}') -- \
  node -e "console.log(process.env.NEXT_PUBLIC_APP_VERSION || 'not set')"
```

### Check Version in UI

Open the application and check the sidebar - version should be displayed at the bottom.

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes, major feature overhauls
- **MINOR** (0.2.0): New features, backward-compatible
- **PATCH** (0.1.1): Bug fixes, backward-compatible

### Examples

- `0.1.0` → `0.1.1`: Bug fix
- `0.1.0` → `0.2.0`: New feature (hardware search)
- `0.1.0` → `1.0.0`: Production release, Keycloak integration

## Build Date and Git Commit

In addition to version, the build system tracks:

### Build Date
```bash
--build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### Git Commit
```bash
--build-arg GIT_COMMIT=$(git rev-parse --short HEAD)
```

These are displayed in the UI alongside the version number.

## Version Alignment Checklist

When bumping versions, ensure consistency across:

- [ ] `package.json` - NPM version
- [ ] `lib/version.ts` - Default fallback
- [ ] Docker build command - `APP_VERSION` build arg
- [ ] Docker image tag - `kofadam/r-cycle:X.Y.Z`
- [ ] Kubernetes manifests - Image references
- [ ] Kubernetes ConfigMap - `APP_VERSION` (optional)
- [ ] Git tag - `git tag -a v0.2.0 -m "Release 0.2.0"`
- [ ] CHANGELOG.md - Document changes

## Current Status

**Version**: 0.1.0
**Status**: POC (Proof of Concept)
**Docker Image**: `kofadam/r-cycle:0.1.0`
**Vercel**: https://r-cycle.vercel.app (shows 0.1.0)
**Target Production Version**: 1.0.0 (when Keycloak + real hardware API integrated)

## Troubleshooting

### Different Versions in Different Environments

**Problem**: Vercel shows 1.0.0, Docker shows 0.1.0

**Cause**: Vercel not setting `NEXT_PUBLIC_APP_VERSION`, falling back to old default

**Fix**:
1. Update `lib/version.ts` default to match `package.json`
2. Or set `NEXT_PUBLIC_APP_VERSION` in Vercel environment variables

### Version Not Updating After Rebuild

**Problem**: Built new image but version still shows old

**Cause**: Browser cache or using old image tag

**Fix**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Verify image build args: `docker inspect kofadam/r-cycle:0.1.0 | grep VERSION`
3. Ensure using correct image tag in deployment

### Version Shows "unknown"

**Problem**: Version displays as "unknown"

**Cause**: Environment variable not set, and default also missing

**Fix**: Check `lib/version.ts` has a valid default value
