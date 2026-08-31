import React from 'react';
import { ArrowRight } from 'lucide-react';

const MILESTONES = [
  { year: '2011', event: 'Founded in Seattle with a single product line: industrial lubricant aerosols.' },
  { year: '2014', event: 'Achieved ISO 9001:2015 certification across all manufacturing operations.' },
  { year: '2017', event: 'Launched 360° all-angle dual-port valve technology — industry first at this price point.' },
  { year: '2019', event: 'Expanded to aerospace-grade Nano-Ceramic and HFO eco-propellant formulations.' },
  { year: '2022', event: 'Achieved full CARB 2026 and EU REACH compliance across all product categories.' },
  { year: '2024', event: 'Over 2.4 million canisters shipped annually across 36 countries.' },
];

const TEAM = [
  { name: 'Dr. H. Narayanan', role: 'CEO & Chief Formulation Chemist', bio: 'PhD Polymer Chemistry, MIT. 20 years in aerosol coatings R&D.' },
  { name: 'Elena Markova', role: 'VP of Engineering', bio: 'MS Materials Science, CalTech. Holds 12 patents in micro-emulsion propellant systems.' },
  { name: 'James Okafor', role: 'Director of Global Compliance', bio: 'Former OSHA chemical safety inspector. Expert in UN HazMat, REACH, and CARB standards.' },
];

export default function AboutView({ onNavigate }) {
  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '0', overflow: 'hidden' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Company</div>
          <h1 className="text-display" style={{ maxWidth: '720px', marginBottom: '24px' }}>
            Engineering precision aerosols since 2011.
          </h1>
          <p className="text-large" style={{ maxWidth: '560px', marginBottom: '64px' }}>
            Aerosol Webapp develops professional-grade formulations for aerospace, automotive, electronics, and medical applications — from our cleanroom facility in Seattle, WA.
          </p>

          {/* Stats strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {[
              { stat: '2.4M+', label: 'Canisters shipped annually' },
              { stat: '36', label: 'Countries served' },
              { stat: '28', label: 'Active formulations' },
              { stat: 'ISO', label: '9001:2015 certified' },
            ].map(({ stat, label }) => (
              <div
                key={stat}
                style={{
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '32px',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: '4px' }}>
                  {stat}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div
          className="container"
          style={{
            paddingTop: '80px',
            paddingBottom: '80px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: '16px' }}>Mission</div>
            <h2 className="text-h2" style={{ marginBottom: '20px' }}>
              Formulated for the most demanding environments.
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              From NASA spacecraft coatings to hospital cleanroom sterilization, our aerosols are trusted in environments where failure is not acceptable. Every formulation is tested in-house under real-world conditions before release.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              We believe in transparency: every product comes with a complete GHS Safety Data Sheet, and our eco-propellant program means you're not trading performance for environmental responsibility.
            </p>
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: '16px' }}>Values</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { title: 'Precision first', desc: 'Every formulation is water-bath tested at 100% before leaving our facility.' },
                { title: 'Environmental stewardship', desc: 'Zero-ODP propellants, GWP < 1, CARB 2026 and EU REACH compliant across the board.' },
                { title: 'Radical transparency', desc: 'Full SDS documentation and propellant chemistry published for every product.' },
              ].map((v, i, arr) => (
                <div
                  key={v.title}
                  style={{
                    padding: '20px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px' }}>{v.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>History</div>
          <h2 className="text-h2" style={{ marginBottom: '48px' }}>Milestones</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {MILESTONES.map(({ year, event }, idx) => (
              <div
                key={year}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '32px',
                  padding: '20px 0',
                  borderBottom: idx < MILESTONES.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'baseline',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                  {year}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {event}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="section-label" style={{ marginBottom: '12px' }}>Leadership</div>
          <h2 className="text-h2" style={{ marginBottom: '48px' }}>The team</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {TEAM.map((member) => (
              <div
                key={member.name}
                style={{
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '32px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-muted)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '20px',
                  }}
                >
                  {member.name[0]}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {member.role}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '8px' }}>Work with us</div>
              <h2 className="text-h3">Have a custom formulation requirement?</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button onClick={() => onNavigate('contact')} className="btn btn-inverted btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Contact our engineers
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
              <button onClick={() => onNavigate('shop')} className="btn btn-neutral btn-lg">
                Browse products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
