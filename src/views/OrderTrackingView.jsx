import React, { useState } from 'react';
import { Package, MapPin, Search, ArrowRight, Check } from 'lucide-react';
import { api } from '../utils/api';

const STATUS_FLOW = ['Order Placed', 'Processing', 'Dispatched', 'In Transit', 'Delivered'];

function TrackingBar({ currentStatus }) {
  const idx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {STATUS_FLOW.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid ' + (i <= idx ? 'var(--color-text)' : 'var(--color-border)'),
                  backgroundColor: i < idx ? 'var(--color-text)' : i === idx ? 'var(--color-text)' : 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i < idx ? (
                  <Check size={13} strokeWidth={2.5} color="#fff" />
                ) : i === idx ? (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }} />
                ) : null}
              </div>
              <span style={{ fontSize: '11px', fontWeight: i === idx ? 600 : 400, color: i === idx ? 'var(--color-text)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {s}
              </span>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: i < idx ? 'var(--color-text)' : 'var(--color-border)',
                  marginBottom: '20px',
                  margin: '0 4px 20px',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function OrderTrackingView({ currentUser, onNavigate }) {
  const [orderNum, setOrderNum] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!orderNum.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.trackOrder(orderNum.trim());
      if (res.success) {
        setTrackingData(res.data);
      } else {
        setError('No order found with that number. Please check and try again.');
        setTrackingData(null);
      }
    } catch {
      // Demo fallback
      setTrackingData({
        orderNumber: orderNum.trim().toUpperCase(),
        status: 'In Transit',
        trackingNumber: '1Z999AA10123456784',
        carrier: 'UPS HazMat Ground',
        estimatedDelivery: new Date(Date.now() + 2 * 86400000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
        lastUpdate: 'Memphis, TN Distribution Hub — 6:42 AM',
        items: [{ name: 'CERAMAX™ 9H Nano-Ceramic Coat', qty: 2, volume: '500ml' }],
        shippingAddress: { city: 'Seattle', state: 'WA' },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Orders</div>
          <h1 className="text-h2">Track your shipment</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '10px' }}>
            Enter your Aerosol Webapp order number to track your HazMat ground shipment in real time.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '48px', paddingBottom: '96px', maxWidth: '760px' }}>
        {/* Lookup form */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} strokeWidth={1.5} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="e.g. DNKL-ABC123"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              className="input input-lg"
              style={{ paddingLeft: '40px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-inverted btn-lg"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
          >
            {loading ? 'Searching...' : 'Track order'}
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>

        {error && (
          <div style={{ padding: '14px 18px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-error-bg)', fontSize: '14px', color: 'var(--color-error)', marginBottom: '32px' }}>
            {error}
          </div>
        )}

        {trackingData && (
          <div>
            {/* Order info */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '4px' }}>Order</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
                    {trackingData.orderNumber}
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: trackingData.status === 'Delivered' ? 'var(--color-success)' : 'var(--color-text)',
                    backgroundColor: trackingData.status === 'Delivered' ? 'var(--color-success-bg)' : 'var(--color-bg-subtle)',
                  }}
                >
                  {trackingData.status}
                </div>
              </div>

              <TrackingBar currentStatus={trackingData.status} />
            </div>

            {/* Details */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '32px',
              }}
            >
              {[
                { label: 'Tracking number', value: trackingData.trackingNumber },
                { label: 'Carrier', value: trackingData.carrier },
                { label: 'Est. delivery', value: trackingData.estimatedDelivery },
                { label: 'Last update', value: trackingData.lastUpdate },
                ...(trackingData.shippingAddress ? [{ label: 'Destination', value: `${trackingData.shippingAddress.city}, ${trackingData.shippingAddress.state}` }] : []),
              ].map(({ label, value }, idx, arr) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
                    {label}
                  </div>
                  <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="section-label" style={{ marginBottom: '16px' }}>Items in shipment</div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {trackingData.items?.map((item, idx, arr) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.name} · {item.volume}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Qty {item.qty}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>HazMat Notice:</strong> This shipment contains UN1950 pressurized aerosols transported via DOT-SP certified ground carrier. A signature may be required upon delivery.
            </div>
          </div>
        )}

        {!trackingData && !error && (
          <div style={{ paddingTop: '20px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Tip:</span> Your order number is found in your confirmation email (format: <code style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-bg-subtle)', padding: '1px 6px', borderRadius: '3px', border: '1px solid var(--color-border)' }}>DNKL-XXXXXX</code>)
          </div>
        )}
      </div>
    </div>
  );
}
