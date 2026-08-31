import React, { useState } from 'react';
import { Package, MapPin, CreditCard, User, ArrowRight, Heart } from 'lucide-react';

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Saved', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: User },
];

const STATUS_TAG = {
  Delivered: { color: 'var(--color-success)', bg: 'var(--color-success-bg)', border: '#a7f3d0' },
  Dispatched: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  Processing: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: '#fde68a' },
  'Order Placed': { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-subtle)', border: 'var(--color-border)' },
};

export default function AccountView({ currentUser, orders = [], wishlist = [], onNavigate, onSelectProduct, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    company: currentUser?.company || '',
  });

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <h2 className="text-h3" style={{ marginBottom: '12px' }}>Sign in to view your account</h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
          Access your orders, saved items, and profile details.
        </p>
        <button onClick={() => onNavigate('home')} className="btn btn-inverted btn-md">Go home</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '0' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Account</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '0' }}>
            <div>
              <h1 className="text-h2">{currentUser.name}</h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {currentUser.email}
                {currentUser.tier && (
                  <span style={{ marginLeft: '10px', padding: '1px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-subtle)' }}>
                    {currentUser.tier}
                  </span>
                )}
              </p>
            </div>
            <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ marginBottom: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Sign out
            </button>
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--color-border)', marginTop: '32px' }}>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: activeTab === id ? 600 : 400,
                  color: activeTab === id ? 'var(--color-text)' : 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === id ? '2px solid var(--color-text)' : '2px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', borderBottom: '1px solid var(--color-border)' }}>
                <Package size={40} strokeWidth={1} color="var(--color-border-hover)" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>No orders placed yet.</p>
                <button onClick={() => onNavigate('shop')} className="btn btn-inverted btn-md">Browse catalog</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {orders.map((order) => {
                  const tag = STATUS_TAG[order.status] || STATUS_TAG['Order Placed'];
                  return (
                    <div
                      key={order.orderNumber}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr auto',
                        gap: '24px',
                        padding: '24px 0',
                        borderBottom: '1px solid var(--color-border)',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', marginBottom: '4px' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                          {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                          {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                          ${order.total?.toFixed(2)} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ padding: '3px 10px', border: '1px solid ' + tag.border, borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600, color: tag.color, backgroundColor: tag.bg }}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => onNavigate('track')}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Track
                          <ArrowRight size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SAVED / WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>No saved items yet.</p>
                <button onClick={() => onNavigate('wishlist')} className="btn btn-neutral btn-md">View wishlist</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {wishlist.slice(0, 6).map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 0',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectProduct(p)}
                  >
                    <div style={{ width: '44px', height: '56px', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{p.category}</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>{p.name}</div>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>${p.price?.toFixed(2)}</div>
                  </div>
                ))}
                <div style={{ paddingTop: '24px' }}>
                  <button onClick={() => onNavigate('wishlist')} className="btn btn-neutral btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    View all saved items
                    <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADDRESSES */}
        {activeTab === 'addresses' && (
          <div style={{ maxWidth: '560px' }}>
            {(currentUser.addresses || []).length === 0 ? (
              <p style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>No saved addresses.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentUser.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      border: '1px solid ' + (addr.isDefault ? 'var(--color-text)' : 'var(--color-border)'),
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      position: 'relative',
                    }}
                  >
                    {addr.isDefault && (
                      <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Default
                      </span>
                    )}
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '4px' }}>{addr.name}</div>
                    {addr.company && <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{addr.company}</div>}
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {addr.street}<br />{addr.city}, {addr.state} {addr.zip}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full name</label>
                <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email address</label>
                <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              {currentUser.role?.includes('b2b') && (
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                </div>
              )}
              <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-inverted btn-md">Save changes</button>
                <button className="btn btn-ghost btn-md" style={{ color: 'var(--color-error)' }} onClick={onLogout}>Delete account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
