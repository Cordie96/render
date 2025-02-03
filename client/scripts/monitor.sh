#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Check container status
echo "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Check container logs
echo "Checking container logs..."
docker-compose -f docker-compose.prod.yml logs --tail=100

# Check disk usage
echo "Checking disk usage..."
df -h

# Check memory usage
echo "Checking memory usage..."
free -h

# Check CPU usage
echo "Checking CPU usage..."
top -b -n 1 | head -n 20

# Check nginx status
echo "Checking nginx status..."
docker-compose -f docker-compose.prod.yml exec client nginx -t

# Check SSL certificate expiry
echo "Checking SSL certificate expiry..."
docker-compose -f docker-compose.prod.yml exec client \
  openssl x509 -dates -noout < /etc/nginx/ssl/live/yourapp.com/fullchain.pem 