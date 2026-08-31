import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Gauge, 
  Package, 
  TrendingUp, 
  Layers, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  Building2
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, orders, inventory, quotes

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, quotesRes] = await Promise.all([
        api.getStats(),
        api.getOrders(),
        api.getQuotes(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (quotesRes.success) setQuotes(quotesRes.data);
    } catch (err) {
      console.error('Failed to fetch admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-glow modal-content"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: 'rgba(6, 9, 14, 0.98)',
          position: 'relative',
          padding: '0',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div 
          style={{
            padding: '18px 26px',
            borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.7)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff' }}>
                AEROVOX Live Production & Cleanroom Telemetry
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                IoT Aerosol Fill Line Status: ACTIVE (Cleanroom #04)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={fetchData}
              title="Refresh telemetry"
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

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
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10, 15, 26, 0.6)' }}>
          {[
            { id: 'telemetry', name: 'IoT Telemetry & KPIs', icon: Gauge },
            { id: 'orders', name: `Orders Log (${orders.length})`, icon: Truck },
            { id: 'quotes', name: `B2B Quotes (${quotes.length})`, icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: activeTab === tab.id ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#00f2fe' : 'transparent'}`,
                  color: activeTab === tab.id ? '#00f2fe' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '26px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Fetching real-time aerosol sensors and order ledger...</p>
            </div>
          ) : (
            <>
              {/* Telemetry View */}
              {activeTab === 'telemetry' && stats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* KPI Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.6)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gross Order Revenue</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                        {stats.totalRevenue}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981' }}>{stats.monthlyGrowth} Month-over-Month</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.6)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Canisters Filled MTD</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, color: '#00f2fe', margin: '4px 0' }}>
                        {stats.canistersFilledMtd}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#00f2fe' }}>99.994% Pressure Test Pass</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.6)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Available Stock Units</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 900, color: '#ffd200', margin: '4px 0' }}>
                        {stats.inventoryAvailable.toLocaleString()} cans
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#ffd200' }}>Across {stats.activeSkus} Active SKUs</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.6)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Environmental Compliance</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>
                        100% Low-VOC
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981' }}>CARB 2026 & EU Reach Certified</div>
                    </div>
                  </div>

                  {/* Cleanroom Sensor Diagnostics */}
                  <div className="glass-panel" style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--font-heading)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gauge size={16} color="#00f2fe" />
                      <span>Automated Gas Purge & Propellant Injection Line</span>
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(6, 9, 14, 0.6)', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Chamber Pressure Avg:</span>
                        <strong style={{ color: '#00f2fe' }}>7.42 BAR</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(6, 9, 14, 0.6)', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Cleanroom Humidity:</span>
                        <strong style={{ color: '#10b981' }}>42.5% RH</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(6, 9, 14, 0.6)', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Airborne Particulates:</span>
                        <strong style={{ color: '#10b981' }}>ISO Class 5 (&lt; 0.1µm)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(6, 9, 14, 0.6)', borderRadius: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>Leak Check Sensor:</span>
                        <strong style={{ color: '#10b981' }}>0.00 PPM Detect</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Log View */}
              {activeTab === 'orders' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{order.id}</strong>
                          <span 
                            className="badge-neon" 
                            style={{ 
                              background: order.status === 'Processing' ? 'rgba(255, 210, 0, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: order.status === 'Processing' ? '#ffd200' : '#10b981',
                              borderColor: order.status === 'Processing' ? '#ffd200' : '#10b981',
                              fontSize: '0.72rem'
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                          {order.customer.name} ({order.customer.email})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Carrier: {order.carrier} • Tracking: <span style={{ fontFamily: 'var(--font-mono)' }}>{order.trackingNumber}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                          ${order.total.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {order.items?.length || 0} SKU item(s)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* B2B Quotes View */}
              {activeTab === 'quotes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {quotes.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{q.id}</strong>
                          <span className="badge-neon" style={{ fontSize: '0.72rem' }}>{q.status}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                          {q.company}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Contact: {q.contact} • {q.canisterSize} • {q.propellant}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                          {q.totalEstimate}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Batch: {q.quantity.toLocaleString()} cans ({q.estimatedUnitCost})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
