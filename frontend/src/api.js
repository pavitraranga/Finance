import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

api.interceptors.request.use(config => {
  const system = localStorage.getItem('systemType') || 'monthly';
  config.headers['X-System-Type'] = system;
  return config;
});

export default api;
