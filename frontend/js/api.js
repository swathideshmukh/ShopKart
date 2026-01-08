// ======================
// API Configuration (PRODUCTION SAFE)
// ======================

const isLocal =
  window.location.protocol === 'http:' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

const API_BASE_URL = isLocal
  ? 'http://localhost:5000/api'
  : 'https://shopkart-tpug.onrender.com/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

// Auth API
const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  getMe: () => apiRequest('/auth/me')
};

// Products API
const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/products/${id}`),
  
  getCategories: () => apiRequest('/products/categories'),
  
  getFeatured: () => apiRequest('/products/featured'),
  
  seed: () => apiRequest('/products/seed', {
    method: 'POST'
  })
};

// Cart API
const cartAPI = {
  getCart: () => apiRequest('/cart'),
  
  addItem: (productId, quantity = 1) => apiRequest('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  
  updateQuantity: (productId, quantity) => apiRequest(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeItem: (productId) => apiRequest(`/cart/${productId}`, {
    method: 'DELETE'
  }),
  
  clearCart: () => apiRequest('/cart', {
    method: 'DELETE'
  })
};

// Orders API
const ordersAPI = {
  createOrder: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  getOrders: () => apiRequest('/orders'),
  
  getOrderById: (id) => apiRequest(`/orders/${id}`),
  
  cancelOrder: (id) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' })
  })
};

