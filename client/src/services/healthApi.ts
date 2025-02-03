import api from './api';

export const healthApi = {
  check: async () => {
    const { data } = await api.get('/health');
    return data;
  },
};

export default healthApi; 