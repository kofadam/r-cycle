#!/bin/bash
set -e

# R-Cycle Kubernetes Deployment Script
# This script automates the deployment process

echo "=========================================="
echo "R-Cycle Kubernetes Deployment"
echo "=========================================="
echo ""

# Configuration
NAMESPACE="r-cycle"
DEPLOYMENT_TIMEOUT="300s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    error "kubectl not found. Please install kubectl first."
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
fi

info "Connected to Kubernetes cluster"
kubectl cluster-info | head -1
echo ""

# Step 1: Create namespace
info "Creating namespace: ${NAMESPACE}"
kubectl apply -f 00-namespace.yaml

# Step 2: Create ConfigMap
info "Creating ConfigMap..."
kubectl apply -f 01-configmap.yaml

# Step 3: Create Secrets
if ! kubectl get secret r-cycle-secrets -n ${NAMESPACE} &> /dev/null; then
    warn "Secret 'r-cycle-secrets' not found!"
    echo ""
    echo "You need to create the secret before continuing."
    echo ""
    echo "Option 1 - Use default POC credentials (quick start):"
    echo "  cp 02-secret.yaml.template 02-secret.yaml"
    echo "  kubectl apply -f 02-secret.yaml"
    echo "  rm 02-secret.yaml"
    echo ""
    echo "Option 2 - Generate strong credentials (recommended):"
    echo "  See k8s/README.md section 3 for instructions"
    echo ""
    read -p "Do you want to use default POC credentials? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ ! -f "02-secret.yaml.template" ]; then
            error "Template file 02-secret.yaml.template not found"
        fi
        info "Creating secret with default credentials..."
        cp 02-secret.yaml.template 02-secret.yaml
        kubectl apply -f 02-secret.yaml
        rm -f 02-secret.yaml
        info "Secret created (using default credentials)"
    else
        error "Please create the secret manually and run this script again"
    fi
else
    info "Secret already exists"
fi

# Step 4: Deploy PostgreSQL
info "Deploying PostgreSQL..."
kubectl apply -f 10-postgres-pvc.yaml
kubectl apply -f 11-postgres-deployment.yaml
kubectl apply -f 12-postgres-service.yaml

info "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=180s || {
    warn "PostgreSQL is taking longer than expected"
    echo "Checking pod status..."
    kubectl get pods -n ${NAMESPACE} -l app=postgres
    error "PostgreSQL failed to start. Check logs with: kubectl logs -n ${NAMESPACE} -l app=postgres"
}

info "PostgreSQL is ready!"

# Step 5: Initialize database
info "Initializing database schema..."

# Delete old job if exists
if kubectl get job db-init -n ${NAMESPACE} &> /dev/null; then
    warn "Old db-init job found, deleting..."
    kubectl delete job db-init -n ${NAMESPACE}
    sleep 2
fi

kubectl apply -f 20-db-init-job.yaml

info "Waiting for database initialization to complete..."
kubectl wait --for=condition=complete job/db-init -n ${NAMESPACE} --timeout=120s || {
    warn "Database initialization is taking longer than expected"
    echo "Checking job status..."
    kubectl get jobs -n ${NAMESPACE}
    echo ""
    echo "Logs:"
    kubectl logs -n ${NAMESPACE} -l component=db-init --tail=50
    error "Database initialization failed"
}

info "Database initialized successfully!"
echo ""
info "Viewing initialization logs:"
kubectl logs -n ${NAMESPACE} -l component=db-init --tail=20
echo ""

# Step 6: Deploy R-Cycle application
info "Deploying R-Cycle application..."
kubectl apply -f 30-r-cycle-deployment.yaml
kubectl apply -f 31-r-cycle-service.yaml

info "Waiting for R-Cycle deployment to be ready..."
kubectl wait --for=condition=available deployment/r-cycle -n ${NAMESPACE} --timeout=${DEPLOYMENT_TIMEOUT} || {
    warn "R-Cycle deployment is taking longer than expected"
    echo "Checking deployment status..."
    kubectl get deployments -n ${NAMESPACE}
    kubectl get pods -n ${NAMESPACE} -l app=r-cycle
    error "R-Cycle deployment failed. Check logs with: kubectl logs -n ${NAMESPACE} -l app=r-cycle"
}

info "R-Cycle application is ready!"

# Optional: Deploy ingress
if [ -f "32-r-cycle-ingress.yaml" ]; then
    echo ""
    read -p "Do you want to deploy the Ingress? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Deploying Ingress..."
        kubectl apply -f 32-r-cycle-ingress.yaml
        info "Ingress deployed"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""

info "Checking deployment status..."
kubectl get all -n ${NAMESPACE}

echo ""
echo "=========================================="
echo "Access Instructions:"
echo "=========================================="
echo ""
echo "1. Port Forward (local access):"
echo "   kubectl port-forward -n ${NAMESPACE} svc/r-cycle 8080:80"
echo "   Then open: http://localhost:8080"
echo ""
echo "2. Check logs:"
echo "   kubectl logs -n ${NAMESPACE} -l app=r-cycle -f"
echo ""
echo "3. Database access:"
echo "   kubectl exec -it -n ${NAMESPACE} \$(kubectl get pod -n ${NAMESPACE} -l app=postgres -o jsonpath='{.items[0].metadata.name}') -- psql -U postgres -d r_cycle"
echo ""
echo "4. Scale deployment:"
echo "   kubectl scale deployment r-cycle -n ${NAMESPACE} --replicas=5"
echo ""

info "For more information, see k8s/README.md"
