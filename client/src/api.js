/**
 * Nexora API Client
 * Robust endpoint resolution and error handling for both local dev and production deployments.
 */

function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If running in a deployed browser environment on a non-localhost host
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
}

const API_URL = resolveBaseUrl();

function buildUrl(endpoint) {
  const base = resolveBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If base already ends with /api and cleanEndpoint also starts with /api/, prevent /api/api/
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  return `${base}${cleanEndpoint}`;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const url = buildUrl(endpoint);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (netErr) {
    console.error(`[Nexora Network Error] Failed to reach ${url}:`, netErr);
    throw new Error(
      `Network connection failed to ${url}. Please verify your backend server is deployed and running.`
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    if (!res.ok) {
      if (res.status === 404) {
        console.error(`[Nexora API 404] Endpoint not found at ${url}`);
        throw new Error(
          `API endpoint not found (404 at ${url}). If this is a deployed environment, ensure VITE_API_URL is configured in your frontend deployment settings (e.g. Vercel/Render env vars) pointing to your live backend (e.g. https://your-backend.onrender.com/api).`
        );
      }
      throw new Error(`Server returned error ${res.status}`);
    }
    return {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }

  return data;
}

export async function uploadResume(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('resume', file);
  const url = buildUrl('/resume/upload');

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch (netErr) {
    console.error(`[Nexora Upload Error] Failed to reach ${url}:`, netErr);
    throw new Error(`Network connection failed during upload to ${url}.`);
  }

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    return {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Upload failed');
  }
  return data;
}

export { API_URL, buildUrl };