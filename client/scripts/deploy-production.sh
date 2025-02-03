#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Check prerequisites
echo "Checking prerequisites..."
./scripts/check-prereqs.sh

# Initialize production environment
echo "Initializing production environment..."
./scripts/init-production.sh

# Set up SSL certificates
echo "Setting up SSL certificates..."
./scripts/setup-ssl.sh

# Set up monitoring
echo "Setting up monitoring..."
./scripts/setup-monitoring.sh

# Set up logging
echo "Setting up logging..."
./scripts/setup-logging.sh

# Build and deploy
echo "Building and deploying application..."
./scripts/deploy.sh

# Verify deployment
echo "Verifying deployment..."
./scripts/monitor.sh

echo "Deployment completed successfully!" 