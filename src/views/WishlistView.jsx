import React, { useState } from 'react';
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';

function Canister({ color = '#374151', height = 100 }) {
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

export default function WishlistView({ wishlist = [], onNavigate, onSelectProduct, onRemoveFromWishlist, onAddToCart }) {
  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '32px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Saved</div>
          <h1 className="text-h2">
            Wishlist
            {wishlist.length > 0 && (
              <span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '12px' }}>
                ({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '96px' }}>
        {wishlist.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '96px 20px',
              textAlign: 'center',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <Heart size={48} strokeWidth={1} color="var(--color-border-hover)" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', marginBottom: '8px' }}>
              Nothing saved yet
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
              Browse our catalog and save formulations you're interested in.
            </p>
            <button onClick={() => onNavigate('shop')} className="btn btn-inverted btn-md">
              Browse products
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="product-card"
                role="button"
                tabIndex={0}
                onClick={() => onSelectProduct(product)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectProduct(product)}
              >
                <div className="product-card__image-wrap">
                  <div className="product-card__canister" style={{ padding: '32px 0 24px' }}>
                    <Canister color={product.color || '#1e3a5f'} height={140} />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(product.id); }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      opacity: 0.9,
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <X size={13} strokeWidth={1.5} color="var(--color-text-muted)" />
                  </button>

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

                <div className="product-card__info">
                  <div className="product-card__category">{product.category}</div>
                  <div className="product-card__name">{product.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-placeholder)', marginTop: '2px' }}>
                    {product.volume}
                  </div>
                  <div className="product-card__meta">
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {product.stockCount > 0 ? 'In stock' : 'Out of stock'}
                    </span>
                    <div className="product-card__price">${product.price?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {wishlist.length > 0 && (
          <div style={{ paddingTop: '32px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={() => wishlist.forEach((p) => onAddToCart(p))}
              className="btn btn-inverted btn-lg"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              Add all to cart
            </button>
            <button onClick={() => onNavigate('shop')} className="btn btn-neutral btn-lg">
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
