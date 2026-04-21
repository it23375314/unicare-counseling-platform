import axios from 'axios';

// Unified API base URL — both UniCare core and Wellness module run on port 5001
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Intercept all axios requests and route /api/* paths to the unified backend
axios.interceptors.request.use((config) => {
  if (!config?.url) return config;

  // If URL already has a full localhost URL, rewrite to unified port
  const isLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(config.url);
  if (isLocalUrl) {
    const parsedUrl = new URL(config.url);
    return {
      ...config,
      baseURL: API_BASE_URL,
      url: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
    };
  }

  // If URL is a relative /api/ path, apply base URL
  if (config.url.startsWith('/api/')) {
    return { ...config, baseURL: API_BASE_URL };
  }

  return config;
});

// Helper to build a full API URL from a path
export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default axios;
