#!/bin/bash

# Global Market Expansion Platform - Deployment Script
# This script automates the deployment process for the platform

set -e

echo "🚀 Starting deployment of Global Market Expansion Platform..."

# Configuration
PROJECT_NAME="global-market-platform"
REGISTRY="docker.io"
IMAGE_TAG="latest"
NAMESPACE="global-market-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if ! command -v kubectl &> /dev/null; then
        log_warn "kubectl is not installed. Kubernetes deployment will be skipped."
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    log_info "Prerequisites check completed."
}

# Build the application
build_application() {
    log_info "Building the application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Run tests
    log_info "Running tests..."
    npm test
    
    # Build the application
    log_info "Building application..."
    npm run build
    
    # Run linting
    log_info "Running linting..."
    npm run lint
    
    log_info "Application build completed."
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    # Build Docker image
    docker build -t ${REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG} .
    
    log_info "Docker image built successfully."
}

# Push Docker image to registry
push_docker_image() {
    log_info "Pushing Docker image to registry..."
    
    # Push image to registry
    docker push ${REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}
    
    log_info "Docker image pushed successfully."
}

# Deploy to Kubernetes
deploy_kubernetes() {
    if ! command -v kubectl &> /dev/null; then
        log_warn "kubectl not found. Skipping Kubernetes deployment."
        return
    fi
    
    log_info "Deploying to Kubernetes..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/ -n ${NAMESPACE}
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/${PROJECT_NAME} -n ${NAMESPACE}
    
    log_info "Kubernetes deployment completed."
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run database migrations
    npm run db:push
    
    log_info "Database migrations completed."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for application to be ready
    sleep 30
    
    # Check if application is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "Health check passed."
    else
        log_error "Health check failed."
        exit 1
    fi
}

# Main deployment function
deploy() {
    log_info "Starting deployment process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Build application
    build_application
    
    # Run database migrations
    run_migrations
    
    # Build Docker image
    build_docker_image
    
    # Push Docker image
    push_docker_image
    
    # Deploy to Kubernetes
    deploy_kubernetes
    
    # Health check
    health_check
    
    log_info "🎉 Deployment completed successfully!"
}

# Rollback function
rollback() {
    log_info "Starting rollback process..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Cannot perform rollback."
        exit 1
    fi
    
    # Rollback to previous revision
    kubectl rollout undo deployment/${PROJECT_NAME} -n ${NAMESPACE}
    
    # Wait for rollback to complete
    kubectl wait --for=condition=available --timeout=300s deployment/${PROJECT_NAME} -n ${NAMESPACE}
    
    log_info "Rollback completed successfully."
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused Docker volumes
    docker volume prune -f
    
    log_info "Cleanup completed."
}

# Main script execution
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "cleanup")
        cleanup
        ;;
    "build-only")
        build_application
        build_docker_image
        ;;
    "test-only")
        npm test
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|cleanup|build-only|test-only}"
        echo ""
        echo "Commands:"
        echo "  deploy      - Deploy the application (default)"
        echo "  rollback    - Rollback to previous deployment"
        echo "  cleanup     - Clean up unused resources"
        echo "  build-only  - Build application and Docker image only"
        echo "  test-only   - Run tests only"
        exit 1
        ;;
esac

exit 0