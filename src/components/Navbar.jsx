import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Menu, 
  X,
  Gauge
} from 'lucide-react';
import { isSoundMuted, setSoundMuted } from '../utils/audio';

export default function Navbar({ 
  cartCount, 
  onOpenCart, 
  onOpenAdmin,
  activeSection,
  setActiveSection 
}) {
  const [muted, setMuted] = useState(isSoundMuted());
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudio = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setSoundMuted(newMuted);
  };

  const navLinks = [
    { name: 'Spray Lab 3D', href: '#spray-lab', icon: Sparkles },
    { name: 'Products', href: '#catalog', icon: Layers },
    { name: 'Precision Tech', href: '#technology', icon: Gauge },
    { name: 'B2B Formulator', href: '#b2b-formulator', icon: Sliders },
    { name: 'Safety & SDS', href: '#safety', icon: ShieldCheck },
    { name: 'Reviews', href: '#reviews', icon: Activity },
  ];

  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        transition: 'all 0.3s ease',
        background: scrolled 
          ? 'rgba(6, 9, 14, 0.92)' 
          : 'rgba(6, 9, 14, 0.65)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 242, 254, 0.12)',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '78px' }}>
        
        {/* Brand Logo */}
        <a 
          href="#" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            textDecoration: 'none', 
            color: '#fff' 
          }}
        >
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #0066ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
              position: 'relative'
            }}
          >
            <Sparkles size={22} color="#06090e" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.45rem', 
                fontWeight: 900, 
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #00f2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AEROVOX
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                padding: '2px 6px', 
                background: 'rgba(0, 242, 254, 0.15)', 
                border: '1px solid rgba(0,242,254,0.3)',
                borderRadius: '4px',
                color: '#00f2fe',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                PRO-AEROSOL
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block' }}>
              Engineered Propulsion Systems
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '22px', listStyle: 'none' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#94a3b8',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#00f2fe';
                      e.currentTarget.style.backgroundColor = 'rgba(0, 242, 254, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon size={15} />
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            title={muted ? 'Enable Aerosol Mist Sound Effects' : 'Mute Sound Effects'}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '10px',
              padding: '9px 12px',
              color: muted ? '#64748b' : '#00f2fe',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.2s ease',
            }}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span style={{ display: 'none' }} className="audio-label">
              {muted ? 'Muted' : 'Sound FX'}
            </span>
          </button>

          {/* Admin / Live Telemetry Toggle */}
          <button
            onClick={onOpenAdmin}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '10px',
              padding: '9px 14px',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.color = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.color = '#f8fafc';
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#10b981', 
              boxShadow: '0 0 10px #10b981',
              display: 'inline-block' 
            }}></span>
            <span>Live Telemetry</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="btn-primary"
            style={{
              padding: '10px 18px',
              fontSize: '0.9rem',
              position: 'relative'
            }}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span 
                style={{
                  background: '#ff007a',
                  color: '#fff',
                  borderRadius: '999px',
                  padding: '2px 7px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  boxShadow: '0 0 10px rgba(255, 0, 122, 0.8)'
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'none',
              padding: '6px'
            }}
            className="mobile-hamburger"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            background: 'rgba(6, 9, 14, 0.98)',
            borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
            padding: '20px 24px',
            backdropFilter: 'blur(20px)'
          }}
        >
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      fontSize: '1.05rem',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <Icon size={18} color="#00f2fe" />
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Embedded CSS for responsive navbar */}
      <style>{`
        @media (min-width: 992px) {
          .desktop-nav {
            display: block !important;
          }
          .audio-label {
            display: inline !important;
          }
        }
        @media (max-width: 991px) {
          .mobile-hamburger {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
