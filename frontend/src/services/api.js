import axios from 'axios';

// Dynamically compute API base URL to support testing on mobile devices over local Wi-Fi
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    // When accessed from mobile phone on the local Wi-Fi network, connect to phone's host IP at port 5000
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000/api`;
    }
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('budgetbite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login page, can clear token
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('budgetbite_token');
        localStorage.removeItem('budgetbite_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const foodAPI = {
  getFoods: (params) => api.get('/foods', { params }),
  getFoodById: (id) => api.get(`/foods/${id}`),
  createFood: (formData) => api.post('/foods', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateFood: (id, formData) => api.put(`/foods/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFood: (id) => api.delete(`/foods/${id}`)
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data)
};

export const comboAPI = {
  getCombos: (params) => api.get('/combos', { params }),
  getComboById: (id) => api.get(`/combos/${id}`),
  createCombo: (formData) => api.post('/combos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCombo: (id, formData) => api.put(`/combos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCombo: (id) => api.delete(`/combos/${id}`)
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status })
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  addAddress: (data) => api.post('/profile/address', data),
  deleteAddress: (id) => api.delete(`/profile/address/${id}`)
};

export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data)
};

export const customerAPI = {
  getCustomers: () => api.get('/customers')
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: () => api.get('/admin/reports')
};

export default api;
