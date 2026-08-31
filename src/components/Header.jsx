import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Heart } from 'lucide-react';

export default function Header({
  currentView,
  onNavigate,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenSearch,
  currentUser,
  onOpenAuth,
  onLogout,
  categories = []
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on navigation
  const nav = (view, params) => {
    onNavigate(view, params);
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const isActive = (view) => currentView === view;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 800,
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'box-shadow 200ms ease',
          boxShadow: scrolled ? '0 1px 0 var(--color-border)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => nav('home')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
            aria-label="Aerosol Webapp Home"
          >
            {/* Wordmark */}
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--color-text)',
                lineHeight: 1,
              }}
            >
              Aerosol Webapp
            </span>
          </button>

          {/* Desktop Center Navigation */}
          <nav
            className="hidden-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '0px' }}
          >
            {[
              { label: 'Products', view: 'shop' },
              { label: 'About', view: 'about' },
              { label: 'Safety', view: 'faq' },
              { label: 'Contact', view: 'contact' },
            ].map(({ label, view }) => (
              <button
                key={view}
                onClick={() => nav(view)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 14px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: isActive(view) ? 'var(--color-text)' : 'var(--color-text-muted)',
                  transition: 'color var(--transition-fast)',
                  lineHeight: 1,
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive(view)
                    ? 'var(--color-text)'
                    : 'var(--color-text-muted)')
                }
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="btn btn-ghost btn-sm hidden-mobile"
              aria-label="Search"
              style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => nav('wishlist')}
              className="btn btn-ghost btn-sm hidden-mobile"
              aria-label="Wishlist"
              style={{ padding: '8px', borderRadius: 'var(--radius-sm)', position: 'relative' }}
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-text)',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth();
                  } else {
                    setUserMenuOpen((v) => !v);
                  }
                }}
                className="btn btn-ghost btn-sm hidden-mobile"
                aria-label="Account"
                style={{ padding: '8px', borderRadius: 'var(--radius-sm)' }}
              >
                <User size={18} strokeWidth={1.5} />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && currentUser && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 100,
                    animation: 'slideUp 150ms ease',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                      }}
                    >
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {currentUser.email}
                    </div>
                  </div>

                  {[
                    { label: 'My Account', view: 'account' },
                    { label: 'Order History', view: 'account' },
                    { label: 'Track Shipment', view: 'track' },
                    ...(currentUser.role === 'admin'
                      ? [{ label: 'Admin Portal', view: 'admin' }]
                      : []),
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        nav(item.view);
                        setUserMenuOpen(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                        e.currentTarget.style.color = 'var(--color-text)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      {item.label}
                    </button>
                  ))}

                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: 'var(--color-error)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--color-error-bg)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="btn btn-neutral btn-sm"
              aria-label={`Cart ${cartCount > 0 ? `(${cartCount})` : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                marginLeft: '4px',
              }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1 }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="btn btn-ghost btn-sm hidden-desktop"
              aria-label="Menu"
              style={{ padding: '8px', marginLeft: '4px' }}
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setMobileOpen(false)}
            style={{ zIndex: 790 }}
          />
          <div
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              backgroundColor: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              zIndex: 795,
              padding: '16px 20px 24px',
              animation: 'slideUp 150ms ease',
            }}
          >
            <button
              onClick={onOpenSearch}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <Search size={16} strokeWidth={1.5} />
              <span>Search products...</span>
            </button>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { label: 'Products', view: 'shop' },
                { label: 'Wishlist', view: 'wishlist' },
                { label: 'About', view: 'about' },
                { label: 'Safety & FAQ', view: 'faq' },
                { label: 'Contact', view: 'contact' },
                ...(currentUser ? [{ label: 'My Account', view: 'account' }] : []),
              ].map(({ label, view }) => (
                <button
                  key={view}
                  onClick={() => nav(view)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 4px',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: 'var(--color-text)',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              {currentUser ? (
                <button
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="btn btn-neutral btn-md btn-full"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                    className="btn btn-inverted btn-md btn-full"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
