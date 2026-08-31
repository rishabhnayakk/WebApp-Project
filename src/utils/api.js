const API_BASE = '/api/v1';

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to create product SKU');
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Orders
  async createOrder(orderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to place order');
    }
    return res.json();
  },

  async validateCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/orders/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Invalid coupon code');
    }
    return res.json();
  },

  async getOrders(email = '') {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE}/orders${query}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async trackOrder(orderOrTrackingId) {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderOrTrackingId)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Tracking ID or order not found');
    }
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Customer Reviews
  async getReviews(productId = '') {
    const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    const res = await fetch(`${API_BASE}/reviews${query}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async submitReview(reviewData) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit review');
    }
    return res.json();
  },

  async voteReviewHelpful(reviewId) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/vote`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to vote review');
    return res.json();
  },

  async deleteReview(reviewId) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete review');
    return res.json();
  },

  // Inventory
  async getInventory() {
    const res = await fetch(`${API_BASE}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async updateStock(productId, stockPayload) {
    const res = await fetch(`${API_BASE}/inventory/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockPayload),
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return res.json();
  },

  // Auth & Profile
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async addAddress(userId, address) {
    const res = await fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, address }),
    });
    if (!res.ok) throw new Error('Failed to save address');
    return res.json();
  },

  // Analytics & Custom Quotes
  async getStats() {
    const res = await fetch(`${API_BASE}/analytics/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async submitCustomQuote(quoteData) {
    const res = await fetch(`${API_BASE}/analytics/custom-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit quote');
    }
    return res.json();
  },

  async getQuotes() {
    const res = await fetch(`${API_BASE}/analytics/quotes`);
    if (!res.ok) throw new Error('Failed to fetch quotes');
    return res.json();
  }
};
