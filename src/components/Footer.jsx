import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const year = new Date().getFullYear();

  const links = {
    Products: [
      { label: 'Automotive & Marine', view: 'shop', params: { category: 'Automotive & Marine' } },
      { label: 'Electronics & Precision', view: 'shop', params: { category: 'Electronics & Precision' } },
      { label: 'Industrial & Coatings', view: 'shop', params: { category: 'Industrial & Coatings' } },
      { label: 'Sanitization & Medical', view: 'shop', params: { category: 'Sanitization & Medical' } },
      { label: 'Art & Specialty', view: 'shop', params: { category: 'Art & Specialty' } },
    ],
    Company: [
      { label: 'About', view: 'about' },
      { label: 'Contact', view: 'contact' },
      { label: 'Safety & Compliance', view: 'faq' },
    ],
    Support: [
      { label: 'Track Order', view: 'track' },
      { label: 'FAQ', view: 'faq' },
      { label: 'Shipping Info', view: 'faq' },
      { label: 'Returns Policy', view: 'contact' },
    ],
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        marginTop: 'auto',
      }}
    >
      {/* Main footer grid */}
      <div
        className="container"
        style={{
          paddingTop: '64px',
          paddingBottom: '48px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '48px',
        }}
      >
        {/* Brand column */}
        <div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
              marginBottom: '16px',
            }}
          >
            Aerosol Webapp
          </div>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--color-text-muted)',
              maxWidth: '260px',
            }}
          >
            Precision aerosol formulations engineered for industrial, automotive, electronics, and medical applications.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-placeholder)', marginTop: '24px' }}>
            ISO 9001:2015 · DOT-SP Certified · UN1950 Compliant
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: '16px',
              }}
            >
              {heading}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map(({ label, view, params }) => (
                <li key={label}>
                  <button
                    onClick={() => onNavigate(view, params)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="container"
        style={{
          paddingBottom: '24px',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          © {year} Aerosol Webapp. All rights reserved.
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'SDS Library'].map((item) => (
            <button
              key={item}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
