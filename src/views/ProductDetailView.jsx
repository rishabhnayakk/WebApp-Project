import React, { useState, useEffect } from 'react';
import { Star, Plus, Minus, Heart, ChevronRight, FileText, ArrowLeft, ThumbsUp } from 'lucide-react';
import { api } from '../utils/api';

function Canister({ color = '#374151', height = 200 }) {
  const w = height * 0.38;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: w * 0.32, height: height * 0.06, backgroundColor: '#9ca3af', borderRadius: '2px 2px 0 0' }} />
      <div style={{ width: w * 0.75, height: height * 0.09, backgroundColor: '#d1d5db', borderRadius: '3px 3px 0 0' }} />
      <div
        style={{
          width: w,
          height: height * 0.72,
          background: `linear-gradient(175deg, ${color}ff 0%, ${color}cc 60%, ${color}99 100%)`,
          borderRadius: '3px 3px 4px 4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: '16%', top: '8%', bottom: '8%', width: '12%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px' }} />
        <div style={{ position: 'absolute', left: '32%', top: '8%', bottom: '8%', width: '5%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
      </div>
      <div style={{ width: w * 0.9, height: height * 0.05, backgroundColor: '#111827', borderRadius: '0 0 4px 4px' }} />
    </div>
  );
}

const TABS = [
  { id: 'specs', label: 'Specifications' },
  { id: 'safety', label: 'Safety & SDS' },
  { id: 'usage', label: 'Usage Guide' },
  { id: 'shipping', label: 'Shipping' },
];

export default function ProductDetailView({
  product,
  onBackToShop,
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  isWishlisted,
  onSelectRelatedProduct,
}) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ avgRating: product?.rating, count: product?.reviewCount });
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setActiveTab('specs');

    api.getReviews(product.id).then((res) => {
      if (res.success) {
        setReviews(res.data || []);
        setRatingStats({ avgRating: res.avgRating || product.rating, count: res.count || product.reviewCount });
      }
    }).catch(() => {});
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '16px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            <button
              onClick={onBackToShop}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              Products
            </button>
            <ChevronRight size={12} color="var(--color-border-hover)" />
            <span style={{ color: 'var(--color-text-secondary)' }}>{product.category}</span>
            <ChevronRight size={12} color="var(--color-border-hover)" />
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main PDP — 2 column layout */}
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* LEFT — Product imagery */}
          <div
            style={{
              borderRight: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '560px',
              padding: '64px',
              position: 'sticky',
              top: '56px',
              alignSelf: 'flex-start',
            }}
          >
            <Canister color={product.color || '#1e3a5f'} height={280} />
          </div>

          {/* RIGHT — Product info */}
          <div style={{ padding: '48px' }}>
            {/* Category & SKU */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="section-label" style={{ margin: 0 }}>{product.category}</div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                {product.sku}
              </span>
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--color-text)',
                lineHeight: 1.15,
                marginBottom: '12px',
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill={i < Math.round(product.rating) ? '#f59e0b' : 'none'} color={i < Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {ratingStats.avgRating} · {ratingStats.count} reviews
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '24px' }} />

            {/* Price */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                  ${product.price?.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span style={{ fontSize: '16px', color: 'var(--color-text-placeholder)', textDecoration: 'line-through' }}>
                    ${product.comparePrice?.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {product.volume} · {product.stockCount > 0 ? `${product.stockCount} in stock` : 'Out of stock'}
              </div>
            </div>

            {/* Tagline / short description */}
            <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
              {product.tagline}
            </p>

            {/* Quantity + Add to Cart */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              {/* Quantity */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ background: 'none', border: 'none', padding: '0 12px', height: '44px', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '32px', textAlign: 'center', color: 'var(--color-text)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{ background: 'none', border: 'none', padding: '0 12px', height: '44px', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="btn btn-inverted"
                style={{ flex: 1, height: '44px', fontSize: '14px', fontWeight: 500 }}
              >
                {addedFeedback ? '✓ Added' : `Add to cart — $${(product.price * quantity).toFixed(2)}`}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => onAddToWishlist(product)}
                className="btn btn-neutral"
                style={{ height: '44px', padding: '0 12px', color: isWishlisted ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                aria-label="Wishlist"
              >
                <Heart size={16} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Buy Now */}
            <button
              onClick={() => { onAddToCart(product, quantity); onBuyNow(); }}
              className="btn btn-neutral btn-full"
              style={{ height: '44px', fontSize: '14px', fontWeight: 500 }}
            >
              Buy now
            </button>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '32px 0' }} />

            {/* Trust signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {[
                'HazMat certified ground shipping · UN1950 compliant packaging',
                '100% water-bath pressure tested before dispatch',
                '30-day returns on unopened canisters',
                'SDS documentation included with every order',
              ].map((line) => (
                <div key={line} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-border-strong)', fontWeight: 600 }}>—</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------
          TABBED INFORMATION SECTIONS
          ----------------------------------------------- */}
      <div className="container">
        {/* Tab nav */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-text)' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ paddingTop: '48px', paddingBottom: '64px', maxWidth: '760px' }}>
          {activeTab === 'specs' && (
            <div>
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '40px' }}>
                {product.description}
              </p>

              <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--color-text)', marginBottom: '20px' }}>
                Performance characteristics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {product.features?.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 0',
                      borderBottom: i < product.features.length - 1 ? '1px solid var(--color-border)' : 'none',
                      fontSize: '15px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span style={{ color: 'var(--color-border-strong)', flexShrink: 0 }}>—</span>
                    {f}
                  </div>
                ))}
              </div>

              {product.specifications && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '20px' }}>
                    Technical data
                  </h3>
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    {Object.entries(product.specifications).map(([key, val], idx, arr) => (
                      <div
                        key={key}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            borderRight: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-subtle)',
                          }}
                        >
                          {key}
                        </div>
                        <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div>
              <div
                style={{
                  padding: '16px 20px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  marginBottom: '32px',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: 'var(--color-text)' }}>Important:</strong> This product is classified as a hazardous material. Handle with appropriate PPE. Store below 50°C (122°F). Keep away from heat, sparks, and open flames.
              </div>

              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '32px',
                }}
              >
                {[
                  { label: 'UN HazMat Number', value: product.sds?.unNumber || 'UN1950' },
                  { label: 'Chemical / CAS', value: product.sds?.casNumber || 'See SDS §3' },
                  { label: 'Storage Temperature', value: product.sds?.storageTemp || '0°C to 50°C (32°F to 122°F)' },
                  { label: 'Required PPE', value: product.sds?.ppe || 'Safety glasses, chemical gloves' },
                  { label: 'Propellant System', value: product.propellant },
                  { label: 'VOC Rating', value: product.voc || '< 2.0% CARB Compliant' },
                  { label: 'Pressure (max)', value: product.pressureBar ? `${product.pressureBar} BAR at 20°C` : 'See SDS' },
                ].map(({ label, value }, idx, arr) => (
                  <div
                    key={label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 1fr',
                      borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        borderRight: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-subtle)',
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert(`Downloading official SDS PDF for ${product.name}`)}
                className="btn btn-neutral btn-md"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={15} strokeWidth={1.5} />
                Download Safety Data Sheet (SDS PDF)
              </button>
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <div
                style={{
                  padding: '14px 20px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '32px',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-subtle)',
                }}
              >
                Optimal spray distance: <strong style={{ color: 'var(--color-text)' }}>{product.optimalDistance || '20–25 cm'}</strong>
                {' · '}Shake vigorously for <strong style={{ color: 'var(--color-text)' }}>60 seconds</strong> before use
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {product.usageGuide?.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'flex-start',
                      padding: '20px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-muted)',
                        flexShrink: 0,
                        paddingTop: '2px',
                        minWidth: '24px',
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                  HazMat Ground Transportation
                </h3>
                <p>
                  All pressurized aerosol canisters ship as UN1950 Limited Quantity Hazardous Materials via certified ground carriers only. Air shipping is not available for pressurized products.
                </p>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                  30-Day Return Policy
                </h3>
                <p>
                  Unused, sealed canisters in original packaging may be returned within 30 days with an approved RMA code. Contact support@aerosolwebapp.com to initiate a return.
                </p>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                  Free Shipping Threshold
                </h3>
                <p>
                  Orders over $150 qualify for complimentary HazMat ground freight. Case volume pricing (6+ or 12+ units) is automatically applied at checkout.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews */}
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '64px', paddingBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
            <div>
              <div className="section-label">Social proof</div>
              <h2 className="text-h3">Customer reviews ({ratingStats.count})</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
                {ratingStats.avgRating}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ 5</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No reviews yet. Be the first to share your experience with this formulation.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reviews.map((rev, idx) => (
                <div
                  key={rev.id}
                  style={{
                    paddingTop: '32px',
                    paddingBottom: '32px',
                    borderBottom: idx < reviews.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? '#f59e0b' : 'none'} color={i < rev.rating ? '#f59e0b' : '#d1d5db'} />
                        ))}
                      </div>
                      {rev.title && (
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                          {rev.title}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {new Date(rev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                    {rev.comment}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <div>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{rev.customerName}</span>
                      {rev.role && <span> · {rev.role}</span>}
                      <span
                        style={{
                          marginLeft: '8px',
                          padding: '1px 6px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '11px',
                          backgroundColor: 'var(--color-bg-subtle)',
                        }}
                      >
                        Verified buyer
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        await api.voteReviewHelpful(rev.id).catch(() => {});
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                    >
                      <ThumbsUp size={12} strokeWidth={1.5} />
                      Helpful ({rev.helpfulCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
