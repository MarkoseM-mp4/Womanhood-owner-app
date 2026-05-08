import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
});

// Public tracking endpoints
export const searchOrders = (query) =>
  api.get(`/track?q=${encodeURIComponent(query)}`);

export const getOrderBySerial = (serialNumber) =>
  api.get(`/track/${encodeURIComponent(serialNumber)}`);

export default api;
