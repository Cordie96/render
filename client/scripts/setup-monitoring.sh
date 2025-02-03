#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Install monitoring tools
docker-compose -f docker-compose.prod.yml exec client apt-get update
docker-compose -f docker-compose.prod.yml exec client apt-get install -y prometheus-node-exporter

# Set up Prometheus
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
EOF

# Set up Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  --network app_network \
  -v grafana_data:/var/lib/grafana \
  grafana/grafana

echo "Monitoring setup completed successfully!" 