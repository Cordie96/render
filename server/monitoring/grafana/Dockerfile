FROM grafana/grafana:latest

COPY ./datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY ./dashboards /var/lib/grafana/dashboards
COPY ./provisioning/notifiers /etc/grafana/provisioning/notifiers

ENV GF_INSTALL_PLUGINS="grafana-piechart-panel,grafana-worldmap-panel" 