import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Star, 
  Check, 
  SlidersHorizontal, 
  Eye, 
  Droplet, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

export default function ProductGrid({ 
  products, 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onOpenProductModal, 
  onAddToCart 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [addedIds, setAddedIds] = useState({});

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <section 
      id="catalog" 
      style={{ 
        padding: '80px 0',
        position: 'relative' 
      }}
    >
      <div className="app-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-neon" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>Industrial & Consumer Formulations</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>
            Engineered <span className="gradient-text-cyan">Aerosol Catalog</span>
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Lab-tested pressurized spray formulations engineered with eco-propellants, 360° valves, and zero-compromise active ingredients.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div 
          className="glass-panel"
          style={{
            padding: '20px',
            marginBottom: '36px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 26, 0.75)'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
            <Search 
              size={18} 
              color="#64748b" 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search by name, spec, or CAS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '42px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Category Chips */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap', 
              alignItems: 'center',
              flex: '2 1 auto' 
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #00f2fe 0%, #0088ff 100%)' : 'rgba(15, 23, 42, 0.6)',
                  color: selectedCategory === cat ? '#030712' : '#94a3b8',
                  border: `1px solid ${selectedCategory === cat ? 'transparent' : 'rgba(148, 163, 184, 0.2)'}`,
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} color="#64748b" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input"
              style={{ padding: '8px 12px', fontSize: '0.85rem', width: 'auto', cursor: 'pointer' }}
            >
              <option value="popular">Featured Formulas</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div 
            className="glass-panel" 
            style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}
          >
            <Droplet size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>No Formulations Found</h3>
            <p>Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid-responsive-3">
            {filteredProducts.map((product) => {
              const isAdded = addedIds[product.id];

              return (
                <div
                  key={product.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onClick={() => onOpenProductModal(product)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = product.color;
                    e.currentTarget.style.boxShadow = `0 12px 35px -10px ${product.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.15)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  {/* Top Badge & Rating */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span 
                      className="badge-neon" 
                      style={{ 
                        background: `${product.color}18`, 
                        color: product.color, 
                        borderColor: `${product.color}40` 
                      }}
                    >
                      {product.badge}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffd200', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Star size={14} fill="#ffd200" color="#ffd200" />
                      <span>{product.rating}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* Visual Aerosol Can Graphic Preview */}
                  <div 
                    style={{
                      height: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `radial-gradient(circle at center, ${product.color}15 0%, rgba(6, 9, 14, 0.4) 70%)`,
                      borderRadius: '14px',
                      marginBottom: '18px',
                      position: 'relative',
                    }}
                  >
                    {/* Simulated Canister Silhouette */}
                    <div 
                      style={{
                        width: '46px',
                        height: '130px',
                        borderRadius: '10px 10px 6px 6px',
                        background: `linear-gradient(135deg, #1e293b 0%, ${product.color} 50%, #0f172a 100%)`,
                        boxShadow: `0 0 25px ${product.color}50`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '6px',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {/* Nozzle cap */}
                      <div 
                        style={{
                          width: '14px',
                          height: '12px',
                          background: '#fff',
                          borderRadius: '3px 3px 0 0',
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          boxShadow: '0 0 8px #fff'
                        }}
                      />
                      <div style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 900, fontFamily: 'var(--font-heading)', textAlign: 'center', marginTop: '14px' }}>
                        AERO
                      </div>
                      <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                        {product.pressureBar} BAR
                      </div>
                    </div>

                    {/* Volume Tag */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '12px',
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(6, 9, 14, 0.8)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {product.volume}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.75rem', color: product.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '4px' }}>
                      {product.category}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.4, height: '38px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.tagline}
                    </p>
                  </div>

                  {/* Key Feature Specs */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Propellant:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{product.propellant.split('(')[0]}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>VOC Rating:</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{product.voc}</span>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 900, color: '#fff' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.comparePrice && (
                          <span style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'line-through' }}>
                            ${product.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                        In Stock ({product.stockCount} units)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProductModal(product);
                        }}
                        title="View Full Technical Specs & SDS"
                        className="btn-secondary"
                        style={{ padding: '9px 12px', borderRadius: '10px' }}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="btn-primary"
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          background: isAdded ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined
                        }}
                      >
                        {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                        <span>{isAdded ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
