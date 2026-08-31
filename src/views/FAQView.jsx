import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_DATA = [
  {
    section: 'Products & Formulations',
    items: [
      {
        q: 'What propellant system do Aerosol Webapp aerosols use?',
        a: 'All Aerosol Webapp products use Eco-HFO 1234ze or purified nitrogen as the propellant — both with a Global Warming Potential (GWP) less than 1. This exceeds CARB 2026 and EU F-Gas regulation requirements. No HFC-134a or CFC propellants are used.',
      },
      {
        q: 'What is the difference between the standard and 360° all-angle valve formulations?',
        a: 'Standard valve products require upright orientation for consistent delivery. Products designated "360° All-Angle" use a dual-port dip tube that delivers consistent 12-micron atomization at any spray angle, including fully inverted — critical for cavity waxing, panel sealing, and underbody coatings.',
      },
      {
        q: 'Are your products CARB compliant?',
        a: 'Yes. All aerosol formulations have been tested to comply with California Air Resources Board (CARB) Aerosol Coatings Regulation, effective through 2026. VOC content is below 10% by weight across the product line, and all surface coating products are VOC-exempt where applicable.',
      },
      {
        q: 'What are the temperature limits for product storage?',
        a: 'All pressurized canisters must be stored between 0°C (32°F) and 50°C (122°F). Do not expose to direct sunlight or store near heat sources. Thermal Enamel products (e.g., PYROGUARD™) should be stored at room temperature (15–25°C) and used within 18 months of manufacture date printed on base.',
      },
    ],
  },
  {
    section: 'Safety & Compliance',
    items: [
      {
        q: 'Are Safety Data Sheets (SDS) available for all products?',
        a: 'Yes. Every Aerosol Webapp aerosol product has a full GHS-compliant Safety Data Sheet. SDS documents are available for download from individual product pages or by emailing sds@aerosolwebapp.com. SDS documentation is also included in every physical order.',
      },
      {
        q: 'What HazMat classification do aerosols fall under?',
        a: 'Pressurized aerosol canisters are classified as UN1950 — Aerosols under IATA, IMDG, and DOT 49 CFR HazMat regulations. This means air shipping is not available; all products ship via DOT-SP certified ground carriers only. Limited Quantity exemptions apply for small orders.',
      },
      {
        q: 'What PPE is required when using Aerosol Webapp aerosol products?',
        a: 'At minimum: safety glasses or chemical splash goggles, chemical-resistant gloves (nitrile recommended). For solvent-based formulations in enclosed spaces: half-face respirator with organic vapor cartridges (NIOSH-approved). Full PPE requirements are listed per-product in the SDS Section 8.',
      },
      {
        q: 'Can your products be used in cleanroom or ESD-sensitive environments?',
        a: 'Yes. Aerosol Webapp ELECTRICLEAN™ and ELECTROSHIELD™ product lines are formulated as ESD-safe and cleanroom-compatible. Electricians and electronics engineers should verify the dielectric strength rating matches their application voltage before use.',
      },
    ],
  },
  {
    section: 'Ordering & Shipping',
    items: [
      {
        q: 'Do you offer volume pricing?',
        a: 'Yes. Volume pricing is automatically applied at checkout: 8% discount for 6+ units (half-case), 15% discount for 12+ units (master case). For pallet orders (144+ units) or custom B2B contracts, contact your sales representative at sales@aerosolwebapp.com.',
      },
      {
        q: 'Why is air shipping not available?',
        a: 'Pressurized aerosol canisters classified under UN1950 are prohibited on passenger and cargo aircraft under IATA DGR regulations, except under very specific Excepted Quantity (EQ) provisions not applicable to retail quantities. All orders ship via DOT-SP certified ground freight.',
      },
      {
        q: 'What is your return policy?',
        a: 'Unused, sealed products in original packaging may be returned within 30 days of delivery with an approved Return Merchandise Authorization (RMA) code. HazMat handling fees apply for returns. Opened or partially-used products cannot be returned. Contact support@aerosolwebapp.com to initiate.',
      },
      {
        q: 'How long does HazMat ground shipping take?',
        a: 'Standard HazMat ground shipping takes 3–5 business days after same-day dispatch (for orders placed before 2:00 PM PST weekdays). Expedited 1–2 day ground and emergency next-day ground options are available at checkout for an additional fee.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4, flex: 1 }}>
          {q}
        </span>
        {open ? (
          <ChevronUp size={18} strokeWidth={1.5} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={18} strokeWidth={1.5} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div style={{ paddingBottom: '20px', paddingRight: '36px' }}>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQView() {
  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Help Center</div>
          <h1 className="text-h2">Frequently asked questions</h1>
          <p className="text-large" style={{ maxWidth: '520px', marginTop: '12px' }}>
            Technical and compliance questions about Aerosol Webapp aerosol formulations, storage, shipping, and safety.
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '0',
          paddingTop: '0',
          paddingBottom: '96px',
          alignItems: 'flex-start',
        }}
      >
        {/* Sidebar nav */}
        <div
          style={{
            borderRight: '1px solid var(--color-border)',
            paddingRight: '40px',
            paddingTop: '40px',
            position: 'sticky',
            top: '76px',
          }}
        >
          {FAQ_DATA.map(({ section }) => (
            <a
              key={section}
              href={`#faq-${section.replace(/\s+/g, '-').toLowerCase()}`}
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
                lineHeight: 1.4,
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              {section}
            </a>
          ))}
        </div>

        {/* FAQ sections */}
        <div style={{ paddingLeft: '64px', paddingTop: '40px' }}>
          {FAQ_DATA.map(({ section, items }) => (
            <div
              key={section}
              id={`faq-${section.replace(/\s+/g, '-').toLowerCase()}`}
              style={{ marginBottom: '56px' }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text)',
                  marginBottom: '4px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '32px',
                }}
              >
                {section}
              </h2>
              <div style={{ marginTop: '8px' }}>
                {items.map((item) => (
                  <FAQItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}

          {/* Contact CTA */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '28px 32px',
              backgroundColor: 'var(--color-bg-subtle)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
              Still have a question?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Our technical engineering team is available Mon–Fri 7 AM–6 PM PST. For HazMat emergencies, our 24/7 hotline is always on.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="mailto:support@aerosolwebapp.com" className="btn btn-inverted btn-md">
                Email support
              </a>
              <a href="tel:+18883465258" className="btn btn-neutral btn-md">
                +1 (888) 346-5258
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
