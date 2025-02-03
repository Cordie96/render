#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Create logging directories
mkdir -p /opt/partykaraoke/logs/{nginx,app}

# Set up log rotation
cat > /etc/logrotate.d/partykaraoke << EOF
/opt/partykaraoke/logs/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ ! -f /var/run/nginx.pid ] || kill -USR1 \`cat /var/run/nginx.pid\`
    endscript
}

/opt/partykaraoke/logs/app/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 node node
    copytruncate
}
EOF

# Set up Filebeat for log shipping
cat > filebeat.yml << EOF
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /opt/partykaraoke/logs/nginx/*.log
    - /opt/partykaraoke/logs/app/*.log

output.elasticsearch:
  hosts: ["${ELASTICSEARCH_HOST}"]
  username: "${ELASTICSEARCH_USER}"
  password: "${ELASTICSEARCH_PASSWORD}"
EOF

echo "Logging setup completed successfully!" 