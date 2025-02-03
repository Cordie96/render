#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx if running
docker-compose -f docker-compose.prod.yml stop client || true

# Get SSL certificate
certbot certonly \
    --standalone \
    --agree-tos \
    --non-interactive \
    --email $DEPLOY_EMAIL \
    -d $DEPLOY_DOMAIN

# Start nginx
docker-compose -f docker-compose.prod.yml start client

echo "SSL certificates have been set up successfully!" 