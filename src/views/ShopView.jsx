import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X, Star } from 'lucide-react';

function Canister({ color = '#374151', height = 120 }) {
  const w = height * 0.38;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: w * 0.32, height: height * 0.06, backgroundColor: '#9ca3af', borderRadius: '2px 2px 0 0' }} />
      <div style={{ width: w * 0.75, height: height * 0.09, backgroundColor: '#d1d5db', borderRadius: '3px 3px 0 0' }} />
      <div
        style={{
          width: w,
          height: height * 0.72,
          background: `linear-gradient(175deg, ${color} 0%, ${color}cc 100%)`,
          borderRadius: '3px 3px 4px 4px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', left: '18%', top: '10%', bottom: '10%', width: '10%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '4px' }} />
      </div>
      <div style={{ width: w * 0.9, height: height * 0.05, backgroundColor: '#1f2937', borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

export default function ShopView({
  products = [],
  categories = [],
  initialCategory = 'All',
  initialSearch = '',
  onSelectProduct,
  onAddToCart,
  onAddToWishlist,
  wishlistIds = {},
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [maxPrice, setMaxPrice] = useState(70);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const allCategories = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = useMemo(() => {
    let res = products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      const matchStock = !inStockOnly || p.inStock;
      const matchRating = p.rating >= minRating;
      return matchCat && matchSearch && matchPrice && matchStock && matchRating;
    });

    if (sortBy === 'price-asc') res = [...res].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') res = [...res].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') res = [...res].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') res = [...res].sort((a, b) => b.reviewCount - a.reviewCount);

    return res;
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice, inStockOnly, minRating]);

  const hasFilters = maxPrice < 70 || inStockOnly || minRating > 0;

  return (
    <div>
      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div
          className="container"
          style={{ paddingTop: '40px', paddingBottom: '0' }}
        >
          <div className="section-label" style={{ marginBottom: '8px' }}>Catalog</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
              paddingBottom: '32px',
            }}
          >
            <div>
              <h1 className="text-h1">All Products</h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                {filtered.length} formulation{filtered.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </p>
            </div>
          </div>

          {/* Filter bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0px',
              borderTop: '1px solid var(--color-border)',
              overflowX: 'auto',
            }}
          >
            {/* Category pills */}
            {allCategories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  flexShrink: 0,
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  color: selectedCategory === cat ? 'var(--color-text)' : 'var(--color-text-muted)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: selectedCategory === cat ? '2px solid var(--color-text)' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                  marginBottom: '-1px',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                {cat}
              </button>
            ))}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Sort */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  border: 'none',
                  borderLeft: '1px solid var(--color-border)',
                  borderRadius: 0,
                  padding: '12px 36px 12px 16px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                }}
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={12} strokeWidth={2} color="var(--color-text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 16px',
                fontSize: '13px',
                color: showFilters ? 'var(--color-text)' : 'var(--color-text-muted)',
                backgroundColor: showFilters ? 'var(--color-bg-subtle)' : 'transparent',
                border: 'none',
                borderLeft: '1px solid var(--color-border)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              Filters
              {hasFilters && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-text)',
                    display: 'inline-block',
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div
          style={{
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-subtle)',
          }}
        >
          <div
            className="container"
            style={{
              paddingTop: '20px',
              paddingBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '40px',
              alignItems: 'flex-end',
            }}
          >
            {/* Search within category */}
            <div style={{ minWidth: '220px' }}>
              <label className="label">Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} strokeWidth={1.5} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search formulations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '32px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Price */}
            <div style={{ minWidth: '180px' }}>
              <label className="label">Max price: ${maxPrice}</label>
              <input
                type="range"
                min="15"
                max="70"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-text)', cursor: 'pointer' }}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="label">Min rating</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: minRating === r ? 600 : 400,
                      backgroundColor: minRating === r ? 'var(--color-text)' : 'var(--color-bg)',
                      color: minRating === r ? '#fff' : 'var(--color-text-secondary)',
                      border: '1px solid ' + (minRating === r ? 'var(--color-text)' : 'var(--color-border)'),
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div>
              <label
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}
              >
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ accentColor: 'var(--color-text)', width: '14px', height: '14px' }}
                />
                In stock only
              </label>
            </div>

            {/* Reset */}
            {hasFilters && (
              <button
                onClick={() => { setMaxPrice(70); setInStockOnly(false); setMinRating(0); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--color-text-muted)', cursor: 'pointer', textDecoration: 'underline', paddingBottom: '2px' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="container" style={{ paddingTop: '0', paddingBottom: '96px' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              No formulations match your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setMaxPrice(70);
                setInStockOnly(false);
                setMinRating(0);
              }}
              className="btn btn-neutral btn-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onSelectProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectProduct(product)}
              >
                {/* Image */}
                <div className="product-card__image-wrap">
                  <div className="product-card__canister" style={{ padding: '32px 0 24px' }}>
                    <Canister color={product.color || '#1e3a5f'} height={140} />
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
                  <div style={{ fontSize: '12px', color: 'var(--color-text-placeholder)', marginTop: '2px' }}>
                    {product.volume}
                  </div>
                  <div className="product-card__meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {product.rating} <span style={{ color: 'var(--color-text-placeholder)' }}>({product.reviewCount})</span>
                      </span>
                    </div>
                    <div className="product-card__price">${product.price?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
