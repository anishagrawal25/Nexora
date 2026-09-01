const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Server returned error ${res.status}`);
    }
    return {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}

export async function uploadResume(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_URL}/resume/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Upload failed");
  }
  return data;
}

export { API_URL };