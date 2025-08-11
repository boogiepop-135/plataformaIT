// Configuration for different environments
const getBackendUrl = () => {
  // If VITE_BACKEND_URL is set in environment, use it
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // If we're in development mode
  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  // If we're in production and no VITE_BACKEND_URL is set,
  // assume the backend is on the same domain with /api prefix
  return window.location.origin;
};

export const BACKEND_URL = getBackendUrl();
export default BACKEND_URL;
