import api from './api';

interface HealthStatus {
  status: 'ok' | 'error';
  version: string;
  uptime: number;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const { data } = await api.get<HealthStatus>('/health');
    return data;
  } catch (error) {
    return {
      status: 'error',
      version: '0.0.0',
      uptime: 0,
    };
  }
}

export function startHealthCheck(interval = 30000) {
  return setInterval(async () => {
    try {
      const status = await checkHealth();
      if (status.status === 'error') {
        console.error('Health check failed');
      }
    } catch (error) {
      console.error('Health check error:', error);
    }
  }, interval);
} 