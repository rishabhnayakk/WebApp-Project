import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

/* -------------------------------------------------------
   Reusable: Canister illustration (SVG-like CSS art)
   ------------------------------------------------------- */
function Canister({ color = '#374151', height = 120, label = '' }) {
  const w = height * 0.38;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
      {/* Nozzle */}
      <div
        style={{
          width: w * 0.32,
          height: height * 0.06,
          backgroundColor: '#9ca3af',
          borderRadius: '2px 2px 0 0',
        }}
      />
      {/* Actuator cap */}
      <div
        style={{
          width: w * 0.75,
          height: height * 0.09,
          backgroundColor: '#d1d5db',
          borderRadius: '3px 3px 0 0',
        }}
      />
      {/* Body */}
      <div
        style={{
          width: w,
          height: height * 0.72,
          background: `linear-gradient(175deg, ${color} 0%, ${color}cc 50%, ${color}99 100%)`,
          borderRadius: '3px 3px 4px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Highlight stripe */}
        <div
          style={{
            position: 'absolute',
            left: '18%',
            top: '10%',
            bottom: '10%',
            width: '10%',
            backgroundColor: 'rgba(255,255,255,0.14)',
            borderRadius: '4px',
          }}
        />
        {label && (
          <span
            style={{
              fontSize: Math.max(7, height * 0.065) + 'px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.05em',
              textAlign: 'center',
              padding: '0 4px',
              lineHeight: 1.2,
            }}
          >
            {label}
          </span>
        )}
      </div>
      {/* Base */}
      <div
        style={{
          width: w * 0.9,
          height: height * 0.05,
          backgroundColor: '#1f2937',
          borderRadius: '0 0 3px 3px',
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------
   Product Card component (for homepage grid)
   ------------------------------------------------------- */
function ProductCard({ product, onClick, onAddToCart }) {
  return (
    <div
      className="product-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={product.name}
    >
      {/* Image area */}
      <div className="product-card__image-wrap">
        <div className="product-card__canister" style={{ padding: '32px 0 24px' }}>
          <Canister color={product.color || '#1e3a5f'} height={140} label={product.sku?.split('-')[1]} />
        </div>

        {/* Quick add */}
        <div className="product-card__quick-add">
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="btn btn-inverted btn-sm btn-full"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-card__info">
        <div className="product-card__category">{product.category}</div>
        <div className="product-card__name">{product.name}</div>
        <div className="product-card__meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          <div className="product-card__price">${product.price?.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   HOME VIEW
   ------------------------------------------------------- */
export default function HomeView({ products = [], onNavigate, onSelectProduct, onAddToCart }) {
  const featured = products.slice(0, 4);
  const collection = products.slice(0, 8);

  const categories = [
    { name: 'Automotive & Marine', count: 24, desc: 'Ceramic coatings, cavity wax, clear coats' },
    { name: 'Electronics & Precision', count: 18, desc: 'Dielectric cleaners, flux removers' },
    { name: 'Industrial & Coatings', count: 32, desc: 'Thermal enamel, dry film lubricants' },
    { name: 'Sanitization & Medical', count: 12, desc: 'Hospital-grade foggers, surface disinfectants' },
    { name: 'Art & Specialty', count: 15, desc: 'Low-pressure caps, chroma shift finishes' },
    { name: 'New Arrivals', count: 8, desc: 'Latest formulations just released' },
  ];

  const whyUs = [
    {
      label: '01',
      title: 'ISO Class 5 Cleanroom',
      body:
        'Every canister is filled in a particulate-controlled environment and 100% water-bath tested for structural integrity before leaving our facility.',
    },
    {
      label: '02',
      title: 'Zero-ODP Propellants',
      body:
        'We use Eco-HFO 1234ze and purified nitrogen — both with GWP < 1 — across our entire product line. CARB 2026 and EU REACH compliant.',
    },
    {
      label: '03',
      title: '360° All-Angle Valves',
      body:
        'Dual-port dip tube technology delivers consistent 12-micron atomization at any spray angle, including fully inverted application.',
    },
  ];

  const reviews = [
    {
      name: 'Dr. Marcus Sterling',
      role: 'Chief Engineer, NovaAero Dynamics',
      text: 'The CERAMAX 9H delivered a uniform 12-micron ceramic matrix across our carbon-fibre winglet fairings. No sputter, no pressure drop, even inverted.',
      product: 'CERAMAX™ 9H',
      rating: 5,
    },
    {
      name: 'Dr. Evelyn Chen',
      role: 'Sterile Systems Director, Apex BioTech',
      text: 'VAPOR-PURE cut our cleanroom decontamination time by 65%. Zero liquid residue on sensitive optical instruments, 6-log pathogen inactivation confirmed.',
      product: 'VAPOR-PURE™',
      rating: 5,
    },
    {
      name: 'Dominic Russo',
      role: 'Master Fabricator, Rosso Corsa Performance',
      text: 'PYROGUARD 1200°C is the highest quality thermal enamel we\'ve tested. After 40 dyno heat cycles, the finish remains deep and completely unblemished.',
      product: 'PYROGUARD™ 1200°C',
      rating: 5,
    },
  ];

  return (
    <main>
      {/* ================================================
          01 — HERO
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: '80px',
          paddingBottom: '0',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          {/* Overline */}
          <div className="section-label" style={{ marginBottom: '24px' }}>
            ISO 9001:2015 · DOT-SP Certified · UN1950 Compliant
          </div>

          {/* Headline */}
          <h1 className="text-display" style={{ maxWidth: '760px', marginBottom: '24px' }}>
            Precision aerosol engineering for every application.
          </h1>

          <p className="text-large" style={{ maxWidth: '520px', marginBottom: '40px' }}>
            Professional aerosol formulations for aerospace, automotive, electronics, and industrial applications — built with 360° all-angle valves and zero-ODP eco-propellants.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '72px' }}>
            <button
              onClick={() => onNavigate('shop')}
              className="btn btn-inverted btn-xl"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Explore products
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
            <button onClick={() => onNavigate('about')} className="btn btn-neutral btn-xl">
              About Aerosol Webapp
            </button>
          </div>

          {/* Product canister row */}
          <div
            style={{
              display: 'flex',
              gap: '0px',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {[
              { color: '#1e3a5f', label: 'CERAMAX', name: 'CERAMAX™ 9H', sub: 'Nano-Ceramic Coat', price: '$49.99' },
              { color: '#7c1d1d', label: 'PYROGRD', name: 'PYROGUARD™', sub: '1200°C Thermal', price: '$34.99' },
              { color: '#1e4d2b', label: 'ELECCLR', name: 'ELECTRICLEAN™', sub: 'Dielectric Flush', price: '$28.99' },
              { color: '#3d1a5c', label: 'VAPOR', name: 'VAPOR-PURE™', sub: 'Hospital Fogger', price: '$44.99' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const p = products[idx];
                  if (p) onSelectProduct(p);
                  else onNavigate('shop');
                }}
                style={{
                  flex: 1,
                  borderRight: '1px solid var(--color-border)',
                  padding: '40px 24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                  backgroundColor: 'var(--color-bg)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
              >
                <Canister color={item.color} height={160} label={item.label} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    {item.sub}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {item.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          02 — CATEGORY NAVIGATION
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div className="section-label">Browse</div>
              <h2 className="text-h2">Shop by category</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="btn btn-neutral btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              All products
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="category-cell"
                onClick={() => onNavigate('shop', { category: cat.name })}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {cat.count} formulas
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {cat.desc}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    marginTop: '8px',
                    transition: 'color var(--transition-fast)',
                  }}
                  className="cat-cta"
                >
                  Shop now <ArrowRight size={12} strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          03 — FEATURED PRODUCTS
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div className="section-label">Featured</div>
              <h2 className="text-h2">Best-selling formulations</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="btn btn-neutral btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              View all
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          {featured.length > 0 && (
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onSelectProduct(p)}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================
          04 — BRAND STATEMENT (editorial)
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing-lg)',
          paddingBottom: 'var(--section-spacing-lg)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <p
            style={{
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              color: 'var(--color-text)',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            "Aerosol products engineered for performance,
            reliability, and every industrial challenge —
            from the cleanroom to the field."
          </p>
          <div
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'var(--color-border-strong)',
              margin: '40px auto 0',
            }}
          />
        </div>
      </section>

      {/* ================================================
          05 — PRODUCT COLLECTION GRID
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <div className="section-label">Catalog</div>
              <h2 className="text-h2">Full product range</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="btn btn-neutral btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Browse catalog
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          {collection.length > 0 && (
            <div className="product-grid">
              {collection.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onSelectProduct(p)}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================
          06 — WHY CHOOSE US
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <div className="section-label">Why Aerosol Webapp</div>
            <h2 className="text-h2" style={{ maxWidth: '480px' }}>
              Manufacturing standards that set the benchmark.
            </h2>
          </div>

          {/* Three columns — text only, no icon cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0px',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {whyUs.map((item) => (
              <div
                key={item.label}
                style={{
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '40px 32px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '20px',
                  }}
                >
                  {item.label}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          07 — SAFETY & COMPLIANCE
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
          backgroundColor: 'var(--color-bg-subtle)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '80px',
              alignItems: 'center',
            }}
          >
            <div>
              <div className="section-label">Safety & Compliance</div>
              <h2 className="text-h2" style={{ marginBottom: '20px' }}>
                Every canister is certified before it ships.
              </h2>
              <p className="text-body" style={{ marginBottom: '32px' }}>
                All Aerosol Webapp aerosols comply with DOT 49 CFR HazMat regulations,
                OSHA Hazard Communication Standard (29 CFR 1910.1200), and full Safety
                Data Sheet (SDS/GHS) documentation is included with every order.
              </p>
              <button
                onClick={() => onNavigate('faq')}
                className="btn btn-neutral btn-md"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Safety documentation
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Compliance badges — text table */}
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              {[
                { std: 'UN1950', desc: 'Aerosols — Limited Quantity HazMat Classification' },
                { std: 'ISO 9001:2015', desc: 'Quality Management System Certified' },
                { std: 'CARB 2026', desc: 'California VOC Emission Standard Compliant' },
                { std: 'GHS/SDS', desc: 'Globally Harmonised Safety Data Sheets' },
                { std: 'DOT-SP', desc: 'Special Permit — Pressurized Ground Transport' },
                { std: 'EU REACH', desc: 'European Chemicals Regulation Compliant' },
              ].map((row, idx, arr) => (
                <div
                  key={row.std}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '14px 20px',
                    borderBottom: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-mono)',
                      whiteSpace: 'nowrap',
                      paddingTop: '1px',
                      minWidth: '100px',
                    }}
                  >
                    {row.std}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {row.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 800px) {
            section .container > div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
          }
        `}</style>
      </section>

      {/* ================================================
          08 — REVIEWS
          ================================================ */}
      <section
        style={{
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--section-spacing)',
          paddingBottom: 'var(--section-spacing)',
        }}
      >
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <div className="section-label">Testimonials</div>
            <h2 className="text-h2">Trusted by engineers worldwide.</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {reviews.map((rev) => (
              <div
                key={rev.name}
                style={{
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '32px',
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.65,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '24px',
                    fontStyle: 'italic',
                  }}
                >
                  "{rev.text}"
                </p>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {rev.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {rev.role}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      marginTop: '6px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {rev.product}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section div[style*="repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ================================================
          09 — FINAL CTA
          ================================================ */}
      <section
        style={{
          paddingTop: 'var(--section-spacing-lg)',
          paddingBottom: 'var(--section-spacing-lg)',
          backgroundColor: 'var(--color-text)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '24px',
            }}
          >
            Get started
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              maxWidth: '640px',
              margin: '0 auto 24px',
            }}
          >
            Ready to upgrade your aerosol program?
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Order online with same-day HazMat ground dispatch, or contact our engineers to discuss custom formulations.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('shop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                backgroundColor: '#ffffff',
                color: 'var(--color-text)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'opacity var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Browse catalog
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              style={{
                padding: '12px 28px',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast), color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Contact sales
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
