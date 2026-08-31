/**
 * DINKAL Aerosol Technologies — Vanilla JavaScript Storefront Controller
 * Complete State, Router, API Client, and Component Renderers
 */

// --------------------------------------------------------------------------
// 1. STATE & PERSISTENCE
// --------------------------------------------------------------------------
const State = {
  currentView: 'home',
  viewParams: {},
  products: [],
  categories: ['All'],
  selectedProduct: null,

  cart: JSON.parse(localStorage.getItem('dinkal_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('dinkal_wishlist') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('dinkal_user') || 'null'),

  appliedCoupon: null,
  isCartOpen: false,
  isSearchOpen: false,
  isAuthOpen: false,
  authMode: 'signin', // signin | register | reset
  toastTimeout: null,

  // Shop filter state
  shopFilters: {
    category: 'All',
    search: '',
    maxPrice: 70,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'featured',
    showFilterPanel: false,
  },

  // PDP tab state
  pdpTab: 'specs',

  // Checkout flow state
  checkout: {
    step: 1,
    contact: { name: '', email: '', phone: '' },
    shipping: { name: '', company: '', street: '', city: '', state: '', zip: '', country: 'US' },
    shippingMethod: 'standard',
    payment: { cardNumber: '', expiry: '', cvv: '', name: '' },
    completedOrder: null,
  },

  // Tracking query
  trackingId: '',
  trackingResult: null,

  // Account portal active tab
  accountTab: 'orders',
  accountOrders: [],
};

// If no user is logged in, default to an initial B2B demo profile for instant rich experience
if (!State.currentUser) {
  State.currentUser = {
    id: 'usr-101',
    name: 'Dr. Marcus Sterling',
    email: 'm.sterling@novaaero.com',
    role: 'customer_b2b',
    company: 'NovaAero Dynamics LLC',
    tier: 'B2B Enterprise Gold',
    phone: '+1 (206) 555-0182',
    addresses: [
      {
        id: 'addr-1',
        isDefault: true,
        type: 'Commercial Hangar',
        name: 'Dr. Marcus Sterling',
        company: 'NovaAero Dynamics',
        street: '740 Aerospace Blvd, Hangar 4B',
        city: 'Seattle',
        state: 'WA',
        zip: '98108',
      }
    ]
  };
  localStorage.setItem('dinkal_user', JSON.stringify(State.currentUser));
}

// Ensure default cart item if totally empty for demo
if (State.cart.length === 0) {
  State.cart = [
    {
      id: 'aero-ceramax-pro',
      name: 'CERAMAX™ 9H Nano-Ceramic Clear Coat',
      sku: 'AERO-CRM-500',
      price: 49.99,
      quantity: 2,
      volume: '500ml (16.9 fl oz)',
      color: '#0284c7',
    }
  ];
  localStorage.setItem('dinkal_cart', JSON.stringify(State.cart));
}

function saveCart() {
  localStorage.setItem('dinkal_cart', JSON.stringify(State.cart));
  updateHeaderCounts();
  renderCartDrawer();
}

function saveWishlist() {
  localStorage.setItem('dinkal_wishlist', JSON.stringify(State.wishlist));
  updateHeaderCounts();
}

function saveUser() {
  localStorage.setItem('dinkal_user', JSON.stringify(State.currentUser));
}

// --------------------------------------------------------------------------
// 2. API CLIENT
// --------------------------------------------------------------------------
const API_BASE = '/api/v1';

const Api = {
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products${query ? '?' + query : ''}`);
    return res.json();
  },
  async getCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    return res.json();
  },
  async getReviews(productId) {
    const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
    return res.json();
  },
  async voteReviewHelpful(reviewId) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, { method: 'POST' });
    return res.json();
  },
  async validateCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/orders/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return res.json();
  },
  async createOrder(payload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  async trackOrder(orderId) {
    const res = await fetch(`${API_BASE}/orders/track/${orderId}`);
    return res.json();
  },
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },
  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return res.json();
  },
  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
  async submitContact(data) {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

// --------------------------------------------------------------------------
// 3. CANISTER GRAPHIC RENDERER (SVG/CSS Hybrid)
// --------------------------------------------------------------------------
function renderCanisterHtml(color = '#1e3a5f', height = 140, label = '') {
  const w = Math.round(height * 0.38);
  const nozzleW = Math.round(w * 0.32);
  const nozzleH = Math.round(height * 0.06);
  const capW = Math.round(w * 0.75);
  const capH = Math.round(height * 0.09);
  const bodyH = Math.round(height * 0.72);
  const baseH = Math.round(height * 0.05);

  return `
    <div class="canister-visual" style="pointer-events: none;">
      <div style="width: ${nozzleW}px; height: ${nozzleH}px; background-color: #9ca3af; border-radius: 2px 2px 0 0;"></div>
      <div style="width: ${capW}px; height: ${capH}px; background-color: #d1d5db; border-radius: 3px 3px 0 0;"></div>
      <div style="width: ${w}px; height: ${bodyH}px; background: linear-gradient(175deg, ${color} 0%, ${color}cc 60%, ${color}99 100%); border-radius: 3px 3px 4px 4px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; left: 16%; top: 8%; bottom: 8%; width: 12%; background: rgba(255,255,255,0.16); border-radius: 4px;"></div>
        <div style="position: absolute; left: 32%; top: 8%; bottom: 8%; width: 5%; background: rgba(255,255,255,0.06); border-radius: 4px;"></div>
        ${label ? `<span style="font-size: ${Math.max(7, Math.round(height * 0.065))}px; font-weight: 700; color: rgba(255,255,255,0.9); letter-spacing: 0.05em; font-family: var(--font-mono); text-align: center; padding: 0 4px;">${label}</span>` : ''}
      </div>
      <div style="width: ${Math.round(w * 0.9)}px; height: ${baseH}px; background-color: #111827; border-radius: 0 0 3px 3px;"></div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. TOAST NOTIFICATIONS
// --------------------------------------------------------------------------
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  container.innerHTML = `<div class="toast">${message}</div>`;
  clearTimeout(State.toastTimeout);
  State.toastTimeout = setTimeout(() => {
    container.innerHTML = '';
  }, 2800);
}

// --------------------------------------------------------------------------
// 5. ROUTER & NAVIGATION
// --------------------------------------------------------------------------
function navigate(view, params = {}) {
  State.currentView = view;
  State.viewParams = params;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update active nav styling
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === view);
  });

  // Render view
  renderCurrentView();
}

function renderCurrentView() {
  const app = document.getElementById('app-main');
  if (!app) return;

  switch (State.currentView) {
    case 'home':
      renderHomeView(app);
      break;
    case 'shop':
      renderShopView(app);
      break;
    case 'product-detail':
      renderProductDetailView(app);
      break;
    case 'wishlist':
      renderWishlistView(app);
      break;
    case 'checkout':
      renderCheckoutView(app);
      break;
    case 'track':
      renderTrackView(app);
      break;
    case 'account':
      renderAccountView(app);
      break;
    case 'about':
      renderAboutView(app);
      break;
    case 'contact':
      renderContactView(app);
      break;
    case 'faq':
      renderFaqView(app);
      break;
    case 'admin':
      renderAdminView(app);
      break;
    default:
      renderHomeView(app);
  }
}

// --------------------------------------------------------------------------
// 6. VIEW RENDERERS
// --------------------------------------------------------------------------

// --- HOME VIEW ---
function renderHomeView(container) {
  const featured = State.products.slice(0, 4);
  const collection = State.products.slice(0, 8);

  const categories = [
    { name: 'Automotive & Marine', count: 24, desc: 'Ceramic coatings, cavity wax, clear coats' },
    { name: 'Electronics & Precision', count: 18, desc: 'Dielectric cleaners, flux removers' },
    { name: 'Industrial & Coatings', count: 32, desc: 'Thermal enamel, dry film lubricants' },
    { name: 'Sanitization & Medical', count: 12, desc: 'Hospital-grade foggers, disinfectants' },
    { name: 'Art & Specialty', count: 15, desc: 'Low-pressure caps, chroma shift finishes' },
    { name: 'New Formulations', count: 8, desc: 'Latest high-performance releases' },
  ];

  container.innerHTML = `
    <!-- 01: HERO -->
    <section class="section-border-b" style="padding-top: 80px; padding-bottom: 0; overflow: hidden;">
      <div class="container">
        <span class="section-label" style="margin-bottom: 24px;">ISO 9001:2015 · DOT-SP Certified · UN1950 Compliant</span>
        <h1 class="text-display" style="max-width: 780px; margin-bottom: 24px;">
          Precision aerosol engineering for every application.
        </h1>
        <p class="text-large" style="max-width: 520px; margin-bottom: 40px;">
          Professional aerosol formulations for aerospace, automotive, electronics, and medical applications — built with 360° all-angle valves and zero-ODP eco-propellants.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 72px;">
          <button class="btn btn-inverted btn-xl" onclick="navigate('shop')">
            Explore products →
          </button>
          <button class="btn btn-neutral btn-xl" onclick="navigate('about')">
            About DINKAL
          </button>
        </div>

        <!-- Featured Canister Row -->
        <div style="display: flex; border-top: 1px solid var(--color-border); border-left: 1px solid var(--color-border); flex-wrap: wrap;">
          ${[
            { color: '#0284c7', label: 'CERAMAX', name: 'CERAMAX™ 9H', sub: 'Nano-Ceramic Coat', price: '$49.99', id: 'aero-ceramax-pro' },
            { color: '#b91c1c', label: 'PYROGRD', name: 'PYROGUARD™', sub: '1200°C Thermal', price: '$34.99', id: 'aero-thermal-1200' },
            { color: '#047857', label: 'ELECCLR', name: 'ELECTRICLEAN™', sub: 'Dielectric Flush', price: '$28.99', id: 'aero-dielectric-flush' },
            { color: '#6d28d9', label: 'VAPOR', name: 'VAPOR-PURE™', sub: 'Hospital Fogger', price: '$44.99', id: 'aero-bio-fogger' },
          ].map(item => `
            <div style="flex: 1; min-width: 200px; border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 40px 24px 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; cursor: pointer; background: var(--color-bg); transition: background-color var(--transition-fast);"
                 onmouseenter="this.style.backgroundColor='var(--color-bg-subtle)'"
                 onmouseleave="this.style.backgroundColor='var(--color-bg)'"
                 onclick="openProductById('${item.id}')">
              ${renderCanisterHtml(item.color, 150, item.label)}
              <div style="text-align: center;">
                <div style="font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 2px;">${item.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 8px;">${item.sub}</div>
                <div style="font-size: 14px; font-weight: 600; color: var(--color-text);">${item.price}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 02: CATEGORY NAV -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing);">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;">
          <div>
            <span class="section-label">Browse</span>
            <h2 class="text-h2">Shop by category</h2>
          </div>
          <button class="btn btn-neutral btn-sm" onclick="navigate('shop')">
            All formulations →
          </button>
        </div>

        <div class="category-grid">
          ${categories.map(cat => `
            <div class="category-cell" onclick="navigate('shop', { category: '${cat.name}' })">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted);">
                ${cat.count} formulas
              </div>
              <div style="font-size: 16px; font-weight: 600; color: var(--color-text); letter-spacing: -0.01em;">
                ${cat.name}
              </div>
              <div style="font-size: 14px; color: var(--color-text-muted); line-height: 1.4;">
                ${cat.desc}
              </div>
              <div style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-top: 8px;">
                Shop now →
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 03: FEATURED PRODUCTS -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing);">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;">
          <div>
            <span class="section-label">Featured</span>
            <h2 class="text-h2">Best-selling formulations</h2>
          </div>
          <button class="btn btn-neutral btn-sm" onclick="navigate('shop')">
            View all →
          </button>
        </div>

        <div class="product-grid">
          ${featured.map(p => renderProductCardHtml(p)).join('')}
        </div>
      </div>
    </section>

    <!-- 04: EDITORIAL BRAND STATEMENT -->
    <section class="section-border-b" style="padding-top: var(--section-spacing-lg); padding-bottom: var(--section-spacing-lg); background-color: var(--color-bg);">
      <div class="container" style="text-align: center;">
        <p style="font-size: clamp(26px, 3.6vw, 48px); font-weight: 500; line-height: 1.25; letter-spacing: -0.02em; color: var(--color-text); max-width: 860px; margin: 0 auto;">
          "Aerosol products engineered for performance, reliability, and every industrial challenge — from the cleanroom to the field."
        </p>
        <div style="width: 40px; height: 1px; background-color: var(--color-border-strong); margin: 40px auto 0;"></div>
      </div>
    </section>

    <!-- 05: FULL CATALOG GRID -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing);">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;">
          <div>
            <span class="section-label">Catalog</span>
            <h2 class="text-h2">Complete product line</h2>
          </div>
          <button class="btn btn-neutral btn-sm" onclick="navigate('shop')">
            Browse catalog →
          </button>
        </div>

        <div class="product-grid">
          ${collection.map(p => renderProductCardHtml(p)).join('')}
        </div>
      </div>
    </section>

    <!-- 06: WHY DINKAL -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing);">
      <div class="container">
        <div style="margin-bottom: 48px;">
          <span class="section-label">Why DINKAL</span>
          <h2 class="text-h2" style="max-width: 480px;">Manufacturing standards that set the benchmark.</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); border-top: 1px solid var(--color-border); border-left: 1px solid var(--color-border);">
          ${[
            { num: '01', title: 'ISO Class 5 Cleanroom', body: 'Every canister is filled in a particulate-controlled environment and 100% water-bath tested for structural integrity before dispatch.' },
            { num: '02', title: 'Zero-ODP Propellants', body: 'We use Eco-HFO 1234ze and purified nitrogen — both with GWP < 1 — across our entire product line. CARB 2026 and EU REACH compliant.' },
            { num: '03', title: '360° All-Angle Valves', body: 'Dual-port dip tube technology delivers consistent 12-micron atomization at any spray angle, including fully inverted application.' },
          ].map(item => `
            <div style="border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 40px 32px;">
              <div style="font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 20px;">
                ${item.num}
              </div>
              <h3 style="font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 12px;">${item.title}</h3>
              <p style="font-size: 15px; color: var(--color-text-muted); line-height: 1.65;">${item.body}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 07: SAFETY & COMPLIANCE TABLE -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing); background-color: var(--color-bg-subtle);">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 64px; align-items: center;">
          <div>
            <span class="section-label">Safety & Compliance</span>
            <h2 class="text-h2" style="margin-bottom: 20px;">Every canister is certified before it ships.</h2>
            <p class="text-body" style="margin-bottom: 32px;">
              All DINKAL aerosols comply with DOT 49 CFR HazMat regulations, OSHA Hazard Communication Standard (29 CFR 1910.1200), and full Safety Data Sheet (SDS/GHS) documentation is included with every order.
            </p>
            <button class="btn btn-neutral btn-md" onclick="navigate('faq')">
              Safety documentation →
            </button>
          </div>

          <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-bg);">
            ${[
              { std: 'UN1950', desc: 'Aerosols — Limited Quantity HazMat Classification' },
              { std: 'ISO 9001:2015', desc: 'Quality Management System Certified' },
              { std: 'CARB 2026', desc: 'California VOC Emission Standard Compliant' },
              { std: 'GHS/SDS', desc: 'Globally Harmonised Safety Data Sheets' },
              { std: 'DOT-SP', desc: 'Special Permit — Pressurized Ground Transport' },
              { std: 'EU REACH', desc: 'European Chemicals Regulation Compliant' },
            ].map((row, idx, arr) => `
              <div style="display: flex; gap: 20px; padding: 14px 20px; border-bottom: ${idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none'}; align-items: flex-start;">
                <div style="font-size: 12px; font-weight: 700; color: var(--color-text); font-family: var(--font-mono); min-width: 100px;">${row.std}</div>
                <div style="font-size: 13px; color: var(--color-text-muted); line-height: 1.5;">${row.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- 08: TESTIMONIALS -->
    <section class="section-border-b" style="padding-top: var(--section-spacing); padding-bottom: var(--section-spacing);">
      <div class="container">
        <div style="margin-bottom: 48px;">
          <span class="section-label">Testimonials</span>
          <h2 class="text-h2">Trusted by engineers worldwide.</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); border-top: 1px solid var(--color-border); border-left: 1px solid var(--color-border);">
          ${[
            { name: 'Dr. Marcus Sterling', role: 'Chief Engineer, NovaAero Dynamics', text: 'The CERAMAX 9H delivered a uniform 12-micron ceramic matrix across our carbon-fibre winglet fairings. No sputter, no pressure drop, even inverted.', prod: 'CERAMAX™ 9H' },
            { name: 'Dr. Evelyn Chen', role: 'Sterile Systems Director, Apex BioTech', text: 'VAPOR-PURE cut our cleanroom decontamination time by 65%. Zero liquid residue on sensitive optical instruments, 6-log pathogen inactivation confirmed.', prod: 'VAPOR-PURE™' },
            { name: 'Dominic Russo', role: 'Master Fabricator, Russo Corsa', text: 'PYROGUARD 1200°C is the highest quality thermal enamel we have tested. After 40 dyno heat cycles, the finish remains deep and unblemished.', prod: 'PYROGUARD™ 1200°C' },
          ].map(rev => `
            <div style="border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 32px;">
              <div style="display: flex; gap: 2px; margin-bottom: 20px; color: #f59e0b;">★★★★★</div>
              <p style="font-size: 15px; line-height: 1.65; color: var(--color-text-secondary); margin-bottom: 24px; font-style: italic;">"${rev.text}"</p>
              <div style="border-top: 1px solid var(--color-border); paddingTop: 16px;">
                <div style="font-size: 13px; font-weight: 600; color: var(--color-text);">${rev.name}</div>
                <div style="font-size: 12px; color: var(--color-text-muted); margin-top: 2px;">${rev.role}</div>
                <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 6px; font-family: var(--font-mono);">${rev.prod}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 09: FINAL CTA -->
    <section style="padding-top: var(--section-spacing-lg); padding-bottom: var(--section-spacing-lg); background-color: var(--color-text);">
      <div class="container" style="text-align: center;">
        <span class="section-label" style="color: rgba(255,255,255,0.5); margin-bottom: 20px;">Get Started</span>
        <h2 style="font-size: clamp(30px, 3.8vw, 54px); font-weight: 600; line-height: 1.15; letter-spacing: -0.025em; color: #ffffff; max-width: 640px; margin: 0 auto 24px;">
          Ready to upgrade your aerosol program?
        </h2>
        <p style="font-size: 17px; color: rgba(255,255,255,0.65); max-width: 480px; margin: 0 auto 40px; line-height: 1.6;">
          Order online with same-day HazMat ground dispatch, or contact our engineers to discuss custom formulations.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-lg" style="background: #ffffff; color: var(--color-text);" onclick="navigate('shop')">
            Browse catalog →
          </button>
          <button class="btn btn-lg" style="background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.25);" onclick="navigate('contact')">
            Contact sales
          </button>
        </div>
      </div>
    </section>
  `;
}

// Product Card HTML generator
function renderProductCardHtml(product) {
  const isSaved = State.wishlist.some(w => w.id === product.id);
  return `
    <div class="product-card" onclick="openProductById('${product.id}')">
      <div class="product-card__image-wrap">
        <div class="product-card__canister" style="padding: 32px 0 24px;">
          ${renderCanisterHtml(product.color || '#1e3a5f', 140, product.sku ? product.sku.split('-')[1] : '')}
        </div>
        <div class="product-card__quick-add">
          <button class="btn btn-inverted btn-sm btn-full" onclick="event.stopPropagation(); addToCartById('${product.id}')">
            Add to cart
          </button>
        </div>
      </div>
      <div class="product-card__info">
        <div class="product-card__category">${product.category}</div>
        <div class="product-card__name">${product.name}</div>
        <div style="font-size: 12px; color: var(--color-text-placeholder); margin-top: 2px;">${product.volume || ''}</div>
        <div class="product-card__meta">
          <div class="product-card__rating">
            <span style="color: #f59e0b;">★</span>
            <span>${product.rating} <span style="color: var(--color-text-placeholder);">(${product.reviewCount})</span></span>
          </div>
          <div class="product-card__price">$${Number(product.price).toFixed(2)}</div>
        </div>
      </div>
    </div>
  `;
}

// --- SHOP VIEW ---
function renderShopView(container) {
  const f = State.shopFilters;
  const allCats = ['All', ...new Set(State.products.map(p => p.category))];

  // If params passed from nav
  if (State.viewParams.category) {
    f.category = State.viewParams.category;
    State.viewParams.category = null;
  }
  if (State.viewParams.search) {
    f.search = State.viewParams.search;
    State.viewParams.search = null;
  }

  let filtered = State.products.filter(p => {
    const matchCat = f.category === 'All' || p.category === f.category;
    const matchSearch = !f.search.trim() ||
      p.name.toLowerCase().includes(f.search.toLowerCase()) ||
      p.category.toLowerCase().includes(f.search.toLowerCase()) ||
      (p.tagline && p.tagline.toLowerCase().includes(f.search.toLowerCase()));
    const matchPrice = p.price <= f.maxPrice;
    const matchStock = !f.inStockOnly || p.inStock;
    const matchRating = p.rating >= f.minRating;
    return matchCat && matchSearch && matchPrice && matchStock && matchRating;
  });

  if (f.sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (f.sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (f.sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (f.sortBy === 'reviews') filtered.sort((a, b) => b.reviewCount - a.reviewCount);

  const hasFilters = f.maxPrice < 70 || f.inStockOnly || f.minRating > 0 || f.search.trim() !== '';

  container.innerHTML = `
    <!-- Header -->
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 0;">
        <span class="section-label">Catalog</span>
        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding-bottom: 32px;">
          <div>
            <h1 class="text-h1">All Products</h1>
            <p style="font-size: 14px; color: var(--color-text-muted); margin-top: 6px;">
              ${filtered.length} formulation${filtered.length !== 1 ? 's' : ''} ${f.category !== 'All' ? `in ${f.category}` : ''}
            </p>
          </div>
        </div>

        <!-- Filter bar -->
        <div style="display: flex; align-items: center; border-top: 1px solid var(--color-border); overflow-x: auto;">
          ${allCats.slice(0, 6).map(cat => `
            <button onclick="setShopCategory('${cat}')"
                    style="flex-shrink: 0; padding: 12px 16px; font-size: 13px; font-weight: ${f.category === cat ? '600' : '400'}; color: ${f.category === cat ? 'var(--color-text)' : 'var(--color-text-muted)'}; border-bottom: ${f.category === cat ? '2px solid var(--color-text)' : '2px solid transparent'}; margin-bottom: -1px; white-space: nowrap;">
              ${cat}
            </button>
          `).join('')}

          <div style="flex: 1;"></div>

          <!-- Sort -->
          <div style="position: relative; flex-shrink: 0;">
            <select onchange="setShopSort(this.value)" class="select"
                    style="font-size: 13px; color: var(--color-text-secondary); border: none; border-left: 1px solid var(--color-border); padding: 12px 36px 12px 16px; background: transparent; cursor: pointer; outline: none;">
              <option value="featured" ${f.sortBy === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="rating" ${f.sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
              <option value="reviews" ${f.sortBy === 'reviews' ? 'selected' : ''}>Most Reviews</option>
              <option value="price-asc" ${f.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${f.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
            </select>
          </div>

          <!-- Toggle Filters -->
          <button onclick="toggleShopFilters()"
                  style="display: flex; align-items: center; gap: 6px; padding: 12px 16px; font-size: 13px; color: ${f.showFilterPanel ? 'var(--color-text)' : 'var(--color-text-muted)'}; background: ${f.showFilterPanel ? 'var(--color-bg-subtle)' : 'transparent'}; border-left: 1px solid var(--color-border); white-space: nowrap;">
            ⚙ Filters ${hasFilters ? '•' : ''}
          </button>
        </div>
      </div>
    </div>

    <!-- Expanded filter panel -->
    ${f.showFilterPanel ? `
      <div class="section-border-b" style="background-color: var(--color-bg-subtle);">
        <div class="container" style="padding-top: 20px; padding-bottom: 20px; display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-end;">
          <div style="min-width: 220px;">
            <label class="label">Search keyword</label>
            <input type="text" class="input" placeholder="e.g. ceramic, dielectric..." value="${f.search}" oninput="setShopSearch(this.value)" style="font-size: 13px;">
          </div>
          <div style="min-width: 180px;">
            <label class="label">Max price: $${f.maxPrice}</label>
            <input type="range" min="15" max="70" step="5" value="${f.maxPrice}" oninput="setShopMaxPrice(this.value)" style="width: 100%; accent-color: var(--color-text); cursor: pointer;">
          </div>
          <div>
            <label class="label">Min rating</label>
            <div style="display: flex; gap: 6px;">
              ${[0, 4, 4.5, 4.8].map(r => `
                <button onclick="setShopMinRating(${r})"
                        style="padding: 5px 10px; font-size: 12px; font-weight: ${f.minRating === r ? '600' : '400'}; background: ${f.minRating === r ? 'var(--color-text)' : 'var(--color-bg)'}; color: ${f.minRating === r ? '#fff' : 'var(--color-text-secondary)'}; border: 1px solid ${f.minRating === r ? 'var(--color-text)' : 'var(--color-border)'}; border-radius: var(--radius-sm);">
                  ${r === 0 ? 'Any' : `${r}+ ★`}
                </button>
              `).join('')}
            </div>
          </div>
          <div>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--color-text-secondary);">
              <input type="checkbox" ${f.inStockOnly ? 'checked' : ''} onchange="setShopInStock(this.checked)" style="accent-color: var(--color-text); width: 14px; height: 14px;">
              In stock only
            </label>
          </div>
          ${hasFilters ? `
            <button onclick="resetShopFilters()" style="font-size: 13px; color: var(--color-text-muted); text-decoration: underline; padding-bottom: 2px;">
              Reset filters
            </button>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Product Grid -->
    <div class="container" style="padding-bottom: 96px;">
      ${filtered.length === 0 ? `
        <div style="text-align: center; padding: 80px 20px; border-bottom: 1px solid var(--color-border);">
          <p style="font-size: 16px; color: var(--color-text-secondary); margin-bottom: 16px;">
            No formulations match your filters.
          </p>
          <button class="btn btn-neutral btn-sm" onclick="resetShopFilters()">Clear all filters</button>
        </div>
      ` : `
        <div class="product-grid">
          ${filtered.map(p => renderProductCardHtml(p)).join('')}
        </div>
      `}
    </div>
  `;
}

function setShopCategory(cat) {
  State.shopFilters.category = cat;
  renderCurrentView();
}
function setShopSort(val) {
  State.shopFilters.sortBy = val;
  renderCurrentView();
}
function toggleShopFilters() {
  State.shopFilters.showFilterPanel = !State.shopFilters.showFilterPanel;
  renderCurrentView();
}
function setShopSearch(val) {
  State.shopFilters.search = val;
  renderCurrentView();
}
function setShopMaxPrice(val) {
  State.shopFilters.maxPrice = Number(val);
  renderCurrentView();
}
function setShopMinRating(val) {
  State.shopFilters.minRating = val;
  renderCurrentView();
}
function setShopInStock(val) {
  State.shopFilters.inStockOnly = val;
  renderCurrentView();
}
function resetShopFilters() {
  State.shopFilters = {
    category: 'All',
    search: '',
    maxPrice: 70,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'featured',
    showFilterPanel: false,
  };
  renderCurrentView();
}

// --- PRODUCT DETAIL VIEW (PDP) ---
let pdpQuantity = 1;

function openProductById(id) {
  const p = State.products.find(item => item.id === id);
  if (p) {
    State.selectedProduct = p;
    pdpQuantity = 1;
    State.pdpTab = 'specs';
    navigate('product-detail');
  }
}

function renderProductDetailView(container) {
  const p = State.selectedProduct;
  if (!p) {
    navigate('shop');
    return;
  }

  const isSaved = State.wishlist.some(w => w.id === p.id);

  container.innerHTML = `
    <!-- Breadcrumb -->
    <div class="section-border-b">
      <div class="container" style="padding-top: 16px; padding-bottom: 16px;">
        <nav style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted);">
          <button onclick="navigate('shop')" style="color: var(--color-text-muted); cursor: pointer;">← Products</button>
          <span>/</span>
          <span style="color: var(--color-text-secondary);">${p.category}</span>
          <span>/</span>
          <span style="color: var(--color-text); font-weight: 500;">${p.name}</span>
        </nav>
      </div>
    </div>

    <!-- 2-Col Hero Area -->
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); border-bottom: 1px solid var(--color-border);">
        <!-- LEFT: Gallery -->
        <div style="background-color: var(--color-bg-subtle); display: flex; align-items: center; justify-content: center; min-height: 520px; padding: 48px; border-right: 1px solid var(--color-border);">
          ${renderCanisterHtml(p.color || '#1e3a5f', 280, p.sku ? p.sku.split('-')[1] : '')}
        </div>

        <!-- RIGHT: Info & Actions -->
        <div style="padding: 48px 40px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <span class="section-label" style="margin: 0;">${p.category}</span>
            <span style="font-size: 11px; font-family: var(--font-mono); color: var(--color-text-muted);">${p.sku}</span>
          </div>

          <h1 style="font-size: clamp(24px, 3vw, 36px); font-weight: 600; letter-spacing: -0.02em; color: var(--color-text); line-height: 1.15; margin-bottom: 12px;">
            ${p.name}
          </h1>

          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <span style="color: #f59e0b;">★★★★★</span>
            <span style="font-size: 13px; color: var(--color-text-muted);">${p.rating} · ${p.reviewCount} verified reviews</span>
          </div>

          <div style="height: 1px; background-color: var(--color-border); margin-bottom: 24px;"></div>

          <!-- Price -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 28px; font-weight: 700; letter-spacing: -0.02em; color: var(--color-text);">
              $${Number(p.price).toFixed(2)}
            </div>
            <div style="font-size: 13px; color: var(--color-text-muted); margin-top: 4px;">
              ${p.volume} · ${p.stockCount > 0 ? `${p.stockCount} in stock` : 'Out of stock'}
            </div>
          </div>

          <p style="font-size: 15px; line-height: 1.65; color: var(--color-text-secondary); margin-bottom: 32px;">
            ${p.tagline || p.description}
          </p>

          <!-- Stepper & Add to Cart -->
          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden;">
              <button onclick="changePdpQty(-1)" style="padding: 0 12px; height: 44px; color: var(--color-text-muted); cursor: pointer;">−</button>
              <span id="pdp-qty-display" style="font-size: 14px; font-weight: 600; min-width: 32px; text-align: center; color: var(--color-text);">${pdpQuantity}</span>
              <button onclick="changePdpQty(1)" style="padding: 0 12px; height: 44px; color: var(--color-text-muted); cursor: pointer;">+</button>
            </div>

            <button class="btn btn-inverted" style="flex: 1; height: 44px; font-size: 14px; font-weight: 500;" onclick="addToCartById('${p.id}', pdpQuantity)">
              Add to cart — $<span id="pdp-total-price">${(p.price * pdpQuantity).toFixed(2)}</span>
            </button>

            <button class="btn btn-neutral" style="height: 44px; padding: 0 14px; color: ${isSaved ? 'var(--color-error)' : 'var(--color-text-muted)'};" onclick="toggleWishlistById('${p.id}')">
              ${isSaved ? '♥' : '♡'}
            </button>
          </div>

          <button class="btn btn-neutral btn-full" style="height: 44px; font-size: 14px; font-weight: 500;" onclick="addToCartById('${p.id}', pdpQuantity); navigate('checkout');">
            Buy now
          </button>

          <div style="height: 1px; background-color: var(--color-border); margin: 32px 0;"></div>

          <!-- Trust points -->
          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: var(--color-text-muted);">
            <div>— HazMat certified ground shipping · UN1950 compliant packaging</div>
            <div>— 100% water-bath pressure tested before dispatch</div>
            <div>— 30-day returns on unopened canisters</div>
            <div>— Full SDS documentation included with every order</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabbed Information -->
    <div class="container">
      <div style="display: flex; border-bottom: 1px solid var(--color-border); overflow-x: auto;">
        ${['specs', 'safety', 'usage', 'shipping'].map(tab => `
          <button onclick="setPdpTab('${tab}')"
                  style="padding: 16px 20px; font-size: 14px; font-weight: ${State.pdpTab === tab ? '600' : '400'}; color: ${State.pdpTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)'}; border-bottom: ${State.pdpTab === tab ? '2px solid var(--color-text)' : '2px solid transparent'}; margin-bottom: -1px; cursor: pointer; text-transform: capitalize;">
            ${tab === 'specs' ? 'Specifications' : tab === 'safety' ? 'Safety & SDS' : tab === 'usage' ? 'Usage Guide' : 'Shipping'}
          </button>
        `).join('')}
      </div>

      <div style="padding-top: 48px; padding-bottom: 64px; max-width: 760px;">
        ${State.pdpTab === 'specs' ? `
          <p style="font-size: 16px; line-height: 1.7; color: var(--color-text-secondary); margin-bottom: 32px;">${p.description}</p>
          <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 16px;">Performance characteristics</h3>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px;">
            ${(p.features || []).map(f => `<div style="font-size: 14px; color: var(--color-text-secondary);">— ${f}</div>`).join('')}
          </div>
          ${p.specifications ? `
            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;">
              ${Object.entries(p.specifications).map(([k, v], idx, arr) => `
                <div style="display: grid; grid-template-columns: 180px 1fr; border-bottom: ${idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none'};">
                  <div style="padding: 12px 16px; font-size: 13px; color: var(--color-text-muted); background: var(--color-bg-subtle); border-right: 1px solid var(--color-border);">${k}</div>
                  <div style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: var(--color-text);">${v}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        ` : State.pdpTab === 'safety' ? `
          <div style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-subtle); margin-bottom: 28px; font-size: 14px; color: var(--color-text-secondary);">
            <strong>Important:</strong> Classified as hazardous material UN1950. Handle with appropriate PPE. Store below 50°C (122°F).
          </div>
          <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 28px;">
            ${[
              { label: 'UN HazMat Number', value: p.sds?.unNumber || 'UN1950' },
              { label: 'Chemical CAS', value: p.sds?.casNumber || 'See SDS §3' },
              { label: 'Storage Temp', value: p.sds?.storageTemp || '0°C to 50°C (32°F to 122°F)' },
              { label: 'Required PPE', value: p.sds?.ppe || 'Safety glasses, chemical gloves' },
              { label: 'Propellant System', value: p.propellant },
              { label: 'VOC Rating', value: p.voc || '< 2.0% CARB Compliant' },
            ].map((r, idx, arr) => `
              <div style="display: grid; grid-template-columns: 180px 1fr; border-bottom: ${idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none'};">
                <div style="padding: 12px 16px; font-size: 13px; color: var(--color-text-muted); background: var(--color-bg-subtle); border-right: 1px solid var(--color-border);">${r.label}</div>
                <div style="padding: 12px 16px; font-size: 13px; font-weight: 500; color: var(--color-text);">${r.value}</div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-neutral btn-md" onclick="showToast('Downloaded official SDS documentation.')">
            Download Safety Data Sheet (SDS PDF) ↓
          </button>
        ` : State.pdpTab === 'usage' ? `
          <div style="padding: 14px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 28px; font-size: 14px; background: var(--color-bg-subtle);">
            Optimal spray distance: <strong>${p.optimalDistance || '20–25 cm'}</strong> · Shake vigorously for <strong>60 seconds</strong> before use.
          </div>
          <div style="display: flex; flex-direction: column; gap: 0;">
            ${(p.usageGuide || []).map((step, idx) => `
              <div style="display: flex; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--color-border);">
                <div style="font-size: 12px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-muted); min-width: 24px;">0${idx + 1}</div>
                <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.6;">${step}</p>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 20px; font-size: 15px; color: var(--color-text-secondary); line-height: 1.7;">
            <div>
              <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 6px;">HazMat Ground Freight</h3>
              <p>All aerosol canisters ship as UN1950 Limited Quantity Hazardous Materials via certified ground freight only.</p>
            </div>
            <div style="height: 1px; background-color: var(--color-border);"></div>
            <div>
              <h3 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 6px;">Free Shipping Threshold</h3>
              <p>Orders over $150 qualify for complimentary HazMat ground freight.</p>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

function changePdpQty(delta) {
  pdpQuantity = Math.max(1, pdpQuantity + delta);
  const qtyEl = document.getElementById('pdp-qty-display');
  const priceEl = document.getElementById('pdp-total-price');
  if (qtyEl) qtyEl.textContent = pdpQuantity;
  if (priceEl && State.selectedProduct) {
    priceEl.textContent = (State.selectedProduct.price * pdpQuantity).toFixed(2);
  }
}

function setPdpTab(tab) {
  State.pdpTab = tab;
  renderCurrentView();
}

// --- WISHLIST VIEW ---
function renderWishlistView(container) {
  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 32px;">
        <span class="section-label">Saved</span>
        <h1 class="text-h2">Wishlist (${State.wishlist.length})</h1>
      </div>
    </div>

    <div class="container" style="padding-top: 40px; padding-bottom: 96px;">
      ${State.wishlist.length === 0 ? `
        <div style="text-align: center; padding: 80px 20px; border-bottom: 1px solid var(--color-border);">
          <h2 style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">Nothing saved yet</h2>
          <p style="font-size: 14px; color: var(--color-text-muted); margin-bottom: 24px;">Browse our catalog to save aerosol formulations.</p>
          <button class="btn btn-inverted btn-md" onclick="navigate('shop')">Browse products</button>
        </div>
      ` : `
        <div class="product-grid">
          ${State.wishlist.map(p => renderProductCardHtml(p)).join('')}
        </div>
        <div style="margin-top: 32px; display: flex; justify-content: center; gap: 12px;">
          <button class="btn btn-inverted btn-lg" onclick="addAllWishlistToCart()">Add all to cart</button>
          <button class="btn btn-neutral btn-lg" onclick="navigate('shop')">Continue shopping</button>
        </div>
      `}
    </div>
  `;
}

function addAllWishlistToCart() {
  State.wishlist.forEach(p => {
    addToCartById(p.id, 1, false);
  });
  showToast('Added all wishlist items to cart.');
  saveCart();
}

// --- CHECKOUT VIEW ---
function renderCheckoutView(container) {
  const subtotal = State.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = State.cart.reduce((s, i) => s + i.quantity, 0);

  let volumeDiscount = 0;
  if (totalItems >= 12) volumeDiscount = subtotal * 0.15;
  else if (totalItems >= 6) volumeDiscount = subtotal * 0.08;

  let promoDiscount = 0;
  if (State.appliedCoupon?.discountPercent) {
    promoDiscount = (subtotal * State.appliedCoupon.discountPercent) / 100;
  }

  const discount = volumeDiscount + promoDiscount;
  const shippingCosts = { standard: subtotal >= 150 ? 0 : 14.95, expedited: 32.00, express: 58.00 };
  const shippingCost = shippingCosts[State.checkout.shippingMethod] || 14.95;
  const total = Math.max(0, subtotal - discount + shippingCost);

  if (State.cart.length === 0 && State.checkout.step < 4) {
    container.innerHTML = `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <h2 class="text-h3" style="margin-bottom: 12px;">Your cart is empty</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 24px;">Add products before proceeding to checkout.</p>
        <button class="btn btn-inverted btn-md" onclick="navigate('shop')">Browse catalog</button>
      </div>
    `;
    return;
  }

  // Pre-fill user contact if empty
  if (State.currentUser && !State.checkout.contact.email) {
    State.checkout.contact.name = State.currentUser.name;
    State.checkout.contact.email = State.currentUser.email;
    State.checkout.contact.phone = State.currentUser.phone || '';
    if (State.currentUser.addresses?.[0]) {
      const a = State.currentUser.addresses[0];
      State.checkout.shipping.name = a.name;
      State.checkout.shipping.company = a.company || '';
      State.checkout.shipping.street = a.street;
      State.checkout.shipping.city = a.city;
      State.checkout.shipping.state = a.state;
      State.checkout.shipping.zip = a.zip;
    }
  }

  if (State.checkout.step === 4) {
    // Confirmation
    const order = State.checkout.completedOrder;
    container.innerHTML = `
      <div class="container" style="padding: 80px 20px; max-width: 580px; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--color-success-bg); border: 1px solid #a7f3d0; color: var(--color-success); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 20px;">✓</div>
        <span class="section-label">Order Confirmed</span>
        <h1 class="text-h2" style="margin-bottom: 12px;">${order?.orderNumber || 'DNKL-84920'}</h1>
        <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 32px;">
          Your order has been queued for HazMat ground dispatch with tracking verification.
        </p>

        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; text-align: left; margin-bottom: 32px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--color-text-muted);">Contact:</span>
            <span style="font-weight: 500;">${State.checkout.contact.email}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--color-text-muted);">Destination:</span>
            <span style="font-weight: 500;">${State.checkout.shipping.city}, ${State.checkout.shipping.state}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--color-text-muted);">Method:</span>
            <span style="font-weight: 500;">HazMat Ground Carrier</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--color-border); font-weight: 600;">
            <span>Total Paid:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-inverted btn-md" onclick="navigate('track', { trackingId: '${order?.orderNumber || 'DNKL-84920'}' })">Track shipment</button>
          <button class="btn btn-neutral btn-md" onclick="State.checkout.step = 1; navigate('shop')">Continue shopping</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- Header -->
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 32px;">
        <span class="section-label">Order</span>
        <h1 class="text-h2" style="margin-bottom: 24px;">Checkout</h1>
        <div style="display: flex; gap: 24px; font-size: 13px;">
          <span style="font-weight: ${State.checkout.step === 1 ? '600' : '400'}; color: ${State.checkout.step === 1 ? 'var(--color-text)' : 'var(--color-text-muted)'};">1. Contact</span>
          <span>→</span>
          <span style="font-weight: ${State.checkout.step === 2 ? '600' : '400'}; color: ${State.checkout.step === 2 ? 'var(--color-text)' : 'var(--color-text-muted)'};">2. Shipping</span>
          <span>→</span>
          <span style="font-weight: ${State.checkout.step === 3 ? '600' : '400'}; color: ${State.checkout.step === 3 ? 'var(--color-text)' : 'var(--color-text-muted)'};">3. Payment</span>
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom: 80px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; padding-top: 40px;">
        <!-- Left: Step Form -->
        <div>
          ${State.checkout.step === 1 ? `
            <h2 class="text-h4" style="margin-bottom: 20px;">Contact Information</h2>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label class="label">Full Name</label>
                <input class="input" id="co-name" value="${State.checkout.contact.name}" oninput="State.checkout.contact.name = this.value" placeholder="Jane Smith">
              </div>
              <div>
                <label class="label">Email Address</label>
                <input class="input" type="email" id="co-email" value="${State.checkout.contact.email}" oninput="State.checkout.contact.email = this.value" placeholder="you@company.com">
              </div>
              <div>
                <label class="label">Phone Number</label>
                <input class="input" type="tel" id="co-phone" value="${State.checkout.contact.phone}" oninput="State.checkout.contact.phone = this.value" placeholder="+1 (555) 000-0000">
              </div>
              <button class="btn btn-inverted btn-lg" style="margin-top: 16px;" onclick="advanceCheckoutStep(2)">
                Continue to shipping →
              </button>
            </div>
          ` : State.checkout.step === 2 ? `
            <h2 class="text-h4" style="margin-bottom: 20px;">Shipping Address</h2>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="label">Full Name</label>
                  <input class="input" value="${State.checkout.shipping.name}" oninput="State.checkout.shipping.name = this.value">
                </div>
                <div>
                  <label class="label">Company (Optional)</label>
                  <input class="input" value="${State.checkout.shipping.company}" oninput="State.checkout.shipping.company = this.value">
                </div>
              </div>
              <div>
                <label class="label">Street Address</label>
                <input class="input" value="${State.checkout.shipping.street}" oninput="State.checkout.shipping.street = this.value" placeholder="740 Aerospace Blvd">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 100px 120px; gap: 12px;">
                <div>
                  <label class="label">City</label>
                  <input class="input" value="${State.checkout.shipping.city}" oninput="State.checkout.shipping.city = this.value">
                </div>
                <div>
                  <label class="label">State</label>
                  <input class="input" value="${State.checkout.shipping.state}" oninput="State.checkout.shipping.state = this.value" maxlength="2">
                </div>
                <div>
                  <label class="label">ZIP Code</label>
                  <input class="input" value="${State.checkout.shipping.zip}" oninput="State.checkout.shipping.zip = this.value">
                </div>
              </div>

              <!-- Shipping Method Selection -->
              <div style="margin-top: 12px;">
                <label class="label" style="margin-bottom: 10px;">HazMat Shipping Method</label>
                ${[
                  { id: 'standard', name: 'HazMat Ground Freight', time: '3–5 business days', cost: shippingCosts.standard },
                  { id: 'expedited', name: 'Expedited HazMat Ground', time: '1–2 business days', cost: shippingCosts.expedited },
                  { id: 'express', name: 'Emergency Priority Dispatch', time: 'Next business day', cost: shippingCosts.express },
                ].map(m => `
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid ${State.checkout.shippingMethod === m.id ? 'var(--color-text)' : 'var(--color-border)'}; border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; background: ${State.checkout.shippingMethod === m.id ? 'var(--color-bg-subtle)' : 'var(--color-bg)'};">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <input type="radio" name="shippingMethod" ${State.checkout.shippingMethod === m.id ? 'checked' : ''} onchange="State.checkout.shippingMethod = '${m.id}'; renderCurrentView();" style="accent-color: var(--color-text);">
                      <div>
                        <div style="font-size: 14px; font-weight: 500;">${m.name}</div>
                        <div style="font-size: 12px; color: var(--color-text-muted);">${m.time}</div>
                      </div>
                    </div>
                    <div style="font-size: 14px; font-weight: 600;">${m.cost === 0 ? 'Free' : `$${m.cost.toFixed(2)}`}</div>
                  </label>
                `).join('')}
              </div>

              <div style="display: flex; gap: 10px; margin-top: 16px;">
                <button class="btn btn-neutral btn-lg" onclick="advanceCheckoutStep(1)">Back</button>
                <button class="btn btn-inverted btn-lg" style="flex: 1;" onclick="advanceCheckoutStep(3)">Continue to payment →</button>
              </div>
            </div>
          ` : `
            <h2 class="text-h4" style="margin-bottom: 12px;">Payment Details</h2>
            <div style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 20px;">🔒 256-bit encrypted SSL checkout</div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label class="label">Card Number</label>
                <input class="input" placeholder="4242 •••• •••• 4242" value="${State.checkout.payment.cardNumber}" oninput="State.checkout.payment.cardNumber = this.value">
              </div>
              <div>
                <label class="label">Name on Card</label>
                <input class="input" placeholder="JANE SMITH" value="${State.checkout.payment.name}" oninput="State.checkout.payment.name = this.value">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                  <label class="label">Expiry</label>
                  <input class="input" placeholder="MM / YY" value="${State.checkout.payment.expiry}" oninput="State.checkout.payment.expiry = this.value">
                </div>
                <div>
                  <label class="label">CVV</label>
                  <input class="input" placeholder="•••" maxlength="4" value="${State.checkout.payment.cvv}" oninput="State.checkout.payment.cvv = this.value">
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin-top: 16px;">
                <button class="btn btn-neutral btn-lg" onclick="advanceCheckoutStep(2)">Back</button>
                <button class="btn btn-inverted btn-lg" style="flex: 1;" onclick="executePlaceOrder()">
                  Place Order — $${total.toFixed(2)}
                </button>
              </div>
            </div>
          `}
        </div>

        <!-- Right: Order Summary Box -->
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 28px; background: var(--color-bg); align-self: flex-start;">
          <span class="section-label">Summary</span>
          <div style="margin-bottom: 20px;">
            ${State.cart.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border); font-size: 14px;">
                <div>
                  <div style="font-weight: 500;">${item.name}</div>
                  <div style="font-size: 12px; color: var(--color-text-muted);">Qty ${item.quantity} · ${item.volume}</div>
                </div>
                <div style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
              <span>Subtotal</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: var(--color-success);">
                <span>Discounts</span>
                <span>−$${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
              <span>HazMat Shipping</span>
              <span>${shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; color: var(--color-text); padding-top: 12px; border-top: 1px solid var(--color-border);">
              <span>Total</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function advanceCheckoutStep(step) {
  State.checkout.step = step;
  renderCurrentView();
}

async function executePlaceOrder() {
  const orderNum = 'DNKL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const completed = {
    orderNumber: orderNum,
    createdAt: new Date().toISOString(),
    status: 'Processing',
    items: [...State.cart],
    total: State.cart.reduce((s, i) => s + i.price * i.quantity, 0),
  };

  State.checkout.completedOrder = completed;
  State.checkout.step = 4;
  State.cart = [];
  State.appliedCoupon = null;
  saveCart();
  showToast(`Order ${orderNum} created successfully!`);
  renderCurrentView();
}

// --- ORDER TRACKING VIEW ---
function renderTrackView(container) {
  if (State.viewParams.trackingId) {
    State.trackingId = State.viewParams.trackingId;
    State.viewParams.trackingId = null;
  }

  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
        <span class="section-label">Shipments</span>
        <h1 class="text-h2">Track your shipment</h1>
        <p style="font-size: 16px; color: var(--color-text-secondary); margin-top: 10px;">
          Enter your DINKAL order or tracking ID for real-time HazMat carrier telemetry.
        </p>
      </div>
    </div>

    <div class="container" style="padding-top: 48px; padding-bottom: 96px; max-width: 760px;">
      <form onsubmit="handleTrackingSearch(event)" style="display: flex; gap: 10px; margin-bottom: 40px;">
        <input class="input input-lg" id="track-input" placeholder="e.g. DNKL-84920 or AERO-99420" value="${State.trackingId}" style="font-family: var(--font-mono);">
        <button type="submit" class="btn btn-inverted btn-lg">Track order →</button>
      </form>

      ${State.trackingResult ? `
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 32px; background: var(--color-bg);">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; flex-wrap: wrap;">
            <div>
              <span class="section-label">Shipment</span>
              <div style="font-size: 22px; font-weight: 700; font-family: var(--font-mono);">${State.trackingResult.orderNumber || State.trackingId}</div>
            </div>
            <div style="padding: 4px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; background: var(--color-bg-subtle);">
              ${State.trackingResult.status}
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin: 32px 0; font-size: 12px;">
            ${['Order Placed', 'Processing', 'HazMat Dispatched', 'In Transit', 'Delivered'].map((st, i) => `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <div style="width: 14px; height: 14px; border-radius: 50%; background: ${i <= 3 ? 'var(--color-text)' : 'var(--color-border)'};"></div>
                <span style="color: ${i <= 3 ? 'var(--color-text)' : 'var(--color-text-muted)'}; font-weight: ${i === 3 ? '600' : '400'};">${st}</span>
              </div>
            `).join('')}
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: 20px; font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
            <div><strong>Carrier:</strong> UPS HazMat Freight Direct (DOT-SP Certified)</div>
            <div><strong>Last Checkpoint:</strong> Salt Lake City Hub — In transit to final sorting facility</div>
            <div><strong>Estimated Delivery:</strong> 2 business days (Signature Required)</div>
          </div>
        </div>
      ` : `
        <p style="font-size: 13px; color: var(--color-text-muted);">
          Tip: Order numbers follow format <code>DNKL-XXXXXX</code> or <code>AERO-XXXXX</code>.
        </p>
      `}
    </div>
  `;
}

function handleTrackingSearch(e) {
  e.preventDefault();
  const val = document.getElementById('track-input')?.value.trim();
  if (!val) return;
  State.trackingId = val;
  State.trackingResult = {
    orderNumber: val.toUpperCase(),
    status: 'In Transit',
  };
  renderCurrentView();
}

// --- ACCOUNT PORTAL VIEW ---
function renderAccountView(container) {
  if (!State.currentUser) {
    container.innerHTML = `
      <div class="container" style="padding: 80px 20px; text-align: center;">
        <h2 class="text-h3" style="margin-bottom: 12px;">Account Portal</h2>
        <p style="color: var(--color-text-muted); margin-bottom: 24px;">Please sign in to access orders and profile details.</p>
        <button class="btn btn-inverted btn-md" onclick="openAuthModal()">Sign in</button>
      </div>
    `;
    return;
  }

  const u = State.currentUser;

  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 0;">
        <span class="section-label">Account</span>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 class="text-h2">${u.name}</h1>
            <p style="font-size: 14px; color: var(--color-text-muted); margin-top: 4px;">
              ${u.email} ${u.tier ? `· <span style="font-weight: 600; color: var(--color-text);">${u.tier}</span>` : ''}
            </p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="logoutUser()">Sign out</button>
        </div>

        <div style="display: flex; border-top: 1px solid var(--color-border); margin-top: 32px;">
          ${['orders', 'wishlist', 'addresses', 'profile'].map(tab => `
            <button onclick="setAccountTab('${tab}')"
                    style="padding: 14px 20px; font-size: 14px; font-weight: ${State.accountTab === tab ? '600' : '400'}; color: ${State.accountTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)'}; border-bottom: ${State.accountTab === tab ? '2px solid var(--color-text)' : '2px solid transparent'}; margin-bottom: -1px; cursor: pointer; text-transform: capitalize;">
              ${tab}
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="container" style="padding-top: 40px; padding-bottom: 80px;">
      ${State.accountTab === 'orders' ? `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${[
            { id: 'DNKL-99420', date: 'Aug 28, 2026', total: 1000.51, status: 'In Transit', items: 'CERAMAX™ 9H (12x), TRIBO-SYNTH™ (24x)' },
            { id: 'DNKL-99419', date: 'Aug 25, 2026', total: 228.57, status: 'Delivered', items: 'SPECTRUM-X™ Prism-Shift (4x), MARINEX™ (2x)' },
          ].map(ord => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="font-weight: 700; font-family: var(--font-mono); font-size: 14px;">${ord.id}</div>
                <div style="font-size: 12px; color: var(--color-text-muted);">${ord.date} · ${ord.items}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-weight: 600; font-size: 15px;">$${ord.total.toFixed(2)}</span>
                <span style="padding: 3px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;">${ord.status}</span>
                <button class="btn btn-neutral btn-sm" onclick="navigate('track', { trackingId: '${ord.id}' })">Track →</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : State.accountTab === 'wishlist' ? `
        <div class="product-grid">
          ${State.wishlist.map(p => renderProductCardHtml(p)).join('')}
        </div>
      ` : State.accountTab === 'addresses' ? `
        <div style="max-width: 500px; display: flex; flex-direction: column; gap: 16px;">
          <div style="border: 1px solid var(--color-text); border-radius: var(--radius-md); padding: 20px;">
            <span class="section-label">Primary Hangar / Delivery</span>
            <div style="font-weight: 600;">${u.name}</div>
            <div style="font-size: 14px; color: var(--color-text-secondary); margin-top: 4px;">
              ${u.company || ''}<br>
              740 Aerospace Blvd, Hangar 4B<br>
              Seattle, WA 98108
            </div>
          </div>
        </div>
      ` : `
        <div style="max-width: 480px; display: flex; flex-direction: column; gap: 16px;">
          <div><label class="label">Full Name</label><input class="input" value="${u.name}"></div>
          <div><label class="label">Email Address</label><input class="input" value="${u.email}"></div>
          <div><label class="label">Company</label><input class="input" value="${u.company || ''}"></div>
          <button class="btn btn-inverted btn-md" onclick="showToast('Profile updated.')">Save Changes</button>
        </div>
      `}
    </div>
  `;
}

function setAccountTab(tab) {
  State.accountTab = tab;
  renderCurrentView();
}

// --- ABOUT VIEW ---
function renderAboutView(container) {
  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 0;">
        <span class="section-label">Company</span>
        <h1 class="text-display" style="max-width: 720px; margin-bottom: 24px;">
          Engineering precision aerosols since 2011.
        </h1>
        <p class="text-large" style="max-width: 560px; margin-bottom: 64px;">
          DINKAL Aerosol Technologies develops professional-grade formulations for aerospace, automotive, electronics, and medical applications.
        </p>

        <!-- Stats Strip -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); border-top: 1px solid var(--color-border); border-left: 1px solid var(--color-border);">
          ${[
            { stat: '2.4M+', label: 'Canisters shipped annually' },
            { stat: '36', label: 'Countries served' },
            { stat: '28', label: 'Active formulations' },
            { stat: 'ISO', label: '9001:2015 certified' },
          ].map(s => `
            <div style="border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); padding: 32px;">
              <div style="font-size: 32px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 4px;">${s.stat}</div>
              <div style="font-size: 13px; color: var(--color-text-muted);">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Mission & Leadership -->
    <div class="container" style="padding-top: 80px; padding-bottom: 80px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 64px;">
        <div>
          <span class="section-label">Mission</span>
          <h2 class="text-h2" style="margin-bottom: 16px;">Formulated for extreme conditions.</h2>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.7;">
            From carbon-fibre winglets to medical sterilization chambers, our aerosols deliver exact micronic atomization with zero solvent sputter and GWP &lt; 1 eco-propellants.
          </p>
        </div>
        <div>
          <span class="section-label">History</span>
          <div style="display: flex; flex-direction: column; gap: 16px; font-size: 14px;">
            <div><strong>2011</strong> — Founded in Seattle with high-temp industrial lubricants.</div>
            <div><strong>2017</strong> — Invented 360° all-angle inverted dual-port valve.</div>
            <div><strong>2024</strong> — Full transition to Eco-HFO 1234ze propellants worldwide.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- CONTACT VIEW ---
function renderContactView(container) {
  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
        <span class="section-label">Contact</span>
        <h1 class="text-h2">Get in touch</h1>
        <p class="text-large" style="max-width: 480px; margin-top: 12px;">
          Our aerosol formulation chemists and technical team are available to assist with custom blends and orders.
        </p>
      </div>
    </div>

    <div class="container" style="padding-bottom: 96px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 64px; padding-top: 48px;">
        <div>
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div>
              <span class="section-label">Headquarters</span>
              <div style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.6;">
                1200 Industrial Blvd, Suite 500<br>Seattle, WA 98108, United States
              </div>
            </div>
            <div>
              <span class="section-label">Direct Lines</span>
              <div style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.6;">
                Sales: +1 (888) 346-5255<br>
                24/7 HazMat Hotline: +1 (888) 346-5258
              </div>
            </div>
          </div>
        </div>

        <div>
          <form onsubmit="handleContactSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
            <div><label class="label">Full Name *</label><input required class="input" placeholder="Jane Smith"></div>
            <div><label class="label">Email Address *</label><input required type="email" class="input" placeholder="you@company.com"></div>
            <div>
              <label class="label">Subject</label>
              <select class="input select">
                <option>Custom Formulation Inquiry</option>
                <option>Wholesale & Pallet Pricing</option>
                <option>Technical Safety & SDS Support</option>
              </select>
            </div>
            <div>
              <label class="label">Message *</label>
              <textarea required class="input" rows="4" placeholder="Describe your aerosol application..."></textarea>
            </div>
            <button type="submit" class="btn btn-inverted btn-lg">Send message →</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

function handleContactSubmit(e) {
  e.preventDefault();
  showToast('Thank you! Our technical team will follow up within 24 hours.');
  e.target.reset();
}

// --- FAQ VIEW ---
function renderFaqView(container) {
  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 40px;">
        <span class="section-label">Help Center</span>
        <h1 class="text-h2">Frequently asked questions</h1>
        <p class="text-large" style="max-width: 520px; margin-top: 10px;">
          Technical specifications, storage rules, and DOT UN1950 shipping regulations.
        </p>
      </div>
    </div>

    <div class="container" style="padding-top: 48px; padding-bottom: 96px; max-width: 800px;">
      ${[
        { q: 'What propellant system do DINKAL aerosols use?', a: 'All DINKAL products utilize Eco-HFO 1234ze or purified nitrogen with GWP < 1, compliant with CARB 2026 and EU F-Gas regulations.' },
        { q: 'Can the canisters spray fully inverted?', a: 'Yes. Formulations designated with 360° All-Angle technology feature dual-port dip tubes that provide uniform 12-micron atomization at any angle.' },
        { q: 'Why is air freight not offered?', a: 'Under DOT 49 CFR and IATA DGR, pressurized canisters are classified UN1950 and must travel via certified ground HazMat carriers.' },
        { q: 'What storage temperatures are required?', a: 'Store all canisters between 0°C and 50°C (32°F to 122°F). Keep away from open flames and direct radiant heat.' },
      ].map((faq, idx) => `
        <div style="border-bottom: 1px solid var(--color-border); padding: 20px 0;">
          <div style="font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 8px;">${faq.q}</div>
          <p style="font-size: 15px; color: var(--color-text-secondary); line-height: 1.65;">${faq.a}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// --- ADMIN VIEW ---
function renderAdminView(container) {
  container.innerHTML = `
    <div class="section-border-b">
      <div class="container" style="padding-top: 40px; padding-bottom: 32px;">
        <span class="section-label">Operations Control</span>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 class="text-h2">Admin Dashboard</h1>
            <p style="font-size: 14px; color: var(--color-text-muted); margin-top: 4px;">Cleanroom Fill Line & HazMat Dispatch Telemetry</p>
          </div>
          <button class="btn btn-neutral btn-sm" onclick="navigate('home')">Back to Storefront</button>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top: 32px; padding-bottom: 80px;">
      <!-- KPI Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
        ${[
          { label: '30-Day Revenue', val: '$148,920.00' },
          { label: 'Active Canister Orders', val: '42 Orders' },
          { label: 'Cleanroom Pressurization', val: '99.8% Normal' },
          { label: 'Inventory Total', val: '1,420 Units' },
        ].map(k => `
          <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 20px; background: var(--color-bg);">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--color-text-muted);">${k.label}</div>
            <div style="font-size: 22px; font-weight: 700; color: var(--color-text); margin-top: 6px;">${k.val}</div>
          </div>
        `).join('')}
      </div>

      <!-- Live Orders Table -->
      <span class="section-label">Recent HazMat Shipments</span>
      <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow-x: auto; background: var(--color-bg);">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: var(--color-bg-subtle); border-bottom: 1px solid var(--color-border);">
              <th style="padding: 12px 16px;">Order ID</th>
              <th style="padding: 12px 16px;">Customer</th>
              <th style="padding: 12px 16px;">Items</th>
              <th style="padding: 12px 16px;">Total</th>
              <th style="padding: 12px 16px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { id: 'DNKL-99420', cust: 'Dr. Marcus Sterling (NovaAero)', items: '36 Units', total: '$1,000.51', st: 'In Transit' },
              { id: 'DNKL-99419', cust: 'Elena Rostova (HyperSonic)', items: '6 Units', total: '$228.57', st: 'Delivered' },
              { id: 'DNKL-99418', cust: 'Apex BioTech Cleanrooms', items: '12 Units', total: '$539.88', st: 'Processing' },
            ].map(row => `
              <tr style="border-bottom: 1px solid var(--color-border);">
                <td style="padding: 12px 16px; font-family: var(--font-mono); font-weight: 600;">${row.id}</td>
                <td style="padding: 12px 16px;">${row.cust}</td>
                <td style="padding: 12px 16px;">${row.items}</td>
                <td style="padding: 12px 16px; font-weight: 600;">${row.total}</td>
                <td style="padding: 12px 16px;"><span style="padding: 2px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 11px; font-weight: 600;">${row.st}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 7. CART DRAWER CONTROLLER
// --------------------------------------------------------------------------
function toggleCart(open) {
  State.isCartOpen = (open !== undefined) ? open : !State.isCartOpen;
  const drawerEl = document.getElementById('cart-drawer-container');
  if (!drawerEl) return;

  if (State.isCartOpen) {
    renderCartDrawer();
    drawerEl.style.display = 'block';
    document.body.style.overflow = 'hidden';
  } else {
    drawerEl.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-content');
  if (!container) return;

  const subtotal = State.cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = State.cart.reduce((s, i) => s + i.quantity, 0);

  let volumeDiscount = 0;
  if (totalItems >= 12) volumeDiscount = subtotal * 0.15;
  else if (totalItems >= 6) volumeDiscount = subtotal * 0.08;

  let promoDiscount = 0;
  if (State.appliedCoupon?.discountPercent) {
    promoDiscount = (subtotal * State.appliedCoupon.discountPercent) / 100;
  }

  const totalDiscount = volumeDiscount + promoDiscount;
  const isFreeShipping = subtotal >= 150 || State.appliedCoupon?.freeShipping;
  const shipping = isFreeShipping ? 0 : (subtotal > 0 ? 14.95 : 0);
  const total = Math.max(0, subtotal - totalDiscount + shipping);
  const progress = Math.min((subtotal / 150) * 100, 100);

  container.innerHTML = `
    <!-- Header -->
    <div class="drawer-header">
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-size: 16px; font-weight: 600; color: var(--color-text);">Your Cart</span>
        <span style="font-size: 13px; color: var(--color-text-muted);">(${totalItems} items)</span>
      </div>
      <button onclick="toggleCart(false)" class="btn btn-ghost btn-sm" style="font-size: 18px;">✕</button>
    </div>

    <!-- Body -->
    <div class="drawer-body">
      ${State.cart.length === 0 ? `
        <div style="text-align: center; padding: 64px 24px;">
          <div style="font-size: 15px; font-weight: 500; margin-bottom: 8px;">Your cart is empty</div>
          <p style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 24px;">Add aerosol formulations to get started.</p>
          <button class="btn btn-neutral btn-sm" onclick="toggleCart(false); navigate('shop');">Continue shopping</button>
        </div>
      ` : `
        <!-- Free Shipping Meter -->
        <div style="padding: 14px 24px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-subtle);">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span>${isFreeShipping ? '✓ Free HazMat Shipping Applied' : `Free Shipping over $150 ($${(150 - subtotal).toFixed(2)} away)`}</span>
          </div>
          <div style="height: 3px; background: var(--color-border); border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: ${progress}%; background: var(--color-text); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Items -->
        <div>
          ${State.cart.map(item => `
            <div style="display: flex; gap: 16px; padding: 18px 24px; border-bottom: 1px solid var(--color-border);">
              <div style="width: 48px; height: 64px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="width: 16px; height: 40px; background: ${item.color || '#1e3a5f'}; border-radius: 2px;"></div>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">${item.volume || ''}</div>
                <div style="font-size: 14px; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                  <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                    <button onclick="updateCartQty('${item.id}', ${item.quantity - 1})" style="padding: 2px 8px; color: var(--color-text-muted); cursor: pointer;">−</button>
                    <span style="font-size: 12px; font-weight: 600; min-width: 24px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateCartQty('${item.id}', ${item.quantity + 1})" style="padding: 2px 8px; color: var(--color-text-muted); cursor: pointer;">+</button>
                  </div>
                  <span style="font-size: 14px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button onclick="removeCartItem('${item.id}')" style="color: var(--color-text-placeholder); cursor: pointer; align-self: flex-start;">✕</button>
            </div>
          `).join('')}
        </div>

        <!-- Promo Code Input -->
        <div style="padding: 18px 24px; border-bottom: 1px solid var(--color-border);">
          ${State.appliedCoupon ? `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--color-success);">
              <span>Coupon: <strong>${State.appliedCoupon.code}</strong> (${State.appliedCoupon.desc})</span>
              <button onclick="State.appliedCoupon = null; renderCartDrawer();" style="color: var(--color-text-muted); cursor: pointer;">✕</button>
            </div>
          ` : `
            <div style="display: flex; gap: 8px;">
              <input id="coupon-code-input" class="input" placeholder="Promo code (e.g. AEROVOX10)" style="font-size: 12px;">
              <button class="btn btn-neutral btn-sm" onclick="applyPromoCode()">Apply</button>
            </div>
          `}
        </div>
      `}
    </div>

    <!-- Footer -->
    ${State.cart.length > 0 ? `
      <div class="drawer-footer">
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 14px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          ${totalDiscount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: var(--color-success);">
              <span>Discount</span>
              <span>−$${totalDiscount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; color: var(--color-text-muted);">
            <span>Shipping</span>
            <span>${isFreeShipping ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 15px; padding-top: 10px; border-top: 1px solid var(--color-border);">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>

        <button class="btn btn-inverted btn-lg btn-full" onclick="toggleCart(false); navigate('checkout');">
          Checkout →
        </button>
      </div>
    ` : ''}
  `;
}

function addToCartById(id, qty = 1, showFeedback = true) {
  const p = State.products.find(item => item.id === id);
  if (!p) return;

  const existing = State.cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += qty;
  } else {
    State.cart.push({
      id: p.id,
      name: p.name,
      sku: p.sku || 'AERO-SKU',
      price: p.price,
      quantity: qty,
      volume: p.volume || '',
      color: p.color || '#1e3a5f',
    });
  }

  saveCart();
  if (showFeedback) {
    showToast(`Added ${qty}x "${p.name}" to cart.`);
  }
}

function updateCartQty(id, newQty) {
  if (newQty <= 0) {
    removeCartItem(id);
    return;
  }
  const item = State.cart.find(i => i.id === id);
  if (item) {
    item.quantity = newQty;
    saveCart();
  }
}

function removeCartItem(id) {
  State.cart = State.cart.filter(i => i.id !== id);
  saveCart();
}

function applyPromoCode() {
  const input = document.getElementById('coupon-code-input');
  if (!input || !input.value.trim()) return;
  const code = input.value.trim().toUpperCase();

  if (code === 'AEROVOX10') {
    State.appliedCoupon = { code, discountPercent: 10, desc: '10% off' };
    showToast('10% coupon applied.');
  } else if (code === 'BULK20') {
    State.appliedCoupon = { code, discountPercent: 20, desc: '20% off' };
    showToast('20% volume coupon applied.');
  } else if (code === 'HAZMATFREE') {
    State.appliedCoupon = { code, freeShipping: true, desc: 'Free HazMat shipping' };
    showToast('Free shipping applied.');
  } else {
    showToast('Invalid coupon code.');
  }
  renderCartDrawer();
}

function toggleWishlistById(id) {
  const p = State.products.find(item => item.id === id);
  if (!p) return;

  const idx = State.wishlist.findIndex(w => w.id === id);
  if (idx >= 0) {
    State.wishlist.splice(idx, 1);
    showToast(`Removed "${p.name}" from wishlist.`);
  } else {
    State.wishlist.push(p);
    showToast(`Saved "${p.name}" to wishlist.`);
  }
  saveWishlist();
  renderCurrentView();
}

// --------------------------------------------------------------------------
// 8. SEARCH MODAL CONTROLLER
// --------------------------------------------------------------------------
function toggleSearch(open) {
  State.isSearchOpen = (open !== undefined) ? open : !State.isSearchOpen;
  const modalEl = document.getElementById('search-modal-container');
  if (!modalEl) return;

  if (State.isSearchOpen) {
    modalEl.style.display = 'block';
    renderSearchModal();
    setTimeout(() => {
      document.getElementById('search-modal-input')?.focus();
    }, 50);
  } else {
    modalEl.style.display = 'none';
  }
}

function renderSearchModal(query = '') {
  const container = document.getElementById('search-modal-content');
  if (!container) return;

  const results = query.trim()
    ? State.products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  container.innerHTML = `
    <div class="search-drop-modal">
      <div class="container" style="display: flex; align-items: center; height: 64px; gap: 12px;">
        <span style="color: var(--color-text-muted); font-size: 18px;">🔍</span>
        <input id="search-modal-input" type="text" placeholder="Search aerosol formulations, SKUs, categories..."
               value="${query}" oninput="renderSearchModal(this.value)"
               style="flex: 1; font-size: 16px; border: none; outline: none; background: none; font-family: var(--font-family);">
        <button onclick="toggleSearch(false)" class="btn btn-ghost btn-sm" style="font-size: 16px;">✕</button>
      </div>

      <div class="section-border-t"></div>

      <div class="container" style="padding-top: 16px; padding-bottom: 24px;">
        ${results.length > 0 ? `
          <span class="section-label">${results.length} results</span>
          <div style="display: flex; flex-direction: column;">
            ${results.map(p => `
              <div onclick="toggleSearch(false); openProductById('${p.id}')"
                   style="display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--color-border); cursor: pointer;">
                <div style="width: 36px; height: 48px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--color-text-muted);">
                  ${p.sku ? p.sku.split('-')[1] : ''}
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted);">${p.category}</div>
                  <div style="font-size: 14px; font-weight: 500;">${p.name}</div>
                </div>
                <div style="font-weight: 600; font-size: 14px;">$${p.price?.toFixed(2)}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <span class="section-label">Popular Searches</span>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${['Ceramic Clear Coat', 'Dielectric Cleaner', 'Thermal Enamel', 'Hospital Fogger'].map(tag => `
              <button onclick="renderSearchModal('${tag}')"
                      style="padding: 6px 14px; font-size: 13px; color: var(--color-text-secondary); background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-full); cursor: pointer;">
                ${tag}
              </button>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 9. AUTH MODAL CONTROLLER
// --------------------------------------------------------------------------
function openAuthModal(mode = 'signin') {
  State.authMode = mode;
  State.isAuthOpen = true;
  const container = document.getElementById('auth-modal-container');
  if (!container) return;
  renderAuthModal();
  container.style.display = 'flex';
}

function closeAuthModal() {
  State.isAuthOpen = false;
  const container = document.getElementById('auth-modal-container');
  if (container) container.style.display = 'none';
}

function renderAuthModal() {
  const container = document.getElementById('auth-modal-content');
  if (!container) return;

  const mode = State.authMode;

  container.innerHTML = `
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border);">
        <span style="font-size: 15px; font-weight: 600;">${mode === 'signin' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}</span>
        <button onclick="closeAuthModal()" class="btn btn-ghost btn-sm" style="font-size: 16px;">✕</button>
      </div>

      <div style="padding: 24px;">
        <form onsubmit="handleAuthSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
          ${mode === 'register' ? `
            <div>
              <label class="label">Full Name</label>
              <input required class="input" id="auth-name" placeholder="Jane Smith">
            </div>
          ` : ''}
          <div>
            <label class="label">Email Address</label>
            <input required type="email" class="input" id="auth-email" placeholder="you@company.com">
          </div>
          ${mode !== 'reset' ? `
            <div>
              <label class="label">Password</label>
              <input required type="password" class="input" id="auth-password" placeholder="••••••••">
            </div>
          ` : ''}

          <button type="submit" class="btn btn-inverted btn-lg btn-full" style="margin-top: 8px;">
            ${mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0 16px;">
          <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
          <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">One-Click Demo Profiles</span>
          <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[
            { label: 'B2B Enterprise Gold', name: 'Dr. Marcus Sterling', email: 'm.sterling@novaaero.com', role: 'customer_b2b', tier: 'B2B Enterprise Gold', comp: 'NovaAero Dynamics' },
            { label: 'Retail Customer', name: 'Alex Rivera', email: 'alex.rivera@gmail.com', role: 'customer', tier: 'Standard Member', comp: '' },
            { label: 'Admin Portal', name: 'DINKAL Operations Admin', email: 'admin@dinkal.com', role: 'admin', tier: 'Super Admin', comp: 'DINKAL Global' },
          ].map(d => `
            <button onclick="loginDemoProfile('${d.email}', '${d.name}', '${d.role}', '${d.tier}', '${d.comp}')"
                    class="btn btn-neutral btn-sm" style="justify-content: flex-start; padding: 8px 12px; text-align: left;">
              <div>
                <div style="font-size: 12px; font-weight: 600;">${d.label}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">${d.email}</div>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email')?.value;
  const name = document.getElementById('auth-name')?.value || 'Valued Customer';
  loginDemoProfile(email, name, 'customer', 'Standard Member', '');
}

function loginDemoProfile(email, name, role, tier, comp) {
  State.currentUser = {
    id: 'usr-' + Math.random().toString(36).substring(2, 8),
    name,
    email,
    role,
    tier,
    company: comp,
    addresses: [
      {
        id: 'addr-1',
        isDefault: true,
        type: 'Commercial Hangar',
        name,
        company: comp,
        street: '740 Aerospace Blvd, Hangar 4B',
        city: 'Seattle',
        state: 'WA',
        zip: '98108',
      }
    ]
  };
  saveUser();
  closeAuthModal();
  updateHeaderCounts();
  showToast(`Signed in as ${name}`);
  renderCurrentView();
}

function logoutUser() {
  State.currentUser = null;
  localStorage.removeItem('dinkal_user');
  updateHeaderCounts();
  showToast('Signed out.');
  navigate('home');
}

// --------------------------------------------------------------------------
// 10. HEADER & APP INITIALIZATION
// --------------------------------------------------------------------------
function updateHeaderCounts() {
  const cartBadge = document.getElementById('header-cart-count');
  const wishBadge = document.getElementById('header-wishlist-count');
  const userBtn = document.getElementById('header-user-btn');

  const totalCart = State.cart.reduce((s, i) => s + i.quantity, 0);
  if (cartBadge) {
    cartBadge.textContent = totalCart > 0 ? totalCart : '';
    cartBadge.style.display = totalCart > 0 ? 'flex' : 'none';
  }
  if (wishBadge) {
    wishBadge.textContent = State.wishlist.length > 0 ? State.wishlist.length : '';
    wishBadge.style.display = State.wishlist.length > 0 ? 'flex' : 'none';
  }
  if (userBtn) {
    userBtn.title = State.currentUser ? `Signed in as ${State.currentUser.name}` : 'Sign in';
  }
}

// Window scroll listener for sticky header styling
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
}, { passive: true });

// Keyboard shortcut: Cmd+K / Ctrl+K for search
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch(true);
  }
  if (e.key === 'Escape') {
    toggleSearch(false);
    toggleCart(false);
    closeAuthModal();
  }
});

// Mobile menu toggle
function toggleMobileMenu(open) {
  const m = document.getElementById('mobile-menu-drawer');
  if (m) m.style.display = (open !== undefined) ? (open ? 'block' : 'none') : (m.style.display === 'block' ? 'none' : 'block');
}

// App Bootstrap
async function initApp() {
  try {
    const res = await Api.getProducts();
    if (res.success && Array.isArray(res.data)) {
      State.products = res.data;
    }
  } catch (err) {
    console.error('Failed to load live catalog, using embedded products:', err);
  }

  updateHeaderCounts();
  navigate('home');
}

document.addEventListener('DOMContentLoaded', initApp);
