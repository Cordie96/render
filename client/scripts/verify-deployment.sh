#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Check if services are running
echo "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Check application health
echo "Checking application health..."
curl -f https://$DOMAIN_NAME/health || exit 1

# Check SSL certificate
echo "Checking SSL certificate..."
ssl_expiry=$(openssl s_client -connect $DOMAIN_NAME:443 -servername $DOMAIN_NAME 2>/dev/null | openssl x509 -noout -enddate)
echo "SSL certificate expiry: $ssl_expiry"

# Check database connection
echo "Checking database connection..."
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres

# Check monitoring
echo "Checking monitoring services..."
curl -f http://localhost:9090/-/healthy || echo "Prometheus not healthy"
curl -f http://localhost:3000/api/health || echo "Grafana not healthy"

# Check logs
echo "Checking application logs..."
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "Deployment verification completed!" 