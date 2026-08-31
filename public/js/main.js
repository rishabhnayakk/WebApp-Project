const AerosolWebapp = {
  cart: JSON.parse(localStorage.getItem('aerosol_cart') || localStorage.getItem('dinkal_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('aerosol_wishlist') || localStorage.getItem('dinkal_wishlist') || '[]'),
  user: JSON.parse(localStorage.getItem('aerosol_user') || localStorage.getItem('dinkal_user') || 'null'),
  appliedCoupon: null,

  init() {
    // Default to null user if not logged in
    this.user = JSON.parse(localStorage.getItem('aerosol_user') || 'null');

    if (this.cart.length === 0) {
      this.cart = [
        {
          id: 'aero-ceramax-pro',
          name: 'CERAMAX™ 9H Nano-Ceramic Clear Coat',
          sku: 'AERO-CRM-500',
          price: 49.99,
          quantity: 2,
          volume: '500ml (16.9 fl oz)',
          color: '#0284c7'
        }
      ];
      this.saveCart();
    }

    this.updateHeaderBadges();
    this.setupGlobalEvents();
  },

  saveCart() {
    localStorage.setItem('aerosol_cart', JSON.stringify(this.cart));
    localStorage.setItem('dinkal_cart', JSON.stringify(this.cart));
    this.updateHeaderBadges();
    this.renderCartDrawer();
  },

  saveWishlist() {
    localStorage.setItem('aerosol_wishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('dinkal_wishlist', JSON.stringify(this.wishlist));
    this.updateHeaderBadges();
  },

  saveUser() {
    localStorage.setItem('aerosol_user', JSON.stringify(this.user));
    localStorage.setItem('dinkal_user', JSON.stringify(this.user));
  },

  updateHeaderBadges() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadges = document.querySelectorAll('.header-cart-badge');
    cartBadges.forEach(b => {
      b.textContent = totalItems;
      b.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    const wishBadges = document.querySelectorAll('.header-wish-badge');
    wishBadges.forEach(b => {
      b.textContent = this.wishlist.length;
      b.style.display = this.wishlist.length > 0 ? 'flex' : 'none';
    });
  },

  addToCart(product, qty = 1, showToastMsg = true) {
    const existing = this.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        sku: product.sku || 'AERO-SKU',
        price: Number(product.price),
        quantity: qty,
        volume: product.volume || '500ml',
        color: product.color || '#1e3a5f',
      });
    }
    this.saveCart();
    if (showToastMsg) {
      this.showToast(`Added ${qty}x "${product.name}" to cart.`);
    }
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
  },

  updateCartQuantity(id, qty) {
    if (qty <= 0) {
      this.removeFromCart(id);
      return;
    }
    const item = this.cart.find(i => i.id === id);
    if (item) {
      item.quantity = qty;
      this.saveCart();
    }
  },

  toggleWishlist(product) {
    const idx = this.wishlist.findIndex(w => w.id === product.id);
    if (idx >= 0) {
      this.wishlist.splice(idx, 1);
      this.showToast(`Removed "${product.name}" from wishlist.`);
    } else {
      this.wishlist.push(product);
      this.showToast(`Saved "${product.name}" to wishlist.`);
    }
    this.saveWishlist();
  },

  showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    container.innerHTML = `<div class="toast">${msg}</div>`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      container.innerHTML = '';
    }, 2800);
  },

  toggleCart(open) {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    const isOpen = open !== undefined ? open : drawer.style.display !== 'block';
    if (isOpen) {
      this.renderCartDrawer();
      drawer.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } else {
      drawer.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  renderCartDrawer() {
    const container = document.getElementById('cart-drawer-content');
    if (!container) return;

    const subtotal = this.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalItems = this.cart.reduce((s, i) => s + i.quantity, 0);

    let volumeDiscount = 0;
    if (totalItems >= 12) volumeDiscount = subtotal * 0.15;
    else if (totalItems >= 6) volumeDiscount = subtotal * 0.08;

    let promoDiscount = 0;
    if (this.appliedCoupon?.discountPercent) {
      promoDiscount = (subtotal * this.appliedCoupon.discountPercent) / 100;
    }

    const totalDiscount = volumeDiscount + promoDiscount;
    const isFreeShipping = subtotal >= 150 || this.appliedCoupon?.freeShipping;
    const shipping = isFreeShipping ? 0 : (subtotal > 0 ? 14.95 : 0);
    const total = Math.max(0, subtotal - totalDiscount + shipping);
    const progress = Math.min((subtotal / 150) * 100, 100);

    container.innerHTML = `
      <div class="drawer-header">
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 15px; font-weight: 600; color: var(--color-text);">Your Cart</span>
          <span style="font-size: 12px; color: var(--color-text-muted);">(${totalItems} items)</span>
        </div>
        <button onclick="AerosolWebapp.toggleCart(false)" class="btn btn-ghost btn-sm" style="font-size: 16px;">✕</button>
      </div>

      <div class="drawer-body">
        ${this.cart.length === 0 ? `
          <div style="text-align: center; padding: 64px 24px;">
            <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Your cart is empty</div>
            <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 24px;">Add aerosol formulations to get started.</p>
            <a href="/shop.html" class="btn btn-neutral btn-sm" onclick="AerosolWebapp.toggleCart(false);">Explore products</a>
          </div>
        ` : `
          <div style="padding: 12px 20px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-subtle);">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
              <span>${isFreeShipping ? '✓ Free HazMat Shipping Applied' : `Free Shipping over $150 ($${(150 - subtotal).toFixed(2)} away)`}</span>
            </div>
            <div style="height: 3px; background: var(--color-border); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: ${progress}%; background: var(--color-text); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div>
            ${this.cart.map(item => `
              <div style="display: flex; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--color-border); background: #ffffff;">
                <div style="width: 44px; height: 58px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <div style="width: 14px; height: 36px; background: ${item.color || '#1e3a5f'}; border-radius: 2px;"></div>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 10px; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em;">${item.volume || ''}</div>
                  <div style="font-size: 13px; font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                      <button onclick="AerosolWebapp.updateCartQuantity('${item.id}', ${item.quantity - 1})" style="padding: 2px 7px; color: var(--color-text-muted); cursor: pointer; font-size: 12px;">−</button>
                      <span style="font-size: 11px; font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                      <button onclick="AerosolWebapp.updateCartQuantity('${item.id}', ${item.quantity + 1})" style="padding: 2px 7px; color: var(--color-text-muted); cursor: pointer; font-size: 12px;">+</button>
                    </div>
                    <span style="font-size: 13px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button onclick="AerosolWebapp.removeFromCart('${item.id}')" style="color: var(--color-text-placeholder); cursor: pointer; align-self: flex-start; font-size: 14px;">✕</button>
              </div>
            `).join('')}
          </div>

          <div style="padding: 16px 20px; border-bottom: 1px solid var(--color-border); background: #ffffff;">
            ${this.appliedCoupon ? `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--color-success);">
                <span>Coupon: <strong>${this.appliedCoupon.code}</strong></span>
                <button onclick="AerosolWebapp.appliedCoupon = null; AerosolWebapp.renderCartDrawer();" style="color: var(--color-text-muted); cursor: pointer;">✕</button>
              </div>
            ` : `
              <div style="display: flex; gap: 8px;">
                <input id="cart-coupon-input" class="input" placeholder="Promo code (e.g. AEROVOX10)" style="font-size: 12px;">
                <button class="btn btn-neutral btn-sm" onclick="AerosolWebapp.applyCoupon()">Apply</button>
              </div>
            `}
          </div>
        `}
      </div>

      ${this.cart.length > 0 ? `
        <div class="drawer-footer">
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; margin-bottom: 14px;">
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
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; padding-top: 8px; border-top: 1px solid var(--color-border);">
              <span>Total</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          <a href="/checkout.html" class="btn btn-inverted btn-lg btn-full" style="text-align: center;" onclick="AerosolWebapp.toggleCart(false);">
            Proceed to Checkout →
          </a>
        </div>
      ` : ''}
    `;
  },

  applyCoupon() {
    const input = document.getElementById('cart-coupon-input');
    if (!input || !input.value.trim()) return;
    const code = input.value.trim().toUpperCase();
    if (code === 'AEROVOX10') {
      this.appliedCoupon = { code, discountPercent: 10 };
      this.showToast('10% discount applied.');
    } else if (code === 'BULK20') {
      this.appliedCoupon = { code, discountPercent: 20 };
      this.showToast('20% discount applied.');
    } else if (code === 'HAZMATFREE') {
      this.appliedCoupon = { code, freeShipping: true };
      this.showToast('Free HazMat shipping applied.');
    } else {
      this.showToast('Invalid coupon code.');
    }
    this.renderCartDrawer();
  },

  toggleSearch(open) {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    const isOpen = open !== undefined ? open : modal.style.display !== 'block';
    if (isOpen) {
      modal.style.display = 'block';
      this.renderSearchResults('');
      setTimeout(() => document.getElementById('search-input')?.focus(), 50);
    } else {
      modal.style.display = 'none';
    }
  },

  async renderSearchResults(query = '') {
    const container = document.getElementById('search-results-content');
    if (!container) return;

    let products = this._cachedProducts || [];
    if (products.length === 0) {
      try {
        const res = await fetch('/api/v1/products');
        const data = await res.json();
        if (data.success) {
          products = data.data;
          this._cachedProducts = products;
        }
      } catch (e) {}
    }

    const results = query.trim()
      ? products.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 6)
      : [];

    container.innerHTML = `
      ${results.length > 0 ? `
        <span class="section-label">${results.length} Results</span>
        <div style="display: flex; flex-direction: column;">
          ${results.map(p => `
            <a href="/product.html?id=${p.id}" onclick="AerosolWebapp.toggleSearch(false);"
               style="display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--color-border); color: inherit;">
              <div style="width: 32px; height: 42px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: var(--color-text-muted); font-family: var(--font-mono);">
                ${p.sku ? p.sku.split('-')[1] : 'SKU'}
              </div>
              <div style="flex: 1;">
                <div style="font-size: 10px; text-transform: uppercase; color: var(--color-text-muted);">${p.category}</div>
                <div style="font-size: 13px; font-weight: 500;">${p.name}</div>
              </div>
              <div style="font-weight: 600; font-size: 13px;">$${Number(p.price).toFixed(2)}</div>
            </a>
          `).join('')}
        </div>
      ` : `
        <span class="section-label">Popular Searches</span>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${['Ceramic Clear Coat', 'Dielectric Cleaner', 'Thermal Enamel', 'Hospital Fogger'].map(tag => `
            <button onclick="document.getElementById('search-input').value='${tag}'; AerosolWebapp.renderSearchResults('${tag}');"
                    style="padding: 5px 12px; font-size: 12px; color: var(--color-text-secondary); background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-full); cursor: pointer;">
              ${tag}
            </button>
          `).join('')}
        </div>
      `}
    `;
  },

  handleUserIconClick() {
    const u = this.user || JSON.parse(localStorage.getItem('aerosol_user') || 'null');
    if (u && u.id) {
      window.location.href = '/account.html';
    } else {
      this.openAuthModal('/account.html');
    }
  },

  openAuthModal(redirectUrl = '') {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'auth-modal';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="overlay" onclick="AerosolWebapp.closeAuthModal()"></div>
      <div class="modal-center" style="z-index: 1000;">
        <div style="position: relative; width: 100%; max-width: 440px;">
          <button onclick="AerosolWebapp.closeAuthModal()" class="btn btn-ghost btn-sm" style="position: absolute; top: 16px; right: 16px; z-index: 10;">✕</button>
          <div id="modal-auth-component-mount"></div>
        </div>
      </div>
    `;

    modal.style.display = 'block';

    const mountAuth = () => {
      if (window.AerosolAuth) {
        window.AerosolAuth.init('modal-auth-component-mount', {
          redirectUrl: redirectUrl || window.location.pathname,
          onSuccess: (data) => {
            this.closeAuthModal();
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            } else {
              window.location.reload();
            }
          }
        });
      }
    };

    if (window.AerosolAuth) {
      mountAuth();
    } else {
      const script = document.createElement('script');
      script.src = '/js/auth-component.js';
      script.onload = mountAuth;
      document.head.appendChild(script);
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
  },

  loginDemo(email, name, role, tier, comp) {
    this.user = {
      id: 'usr-' + Math.random().toString(36).substring(2, 8),
      name,
      email,
      role,
      tier,
      company: comp,
      termsAccepted: true,
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
    this.saveUser();
    this.closeAuthModal();
    this.showToast(`Signed in as ${name}`);
    window.location.reload();
  },

  logout() {
    this.user = null;
    localStorage.removeItem('aerosol_user');
    localStorage.removeItem('dinkal_user');
    this.showToast('Signed out successfully.');
    window.location.href = '/index.html';
  },

  setupGlobalEvents() {
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleSearch(true);
      }
      if (e.key === 'Escape') {
        this.toggleSearch(false);
        this.toggleCart(false);
        this.closeAuthModal();
      }
    });
  },

  renderCanister(color = '#1e3a5f', height = 140, label = '') {
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
};

window.DINKAL = AerosolWebapp;
window.AerosolWebapp = AerosolWebapp;

document.addEventListener('DOMContentLoaded', () => {
  AerosolWebapp.init();
});
