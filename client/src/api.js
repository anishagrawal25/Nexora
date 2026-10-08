function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

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

  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  return `${base}${cleanEndpoint}`;
}

async function readResponse(response, url, requestType) {
  let data;
  try {
    data = await response.json();
  } catch (cause) {
    if (response.ok) return {};
    if (response.status === 404) {
      throw new Error(
        `API endpoint not found (404 at ${url}). Check VITE_API_URL for this deployment.`,
        { cause }
      );
    }
    throw new Error(`${requestType} failed with status ${response.status}`, { cause });
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `${requestType} failed (${response.status})`, {
      cause: data,
    });
  }
  return data;
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const url = buildUrl(endpoint);
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (cause) {
    console.error(`[Nexora Network Error] Failed to reach ${url}:`, cause);
    throw new Error(`Network connection failed to ${url}. Check that the backend is running.`, {
      cause,
    });
  }

  return readResponse(response, url, 'Request');
}

export async function uploadResume(file) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('resume', file);
  const url = buildUrl('/resume/upload');
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch (cause) {
    console.error(`[Nexora Upload Error] Failed to reach ${url}:`, cause);
    throw new Error(`Network connection failed during upload to ${url}.`, { cause });
  }

  return readResponse(response, url, 'Upload');
}

export { API_URL, buildUrl };