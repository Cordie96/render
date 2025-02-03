#!/bin/bash

# Exit on error
set -e

# Create necessary directories
mkdir -p /opt/partykaraoke/{logs,backups,ssl}

# Copy configuration files
cp docker-compose.prod.yml /opt/partykaraoke/
cp nginx.ssl.conf /opt/partykaraoke/
cp .env.prod /opt/partykaraoke/.env

# Set up SSL certificates
./scripts/setup-ssl.sh

# Initialize database
docker-compose -f docker-compose.prod.yml up -d db
sleep 10  # Wait for database to be ready

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api npm run migrate

# Start all services
docker-compose -f docker-compose.prod.yml up -d

echo "Production environment initialized successfully!" 