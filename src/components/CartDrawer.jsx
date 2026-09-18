import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { api } from '../utils/api';

// ─── Sub-components ───────────────────────────────────────────────────────────

function CartItem({ item, onUpdateQuantity, onRemoveItem }) {
  return (
    <div className="cart-item">
      {/* Canister thumbnail */}
      <div className="cart-item-thumb">
        <div
          className="cart-item-canister"
          style={{ background: `linear-gradient(180deg, #1e293b 0%, ${item.color || '#374151'} 100%)` }}
        />
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <div className="text-xs text-muted uppercase tracking-wide mb-1">{item.volume}</div>
        <div className="text-md fw-500 line-clamp-2 mb-3">{item.name}</div>

        <div className="flex-between">
          {/* Quantity stepper */}
          <div className="qty-stepper">
            <button
              className="qty-stepper-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus size={12} strokeWidth={2} />
            </button>
            <span className="qty-stepper-value">{item.quantity}</span>
            <button
              className="qty-stepper-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          <span className="text-md fw-600">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>

      {/* Remove */}
      <button
        className="cart-item-remove"
        onClick={() => onRemoveItem(item.id)}
        aria-label={`Remove ${item.name} from cart`}
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function CouponSection({ appliedCoupon, setAppliedCoupon }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.validateCoupon(input.trim().toUpperCase());
      if (res.success) {
        setAppliedCoupon(res.data);
        setInput('');
      } else {
        setError(res.message || 'Invalid coupon code.');
      }
    } catch {
      setError('Invalid coupon code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-section">
      {appliedCoupon ? (
        <div className="coupon-applied">
          <div className="flex-align gap-2">
            <Tag size={14} color="var(--color-success)" />
            <span className="text-sm fw-600 text-success">{appliedCoupon.code}</span>
            <span className="text-sm text-muted">
              {appliedCoupon.discountPercent
                ? `—${appliedCoupon.discountPercent}% off`
                : appliedCoupon.freeShipping
                ? '— free shipping'
                : ''}
            </span>
          </div>
          <button className="coupon-remove-btn" onClick={() => setAppliedCoupon(null)} aria-label="Remove coupon">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div className="coupon-form">
          <input
            type="text"
            placeholder="Promo code"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="input"
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button onClick={handleApply} disabled={loading} className="btn btn-neutral btn-sm">
            {loading ? '...' : 'Apply'}
          </button>
        </div>
      )}
      {error && <p className="coupon-error">{error}</p>}
    </div>
  );
}

// ─── Cart Totals Hook ─────────────────────────────────────────────────────────

function useCartTotals(cart, appliedCoupon) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const volumeDiscount =
    totalItems >= 12 ? subtotal * 0.15 :
    totalItems >= 6  ? subtotal * 0.08 : 0;

  const promoDiscount = appliedCoupon?.discountPercent
    ? (subtotal * appliedCoupon.discountPercent) / 100
    : 0;

  const totalDiscount = volumeDiscount + promoDiscount;
  const isFreeShipping = subtotal >= 150 || Boolean(appliedCoupon?.freeShipping);
  const shipping = isFreeShipping ? 0 : subtotal > 0 ? 14.95 : 0;
  const total = Math.max(0, subtotal - totalDiscount + shipping);
  const shippingProgress = Math.min((subtotal / 150) * 100, 100);

  return { subtotal, totalItems, totalDiscount, isFreeShipping, shipping, total, shippingProgress };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  setAppliedCoupon,
}) {
  const { subtotal, totalItems, totalDiscount, isFreeShipping, shipping, total, shippingProgress } =
    useCartTotals(cart, appliedCoupon);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="overlay" onClick={onClose} style={{ zIndex: 940 }} />

      {/* Drawer */}
      <div className="drawer" style={{ zIndex: 950 }}>

        {/* Header */}
        <div className="drawer-header">
          <div className="flex-align gap-2" style={{ alignItems: 'baseline' }}>
            <span className="text-lg fw-600" style={{ letterSpacing: '-0.01em' }}>Your Cart</span>
            {totalItems > 0 && (
              <span className="text-md text-muted">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }} aria-label="Close cart">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body" style={{ padding: 0 }}>
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={40} strokeWidth={1} color="var(--color-border-hover)" />
              <div className="text-center">
                <div className="text-base fw-500 mb-1">Your cart is empty</div>
                <div className="text-md text-muted">Add aerosol formulations to get started.</div>
              </div>
              <button onClick={onClose} className="btn btn-neutral btn-md">Continue shopping</button>
            </div>
          ) : (
            <>
              {/* Free shipping progress bar */}
              {!isFreeShipping && (
                <div className="cart-shipping-bar">
                  <div className="flex-between mb-2">
                    <span className="text-xs text-secondary">Free HazMat shipping on orders over $150</span>
                    <span className="text-xs fw-600">${(150 - subtotal).toFixed(2)} away</span>
                  </div>
                  <div className="cart-shipping-bar-inner">
                    <div className="cart-shipping-bar-fill" style={{ width: `${shippingProgress}%` }} />
                  </div>
                </div>
              )}

              {isFreeShipping && subtotal > 0 && (
                <div className="cart-free-shipping-notice">Free HazMat ground shipping applied</div>
              )}

              {/* Items list */}
              <div>
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
              </div>

              {/* Volume discount notice */}
              {totalItems >= 6 && (
                <div className="cart-volume-notice">
                  <span className="fw-600">{totalItems >= 12 ? '15%' : '8%'} case discount applied</span>{' '}
                  — {totalItems >= 12 ? 'Master case (12+ units)' : 'Half-case (6+ units)'} pricing active
                </div>
              )}

              {/* Coupon */}
              <CouponSection appliedCoupon={appliedCoupon} setAppliedCoupon={setAppliedCoupon} />
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-footer-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="fw-500" style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="summary-row text-success">
                  <span>Discount</span>
                  <span>−${totalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Shipping</span>
                <span className="fw-500" style={{ color: isFreeShipping ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {isFreeShipping ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => { onProceedToCheckout(); onClose(); }}
              className="btn btn-inverted btn-lg btn-full"
              style={{ justifyContent: 'space-between' }}
            >
              <span>Checkout</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>

            <p className="text-xs text-muted text-center mt-3">
              Taxes calculated at checkout · HazMat ground shipping only
            </p>
          </div>
        )}
      </div>
    </>
  );
}
