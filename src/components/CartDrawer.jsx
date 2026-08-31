import React, { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { api } from '../utils/api';

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
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(couponInput.trim().toUpperCase());
      if (res.success) {
        setAppliedCoupon(res.data);
        setCouponInput('');
      } else {
        setCouponError(res.message || 'Invalid coupon code.');
      }
    } catch (err) {
      setCouponError('Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  let volumeDiscount = 0;
  if (totalItems >= 12) volumeDiscount = subtotal * 0.15;
  else if (totalItems >= 6) volumeDiscount = subtotal * 0.08;

  let promoDiscount = 0;
  if (appliedCoupon?.discountPercent) {
    promoDiscount = (subtotal * appliedCoupon.discountPercent) / 100;
  }

  const totalDiscount = volumeDiscount + promoDiscount;
  const isFreeShipping = subtotal >= 150 || appliedCoupon?.freeShipping;
  const shipping = isFreeShipping ? 0 : subtotal > 0 ? 14.95 : 0;
  const total = Math.max(0, subtotal - totalDiscount + shipping);

  const shippingProgress = Math.min((subtotal / 150) * 100, 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="overlay" onClick={onClose} style={{ zIndex: 940 }} />

      {/* Drawer */}
      <div className="drawer" style={{ zIndex: 950 }}>

        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Your Cart
            </span>
            {totalItems > 0 && (
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px' }}
            aria-label="Close cart"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body" style={{ padding: '0' }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '320px',
                gap: '16px',
                padding: '24px',
              }}
            >
              <ShoppingBag size={40} strokeWidth={1} color="var(--color-border-hover)" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '6px' }}>
                  Your cart is empty
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  Add aerosol formulations to get started.
                </div>
              </div>
              <button onClick={onClose} className="btn btn-neutral btn-md">
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {/* Free shipping progress */}
              {!isFreeShipping && (
                <div
                  style={{
                    padding: '14px 24px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Free HazMat shipping on orders over $150
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                      ${(150 - subtotal).toFixed(2)} away
                    </span>
                  </div>
                  <div
                    style={{
                      height: '2px',
                      backgroundColor: 'var(--color-border)',
                      borderRadius: '1px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${shippingProgress}%`,
                        backgroundColor: 'var(--color-text)',
                        borderRadius: '1px',
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </div>
              )}
              {isFreeShipping && subtotal > 0 && (
                <div
                  style={{
                    padding: '10px 24px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-success-bg)',
                    fontSize: '13px',
                    color: 'var(--color-success)',
                    fontWeight: 500,
                  }}
                >
                  ✓ Free HazMat ground shipping applied
                </div>
              )}

              {/* Items */}
              <div>
                {cart.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '20px 24px',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    {/* Canister visual */}
                    <div
                      style={{
                        width: '56px',
                        height: '72px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        gap: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '44px',
                          borderRadius: '3px 3px 2px 2px',
                          background: `linear-gradient(180deg, #1e293b 0%, ${item.color || '#374151'} 100%)`,
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '2px',
                        }}
                      >
                        {item.volume}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                          lineHeight: 1.3,
                          marginBottom: '12px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.name}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Quantity stepper */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Minus size={12} strokeWidth={2} />
                          </button>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderLeft: '1px solid var(--color-border)',
                              borderRight: '1px solid var(--color-border)',
                              minWidth: '32px',
                              textAlign: 'center',
                              color: 'var(--color-text)',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              color: 'var(--color-text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Plus size={12} strokeWidth={2} />
                          </button>
                        </div>

                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px',
                        cursor: 'pointer',
                        color: 'var(--color-text-placeholder)',
                        alignSelf: 'flex-start',
                        flexShrink: 0,
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-placeholder)')}
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Volume discount notice */}
              {totalItems >= 6 && (
                <div
                  style={{
                    margin: '0 24px',
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginTop: '16px',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {totalItems >= 12 ? '15%' : '8%'} case discount applied
                  </span>{' '}
                  — {totalItems >= 12 ? 'Master case (12+ units)' : 'Half-case (6+ units)'} pricing active
                </div>
              )}

              {/* Coupon */}
              <div style={{ padding: '20px 24px' }}>
                {appliedCoupon ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={14} color="var(--color-success)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>
                        {appliedCoupon.code}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {appliedCoupon.discountPercent
                          ? `—${appliedCoupon.discountPercent}% off`
                          : appliedCoupon.freeShipping
                          ? '— free shipping'
                          : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="input"
                      style={{ flex: 1, fontSize: '13px' }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="btn btn-neutral btn-sm"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '6px' }}>{couponError}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer — Order summary + CTA */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
              </div>

              {totalDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>−${totalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: isFreeShipping ? 'var(--color-success)' : 'var(--color-text)', fontWeight: 500 }}>
                  {isFreeShipping ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
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

            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '12px' }}>
              Taxes calculated at checkout · HazMat ground shipping only
            </p>
          </div>
        )}
      </div>
    </>
  );
}
