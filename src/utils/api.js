const API_BASE = '/api/v1';

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${path}`);
  }
  return res.json();
};

const get = (path) => request(path);

const post = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const put = (path, body) =>
  request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const del = (path) => request(path, { method: 'DELETE' });

// ─── API Methods ──────────────────────────────────────────────────────────────

export const api = {
  // Products
  getProducts: (params = {}) => get(`/products?${new URLSearchParams(params)}`),
  getCategories: () => get('/products/categories'),
  getProductById: (id) => get(`/products/${id}`),
  createProduct: (data) => post('/products', data),
  updateProduct: (id, data) => put(`/products/${id}`, data),
  deleteProduct: (id) => del(`/products/${id}`),

  // Orders
  createOrder: (payload) => post('/orders', payload),
  getOrders: (email = '') => get(`/orders${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  trackOrder: (id) => get(`/orders/${encodeURIComponent(id)}`),
  updateOrderStatus: (id, status) => put(`/orders/${encodeURIComponent(id)}/status`, { status }),
  validateCoupon: (code, subtotal) => post('/orders/validate-coupon', { code, subtotal }),

  // Reviews
  getReviews: (productId = '') => get(`/reviews${productId ? `?productId=${encodeURIComponent(productId)}` : ''}`),
  submitReview: (data) => post('/reviews', data),
  voteReviewHelpful: (id) => post(`/reviews/${id}/vote`, {}),
  deleteReview: (id) => del(`/reviews/${id}`),

  // Inventory
  getInventory: () => get('/inventory'),
  updateStock: (productId, payload) => put(`/inventory/${productId}`, payload),

  // Auth & Profile
  login: (email, password) => post('/auth/login', { email, password }),
  register: (data) => post('/auth/register', data),
  updateProfile: (data) => put('/auth/profile', data),
  addAddress: (userId, address) => post('/auth/addresses', { userId, address }),
  saveAddresses: (email, addresses) => put('/auth/addresses', { email, addresses }),

  // Analytics & Quotes
  getStats: () => get('/analytics/stats'),
  getQuotes: () => get('/analytics/quotes'),
  submitCustomQuote: (data) => post('/analytics/custom-quote', data),
};
