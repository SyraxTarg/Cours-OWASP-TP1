import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://localhost:3443/api' : 'http://localhost:3000/api',
  withCredentials: true
});

export default api;
