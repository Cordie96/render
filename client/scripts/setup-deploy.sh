#!/bin/bash

# Make deployment scripts executable
chmod +x scripts/*.sh

# Create necessary directories
mkdir -p backups
mkdir -p logs

# Create symbolic links for configuration files
ln -sf docker-compose.prod.yml docker-compose.yml
ln -sf nginx.ssl.conf nginx.conf

# Set up environment variables
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "Deployment setup completed!" 