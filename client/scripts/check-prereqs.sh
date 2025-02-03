#!/bin/bash

# Exit on error
set -e

echo "Checking deployment prerequisites..."

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed"
    exit 1
fi

# Check Docker Compose installation
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed"
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed"
    exit 1
fi

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "npm is not installed"
    exit 1
fi

# Check environment files
if [ ! -f .env ]; then
    echo ".env file is missing"
    exit 1
fi

if [ ! -f .env.production ]; then
    echo ".env.production file is missing"
    exit 1
fi

# Check SSL certificates directory
if [ ! -d "/etc/letsencrypt" ]; then
    echo "SSL certificates directory is missing"
    exit 1
fi

echo "All prerequisites are met!" 