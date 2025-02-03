#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
echo "Backing up database..."
docker-compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres partykaraoke > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Backup SSL certificates
echo "Backing up SSL certificates..."
tar -czf "$BACKUP_DIR/ssl_backup_$TIMESTAMP.tar.gz" /etc/letsencrypt

# Backup environment files
echo "Backing up environment files..."
tar -czf "$BACKUP_DIR/env_backup_$TIMESTAMP.tar.gz" .env* docker-compose*.yml

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed successfully!" 