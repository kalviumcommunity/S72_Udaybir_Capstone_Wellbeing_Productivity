const API_URL = import.meta.env.VITE_API_URL || 'https://sentience.onrender.com/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to make authenticated requests
const authRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Task API functions
export const taskAPI = {
  getAll: () => authRequest('/tasks'),
  create: (taskData) => authRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),
  update: (id, taskData) => authRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  }),
  delete: (id) => authRequest(`/tasks/${id}`, {
    method: 'DELETE'
  })
};

// Mood API functions
export const moodAPI = {
  getAll: () => authRequest('/mood'),
  create: (moodData) => authRequest('/mood', {
    method: 'POST',
    body: JSON.stringify(moodData)
  }),
  delete: (id) => authRequest(`/mood/${id}`, {
    method: 'DELETE'
  })
};

// Study Session API functions
export const studyAPI = {
  getAll: () => authRequest('/study-sessions'),
  create: (sessionData) => authRequest('/study-sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }),
  update: (id, sessionData) => authRequest(`/study-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData)
  }),
  delete: (id) => authRequest(`/study-sessions/${id}`, {
    method: 'DELETE'
  })
};

// Focus Session API functions
export const focusAPI = {
  getAll: () => authRequest('/focus-sessions'),
  create: (sessionData) => authRequest('/focus-sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }),
  delete: (id) => authRequest(`/focus-sessions/${id}`, {
    method: 'DELETE'
  })
};

// Health check
export const healthCheck = () => fetch(`${API_URL}/health`).then(res => res.json()); 