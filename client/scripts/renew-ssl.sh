#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Stop the nginx container
docker-compose -f docker-compose.prod.yml stop client

# Renew certificates
certbot renew

# Start the nginx container
docker-compose -f docker-compose.prod.yml start client

echo "SSL certificates renewed successfully!" 