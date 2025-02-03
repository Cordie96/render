#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Check prerequisites
./scripts/check-prereqs.sh

# Build the application
echo "Building application..."
npm run build

# Build and push Docker images
echo "Building and pushing Docker images..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy to server
echo "Deploying to server..."
ssh $DEPLOY_USER@$DEPLOY_HOST << 'ENDSSH'
  cd /opt/partykaraoke

  # Backup database
  ./scripts/backup.sh

  # Pull latest images
  docker-compose -f docker-compose.prod.yml pull

  # Deploy with zero downtime
  docker-compose -f docker-compose.prod.yml up -d --remove-orphans

  # Clean up old images
  docker image prune -f

  # Verify deployment
  ./scripts/monitor.sh
ENDSSH

echo "Deployment completed successfully!" 