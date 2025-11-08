#!/bin/bash
# Helper script to create Kubernetes secrets for R-Cycle

NAMESPACE="r-cycle"

echo "=========================================="
echo "R-Cycle Secret Generator"
echo "=========================================="
echo ""
echo "This script will help you create the r-cycle-secrets Secret"
echo ""

# Check if secret already exists
if kubectl get secret r-cycle-secrets -n ${NAMESPACE} &> /dev/null 2>&1; then
    echo "WARNING: Secret 'r-cycle-secrets' already exists in namespace '${NAMESPACE}'"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret r-cycle-secrets -n ${NAMESPACE}
        echo "Existing secret deleted"
    else
        echo "Keeping existing secret. Exiting."
        exit 0
    fi
fi

echo ""
echo "Choose an option:"
echo "1) Use default POC credentials (postgres/postgres)"
echo "2) Generate strong random password"
echo "3) Enter custom password"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Using default POC credentials..."
        POSTGRES_PASSWORD="postgres"
        ;;
    2)
        echo "Generating strong random password..."
        POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        echo "Generated password: ${POSTGRES_PASSWORD}"
        echo "IMPORTANT: Save this password securely!"
        ;;
    3)
        read -sp "Enter PostgreSQL password: " POSTGRES_PASSWORD
        echo ""
        if [ -z "$POSTGRES_PASSWORD" ]; then
            echo "ERROR: Password cannot be empty"
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Build DATABASE_URL
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/r_cycle"

# Encode to base64
POSTGRES_PASSWORD_B64=$(echo -n "$POSTGRES_PASSWORD" | base64)
DATABASE_URL_B64=$(echo -n "$DATABASE_URL" | base64)

# Create the secret
echo ""
echo "Creating secret in namespace '${NAMESPACE}'..."

kubectl create secret generic r-cycle-secrets \
    --namespace=${NAMESPACE} \
    --from-literal=POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    --from-literal=DATABASE_URL=${DATABASE_URL} \
    --dry-run=client -o yaml | kubectl apply -f -

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Secret created successfully!"
    echo ""
    echo "Secret details:"
    kubectl get secret r-cycle-secrets -n ${NAMESPACE}
    echo ""
    echo "To view the secret (without exposing values):"
    echo "  kubectl describe secret r-cycle-secrets -n ${NAMESPACE}"
else
    echo "ERROR: Failed to create secret"
    exit 1
fi
