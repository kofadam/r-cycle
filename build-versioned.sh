#!/bin/bash
# build-versioned.sh - Build Docker image with version info

set -e

# Get version from package.json or use argument
VERSION=${1:-$(node -p "require('./package.json').version")}

# Get build date
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get git commit (short hash)
if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_COMMIT=$(git rev-parse --short HEAD)
else
    GIT_COMMIT="unknown"
fi

echo "🚀 Building R-Cycle Docker Image"
echo "================================="
echo "Version:    ${VERSION}"
echo "Build Date: ${BUILD_DATE}"
echo "Git Commit: ${GIT_COMMIT}"
echo "================================="

# Build the Docker image
docker build \
    --build-arg APP_VERSION="${VERSION}" \
    --build-arg BUILD_DATE="${BUILD_DATE}" \
    --build-arg GIT_COMMIT="${GIT_COMMIT}" \
    -t r-cycle:${VERSION} \
    -t r-cycle:latest \
    -f Dockerfile \
    .

echo ""
echo "✅ Build complete!"
echo "Images tagged:"
echo "  - r-cycle:${VERSION}"
echo "  - r-cycle:latest"
echo ""
echo "Run with: docker run -p 3000:3000 r-cycle:${VERSION}"
