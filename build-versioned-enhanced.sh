#!/bin/bash
# build-versioned.sh - Build Docker image with version info and optional air-gap export

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

# Ask if user wants to export for air-gap
read -p "📦 Export for air-gap deployment? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    OUTPUT_FILE="r-cycle-v${VERSION}.tar"
    echo "📤 Exporting image to ${OUTPUT_FILE}..."
    docker save r-cycle:${VERSION} -o "${OUTPUT_FILE}"
    
    # Get file size
    FILE_SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
    
    echo ""
    echo "✅ Export complete!"
    echo "File: ${OUTPUT_FILE} (${FILE_SIZE})"
    echo ""
    echo "📋 Air-gap deployment steps:"
    echo "  1. Transfer ${OUTPUT_FILE} to air-gapped system"
    echo "  2. Load: docker load -i ${OUTPUT_FILE}"
    echo "  3. Tag: docker tag r-cycle:${VERSION} internal-registry/r-cycle:${VERSION}"
    echo "  4. Push: docker push internal-registry/r-cycle:${VERSION}"
else
    echo "Skipping export."
fi

echo ""
echo "🎉 Done!"
echo "Run locally with: docker run -p 3000:3000 r-cycle:${VERSION}"
