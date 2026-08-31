import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

const POPULAR = ['Ceramic Clear Coat', 'Dielectric Cleaner', 'Thermal Enamel', 'Dry Lubricant', 'Hospital Fogger'];

export default function SearchModal({ isOpen, onClose, products = [], onSelectProduct, onSearchAll }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.sku?.toLowerCase().includes(query.toLowerCase()) ||
          p.tagline?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay"
        onClick={onClose}
        style={{ zIndex: 900, backdropFilter: 'blur(2px)' }}
      />

      {/* Search Panel — drops from top */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 950,
          animation: 'slideUp 150ms ease',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Search Input Row */}
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            height: '64px',
          }}
        >
          <Search size={20} strokeWidth={1.5} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search aerosol formulations, SKUs, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onSearchAll(query.trim());
                onClose();
              }
            }}
            style={{
              flex: 1,
              fontSize: '16px',
              fontWeight: 400,
              color: 'var(--color-text)',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-family)',
            }}
          />
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close search"
            style={{ padding: '6px', flexShrink: 0 }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--color-border)' }} />

        {/* Results or Popular */}
        <div className="container" style={{ paddingTop: '16px', paddingBottom: '20px' }}>
          {results.length > 0 ? (
            <div>
              <div className="section-label" style={{ marginBottom: '12px' }}>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { onSelectProduct(product); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--color-border)',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color var(--transition-fast)',
                      borderRadius: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                      e.currentTarget.style.marginLeft = '-20px';
                      e.currentTarget.style.marginRight = '-20px';
                      e.currentTarget.style.paddingLeft = '20px';
                      e.currentTarget.style.paddingRight = '20px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.marginLeft = '';
                      e.currentTarget.style.marginRight = '';
                      e.currentTarget.style.paddingLeft = '';
                      e.currentTarget.style.paddingRight = '';
                    }}
                  >
                    {/* Canister thumbnail */}
                    <div
                      style={{
                        width: '40px',
                        height: '52px',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {product.sku?.split('-')[1] || 'SKU'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {product.category}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </div>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', flexShrink: 0 }}>
                      ${product.price?.toFixed(2)}
                    </div>
                  </button>
                ))}

                {/* See all results */}
                <button
                  onClick={() => { onSearchAll(query); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    marginTop: '4px',
                  }}
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="section-label" style={{ marginBottom: '12px' }}>Popular searches</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); }}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast), color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
