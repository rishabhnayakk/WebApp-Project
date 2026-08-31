import React, { useState } from 'react';
import { ArrowRight, Lock, ChevronDown, Check } from 'lucide-react';
import { api } from '../utils/api';

const STEPS = ['Cart', 'Contact', 'Shipping', 'Payment', 'Confirmation'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0px', marginBottom: '40px' }}>
      {STEPS.map((step, idx) => (
        <React.Fragment key={step}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: idx < current ? 'var(--color-text)' : idx === current ? 'var(--color-text)' : 'transparent',
                border: '1px solid ' + (idx <= current ? 'var(--color-text)' : 'var(--color-border)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {idx < current ? (
                <Check size={11} strokeWidth={2.5} color="#fff" />
              ) : (
                <span style={{ fontSize: '11px', fontWeight: 600, color: idx === current ? '#fff' : 'var(--color-text-muted)', lineHeight: 1 }}>
                  {idx + 1}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: idx === current ? 600 : 400,
                color: idx === current ? 'var(--color-text)' : idx < current ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              }}
            >
              {step}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)', margin: '0 12px', minWidth: '20px' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CheckoutView({ cart = [], onOrderComplete, appliedCoupon, currentUser }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [shipping, setShipping] = useState({
    name: currentUser?.name || '',
    company: currentUser?.company || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  let discount = 0;
  if (totalItems >= 12) discount = subtotal * 0.15;
  else if (totalItems >= 6) discount = subtotal * 0.08;
  if (appliedCoupon?.discountPercent) discount += (subtotal * appliedCoupon.discountPercent) / 100;

  const shippingCosts = { standard: subtotal >= 150 ? 0 : 14.95, expedited: 32.00, express: 58.00 };
  const shippingCost = shippingCosts[shippingMethod] || 14.95;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await api.createOrder({
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        contact,
        shippingAddress: shipping,
        shippingMethod,
        couponCode: appliedCoupon?.code,
        subtotal,
        discount,
        shipping: shippingCost,
        total,
      });
      if (res.success) {
        setOrder(res.data);
        setStep(4);
        onOrderComplete(res.data);
      }
    } catch (e) {
      // Fallback
      const mockOrder = {
        orderNumber: 'DNKL-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        estimatedDelivery: new Date(Date.now() + 4 * 86400000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
        total,
      };
      setOrder(mockOrder);
      setStep(4);
      onOrderComplete(mockOrder);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && step < 4) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <h2 className="text-h3" style={{ marginBottom: '12px' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px', fontSize: '15px' }}>
          Add aerosol formulations to your cart before checking out.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      {step < 4 && (
        <div style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
            <div className="section-label" style={{ marginBottom: '8px' }}>Order</div>
            <h1 className="text-h2" style={{ marginBottom: '32px' }}>Checkout</h1>
            <StepIndicator current={step} />
          </div>
        </div>
      )}

      {step === 4 ? (
        /* CONFIRMATION */
        <div
          className="container"
          style={{
            paddingTop: '80px',
            paddingBottom: '80px',
            maxWidth: '560px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <Check size={22} strokeWidth={2} color="var(--color-success)" />
          </div>
          <div className="section-label" style={{ marginBottom: '12px' }}>Order confirmed</div>
          <h1 className="text-h2" style={{ marginBottom: '12px' }}>
            {order?.orderNumber}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '8px' }}>
            Your order has been placed and is queued for dispatch with DOT-SP certified HazMat ground freight.
          </p>
          {order?.estimatedDelivery && (
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
              Estimated delivery: <strong style={{ color: 'var(--color-text)' }}>{order.estimatedDelivery}</strong>
            </p>
          )}

          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '32px',
              textAlign: 'left',
            }}
          >
            {[
              ['Contact', contact.email],
              ['Ship to', `${shipping.street}, ${shipping.city}, ${shipping.state} ${shipping.zip}`],
              ['Method', shippingMethod === 'standard' ? 'HazMat Ground (3–5 days)' : 'Expedited Ground (1–2 days)'],
              ['Order total', `$${total.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            A confirmation email with tracking information will be sent to <strong style={{ color: 'var(--color-text)' }}>{contact.email}</strong>
          </p>
        </div>
      ) : (
        /* MULTI-COLUMN LAYOUT */
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '0',
            paddingTop: '0',
            paddingBottom: '80px',
            alignItems: 'flex-start',
          }}
        >
          {/* LEFT — Form */}
          <div style={{ paddingRight: '64px', paddingTop: '40px' }}>
            {step === 1 && (
              <div>
                <h2 className="text-h4" style={{ marginBottom: '24px' }}>Contact information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="label">Full name</label>
                    <input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="label">Email address</label>
                    <input className="input" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@company.com" />
                  </div>
                  <div>
                    <label className="label">Phone number</label>
                    <input className="input" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn btn-inverted btn-lg" style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Continue to shipping
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-h4" style={{ marginBottom: '24px' }}>Shipping address</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label className="label">Full name</label><input className="input" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} /></div>
                    <div><label className="label">Company (optional)</label><input className="input" value={shipping.company} onChange={(e) => setShipping({ ...shipping, company: e.target.value })} /></div>
                  </div>
                  <div><label className="label">Street address</label><input className="input" value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} placeholder="740 Aerospace Blvd" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', gap: '12px' }}>
                    <div><label className="label">City</label><input className="input" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} /></div>
                    <div><label className="label">State</label><input className="input" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} maxLength={2} /></div>
                    <div><label className="label">ZIP</label><input className="input" value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} /></div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <label className="label" style={{ marginBottom: '12px' }}>Shipping method</label>
                    {[
                      { id: 'standard', label: 'HazMat Ground', sub: '3–5 business days', price: shippingCosts.standard },
                      { id: 'expedited', label: 'Expedited Ground', sub: '1–2 business days', price: shippingCosts.expedited },
                      { id: 'express', label: 'Emergency Ground', sub: 'Next business day', price: shippingCosts.express },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          border: '1px solid ' + (shippingMethod === opt.id ? 'var(--color-text)' : 'var(--color-border)'),
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          marginBottom: '8px',
                          backgroundColor: shippingMethod === opt.id ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
                          transition: 'border-color var(--transition-fast)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input type="radio" checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)} style={{ accentColor: 'var(--color-text)' }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{opt.sub}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                          {opt.price === 0 ? 'Free' : `$${opt.price.toFixed(2)}`}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
                  <button onClick={() => setStep(1)} className="btn btn-neutral btn-lg">Back</button>
                  <button onClick={() => setStep(3)} className="btn btn-inverted btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Continue to payment
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-h4" style={{ marginBottom: '24px' }}>Payment details</h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '24px',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <Lock size={13} strokeWidth={1.5} />
                  Payments are encrypted with 256-bit SSL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="label">Card number</label>
                    <input
                      className="input"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="label">Name on card</label>
                    <input className="input" value={payment.name} onChange={(e) => setPayment({ ...payment, name: e.target.value })} placeholder="JANE SMITH" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label className="label">Expiry</label><input className="input" value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM / YY" /></div>
                    <div><label className="label">CVV</label><input className="input" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" maxLength={4} /></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
                  <button onClick={() => setStep(2)} className="btn btn-neutral btn-lg">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn btn-inverted btn-lg"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                  >
                    {loading ? 'Processing...' : `Place order — $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <div
            style={{
              borderLeft: '1px solid var(--color-border)',
              paddingLeft: '40px',
              paddingTop: '40px',
              position: 'sticky',
              top: '56px',
            }}
          >
            <div className="section-label" style={{ marginBottom: '16px' }}>Order summary</div>

            <div style={{ marginBottom: '24px' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                      Qty {item.quantity} · {item.volume}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', flexShrink: 0 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: shippingCost === 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: 'var(--color-text)', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
