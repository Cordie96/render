#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Build and push Docker images
echo "Building and pushing Docker images..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Connect to production server and deploy
echo "Deploying to production server..."
ssh $DEPLOY_USER@$DEPLOY_HOST << 'ENDSSH'
  cd /opt/partykaraoke

  # Pull latest code
  git pull origin main

  # Pull latest images
  docker-compose -f docker-compose.prod.yml pull

  # Deploy with zero downtime
  docker-compose -f docker-compose.prod.yml up -d --remove-orphans

  # Clean up old images
  docker image prune -f
ENDSSH

echo "Deployment completed successfully!" 