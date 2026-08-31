import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Layers, 
  Droplet, 
  Sparkles, 
  Star,
  Compass,
  Thermometer,
  Gauge
} from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, sds, usage
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel-glow modal-content"
        style={{
          width: '100%',
          maxWidth: '850px',
          background: 'rgba(9, 14, 24, 0.96)',
          position: 'relative',
          padding: '0',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-neon" style={{ background: `${product.color}20`, color: product.color, borderColor: `${product.color}50` }}>
              {product.category}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              SKU: {product.id.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 122, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Overview Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Visual Canister Hero Box */}
            <div 
              style={{
                background: `radial-gradient(circle at center, ${product.color}20 0%, rgba(6, 9, 14, 0.8) 75%)`,
                borderRadius: '16px',
                border: `1px solid ${product.color}30`,
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                position: 'relative'
              }}
            >
              {/* Canister Art */}
              <div 
                style={{
                  width: '68px',
                  height: '190px',
                  borderRadius: '14px 14px 8px 8px',
                  background: `linear-gradient(135deg, #1e293b 0%, ${product.color} 50%, #0f172a 100%)`,
                  boxShadow: `0 0 40px ${product.color}60`,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '10px',
                  border: '1px solid rgba(255,255,255,0.4)'
                }}
              >
                <div 
                  style={{
                    width: '18px',
                    height: '14px',
                    background: '#fff',
                    borderRadius: '4px 4px 0 0',
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 0 12px #fff'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 900, fontFamily: 'var(--font-heading)', textAlign: 'center', marginTop: '20px' }}>
                  AEROVOX
                </div>
                <div style={{ fontSize: '0.65rem', color: '#fff', textAlign: 'center', fontWeight: 700 }}>
                  {product.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  {product.pressureBar} BAR
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <span className="badge-neon" style={{ fontSize: '0.72rem' }}>
                  {product.volume}
                </span>
                <span className="badge-neon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', fontSize: '0.72rem' }}>
                  {product.voc}
                </span>
              </div>
            </div>

            {/* Product Title, Price & Quick Stats */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                {product.name}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px' }}>
                {product.tagline}
              </p>

              {/* Price & Rating */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>
                  ${product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through' }}>
                    ${product.comparePrice.toFixed(2)}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffd200', marginLeft: 'auto' }}>
                  <Star size={16} fill="#ffd200" color="#ffd200" />
                  <span style={{ fontWeight: 700 }}>{product.rating}</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '14px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Chamber Pressure:</span>
                  <strong style={{ color: '#00f2fe' }}>{product.pressureBar} BAR</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Optimal Distance:</span>
                  <strong style={{ color: '#fff' }}>{product.optimalDistance}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Dry / Cure Time:</span>
                  <strong style={{ color: '#fff' }}>{product.dryTime}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Propellant Type:</span>
                  <strong style={{ color: '#10b981' }}>{product.propellant.split('(')[0]}</strong>
                </div>
              </div>

              {/* Quantity and Cart Bar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ background: 'transparent', border: 'none', color: '#fff', width: '36px', height: '42px', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', width: '36px', height: '42px', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    fontSize: '0.95rem',
                    background: isAdded ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined
                  }}
                >
                  {isAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
                  <span>{isAdded ? 'Added to Cart' : `Add ${quantity} to Cart ($${(product.price * quantity).toFixed(2)})`}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Tab Navigation */}
          <div 
            style={{
              display: 'flex',
              gap: '12px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
              paddingBottom: '12px'
            }}
          >
            {[
              { id: 'overview', name: 'Engineering Overview', icon: Layers },
              { id: 'sds', name: 'Safety Data Sheet (SDS / VOC)', icon: ShieldCheck },
              { id: 'usage', name: 'Application & Distance Guide', icon: Droplet },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                    border: `1px solid ${activeTab === tab.id ? '#00f2fe' : 'transparent'}`,
                    color: activeTab === tab.id ? '#00f2fe' : '#94a3b8',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-heading)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {product.description}
                </p>

                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                    Key Performance Attributes:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {product.features.map((feat, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          background: 'rgba(15, 23, 42, 0.5)', 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.85rem',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <Check size={16} color="#00f2fe" />
                        <span style={{ color: '#e2e8f0' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sds' && (
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff007a', marginBottom: '16px' }}>
                  <AlertTriangle size={20} />
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff' }}>
                    Technical & HazMat Regulatory Compliance
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>UN HazMat Code:</span>
                    <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{product.sds?.unNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Chemical / CAS Spec:</span>
                    <strong style={{ color: '#fff' }}>{product.sds?.casNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Storage Temp Limit:</span>
                    <strong style={{ color: '#ffd200' }}>{product.sds?.storageTemp}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Required PPE:</span>
                    <strong style={{ color: '#10b981' }}>{product.sds?.ppe}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Certified Cleanroom Pressurization • Zero Ozone Depletion Potential (ODP)
                  </span>
                  <a 
                    href="#download-sds" 
                    onClick={(e) => { e.preventDefault(); alert(`Downloading official PDF SDS Sheet for ${product.name}...`); }}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    <FileText size={14} />
                    <span>Download SDS PDF</span>
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {product.applicationTips.map((tip, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      alignItems: 'flex-start',
                      background: 'rgba(15, 23, 42, 0.5)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 242, 254, 0.1)'
                    }}
                  >
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(0, 242, 254, 0.15)',
                        color: '#00f2fe',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
