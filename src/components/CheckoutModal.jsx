import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Lock,
  ArrowRight,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  appliedCoupon, 
  onOrderComplete 
}) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    name: 'Marcus Vance',
    email: 'm.vance@vanguard-aero.com',
    company: 'Vanguard Aerospace LLC',
    address: '450 Aerospace Parkway, Suite 100',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    paymentMethod: 'card',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '08/28',
    cardCvc: '•••',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  let bulkDiscount = 0;
  if (totalItems >= 12) bulkDiscount = subtotal * 0.15;
  else if (totalItems >= 6) bulkDiscount = subtotal * 0.08;

  let promoDiscount = 0;
  if (appliedCoupon?.discountPercent) {
    promoDiscount = (subtotal * appliedCoupon.discountPercent) / 100;
  }

  const discount = bulkDiscount + promoDiscount;
  const isFreeShipping = subtotal >= 150 || appliedCoupon?.freeShipping;
  const shipping = isFreeShipping || subtotal === 0 ? 0 : 14.95;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          tier: formData.company ? 'B2B Commercial' : 'Retail Direct',
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        },
        items: cart,
        subtotal,
        discount,
        shipping,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: formData.paymentMethod,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success) {
        setConfirmedOrder(res.data);
        setStep(3);
        onOrderComplete();

        // Fire celebratory particle confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00f2fe', '#ff007a', '#10b981', '#ffd200'],
          });
        } catch (err) {}
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-glow modal-content"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'rgba(9, 14, 24, 0.98)',
          position: 'relative',
          padding: '0',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} color="#00f2fe" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff' }}>
              {step === 3 ? 'Order Dispatched' : 'HazMat 256-Bit Encrypted Checkout'}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6, 9, 14, 0.5)' }}>
            <div 
              style={{
                flex: 1,
                padding: '12px',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: step === 1 ? '#00f2fe' : '#94a3b8',
                borderBottom: `2px solid ${step === 1 ? '#00f2fe' : 'transparent'}`
              }}
            >
              1. Delivery & HazMat Address
            </div>
            <div 
              style={{
                flex: 1,
                padding: '12px',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: step === 2 ? '#00f2fe' : '#94a3b8',
                borderBottom: `2px solid ${step === 2 ? '#00f2fe' : 'transparent'}`
              }}
            >
              2. Payment & Verification
            </div>
          </div>
        )}

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <form onSubmit={() => setStep(2)} style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Company / Lab (Optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Zip *</label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Order Total:</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe' }}>
                  ${total.toFixed(2)}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                <span>Continue to Payment</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <form onSubmit={handleSubmitOrder} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[
                { id: 'card', label: 'Credit Card / Corp Card', icon: CreditCard },
                { id: 'invoice', label: 'Net-30 Commercial Invoice', icon: FileText },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: opt.id })}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '10px',
                    background: formData.paymentMethod === opt.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${formData.paymentMethod === opt.id ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                    color: formData.paymentMethod === opt.id ? '#00f2fe' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  <opt.icon size={16} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {formData.paymentMethod === 'card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Card Number</label>
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="glass-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>Expiration</label>
                    <input
                      type="text"
                      required
                      value={formData.cardExp}
                      onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>CVC Security Code</label>
                    <input
                      type="text"
                      required
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <p>Commercial Net-30 invoice will be automatically transmitted to <strong>{formData.email}</strong> and billed to <strong>{formData.company || formData.name}</strong> upon hazmat freight dispatch.</p>
              </div>
            )}

            {errorMsg && (
              <div style={{ color: '#ff007a', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '12px 28px' }}
              >
                <Lock size={16} />
                <span>{isSubmitting ? 'Authorizing HazMat Packaging...' : `Authorize & Pay $${total.toFixed(2)}`}</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation */}
        {step === 3 && confirmedOrder && (
          <div style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>
              Order Confirmed & Scheduled!
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px' }}>
              Your pressurized aerosol canisters have entered cleanroom fill and quality inspection.
            </p>

            {/* Receipt Summary Card */}
            <div 
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                textAlign: 'left',
                maxWidth: '480px',
                margin: '0 auto 28px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Order Number:</span>
                <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{confirmedOrder.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Tracking ID:</span>
                <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{confirmedOrder.trackingNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Carrier:</span>
                <span style={{ color: '#fff' }}>{confirmedOrder.carrier}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Recipient:</span>
                <span style={{ color: '#fff' }}>{confirmedOrder.customer.name} ({confirmedOrder.customer.email})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontWeight: 800 }}>
                <span style={{ color: '#fff' }}>Total Paid:</span>
                <span style={{ color: '#10b981', fontSize: '1.15rem' }}>${confirmedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                <Printer size={16} />
                <span>Print Bill of Lading</span>
              </button>

              <button
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <span>Done & Return to Lab</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
