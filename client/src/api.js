const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      // Token invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth endpoints
  auth: {
    login: async (identifier, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      return handleResponse(res);
    },
    register: async (username, email, password) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Notes endpoints
  notes: {
    getAll: async (search = '', category = 'All') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      
      const res = await fetch(`${API_BASE}/notes?${params.toString()}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getOne: async (id) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (noteData) => {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(noteData),
      });
      return handleResponse(res);
    },
    update: async (id, noteData) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(noteData),
      });
      return handleResponse(res);
    },
    togglePin: async (id) => {
      const res = await fetch(`${API_BASE}/notes/${id}/pin`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Reminders endpoints
  reminders: {
    getAll: async (status = '') => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const res = await fetch(`${API_BASE}/reminders?${params.toString()}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (reminderData) => {
      const res = await fetch(`${API_BASE}/reminders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reminderData),
      });
      return handleResponse(res);
    },
    update: async (id, reminderData) => {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(reminderData),
      });
      return handleResponse(res);
    },
    toggle: async (id) => {
      const res = await fetch(`${API_BASE}/reminders/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/reminders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
};
