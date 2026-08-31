import React, { useState, useRef } from 'react';
import { Star, ShieldCheck, CheckCircle2, Sparkles, Building2, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Chief Engineer Marcus Sterling',
    role: 'Aerospace Composite Division, NovaAero Dynamics',
    rating: 5,
    date: 'Verified Enterprise Purchase',
    avatar: 'MS',
    color: '#00f2fe',
    text: 'The CERAMAX 9H aerosol shield delivered an exact 12-micron uniform ceramic matrix across our carbon-fiber winglet fairings. The 360° inversion valve allowed inverted coating inside tight avionics bays without any sputter or pressure drop.',
  },
  {
    id: 2,
    name: 'Dr. Evelyn Chen',
    role: 'Sterile Systems Director, Apex BioTech Labs',
    rating: 5,
    date: 'Verified B2B Medical Partner',
    avatar: 'EC',
    color: '#8b5cf6',
    text: 'VAPOR-PURE total-release foggers cut our cleanroom decontamination turnaround time by 65%. The 5-micron dry mist leaves zero liquid residue on our sensitive optical spectrometers while achieving proven 6-log pathogen inactivation.',
  },
  {
    id: 3,
    name: 'Dominic Russo',
    role: 'Master Fabricator, Rosso Corsa Performance',
    rating: 5,
    date: 'Verified Commercial Restorer',
    avatar: 'DR',
    color: '#ff007a',
    text: 'PYROGUARD 1200°C ceramic enamel is by far the highest quality aerosol coating we have ever tested on turbo manifolds. After 40 heat cycles at 950°C on the dyno, the finish remains deep, unblemished, and zero flaking.',
  },
];

export default function Testimonials() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);

  const handleDrag = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
    setSliderPos(percentage);
  };

  return (
    <section 
      id="reviews" 
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
            <span>Proven Engineering Case Studies</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>
            Visual Proof & <span className="gradient-text-cyan">Industry Testimonials</span>
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Drag the comparison slider below to inspect the microscopic nano-coating transformation on industrial test substrates.
          </p>
        </div>

        {/* Interactive Before & After Slider Box */}
        <div 
          className="glass-panel"
          style={{
            padding: '28px',
            background: 'rgba(10, 15, 26, 0.85)',
            marginBottom: '50px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Microscopic Surface Analysis (9H CERAMAX Shield vs Untreated Alloy)
            </span>
            <span style={{ fontSize: '0.8rem', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              Drag Slider to Compare
            </span>
          </div>

          <div
            ref={containerRef}
            onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
            onTouchMove={handleDrag}
            onClick={handleDrag}
            style={{
              position: 'relative',
              width: '100%',
              height: '280px',
              borderRadius: '14px',
              overflow: 'hidden',
              cursor: 'ew-resize',
              userSelect: 'none',
              border: '1px solid rgba(0, 242, 254, 0.2)'
            }}
          >
            {/* Left Side: Untreated Weathered Surface */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: '40px',
                backgroundImage: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 10%, transparent 20%), radial-gradient(circle, rgba(100, 116, 139, 0.4) 15%, transparent 25%)',
                backgroundSize: '30px 30px, 40px 40px'
              }}
            >
              <div 
                style={{
                  background: 'rgba(6, 9, 14, 0.85)',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  maxWidth: '240px'
                }}
              >
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Untreated Bare Alloy
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  Microscopic pores, corrosive pitting, water stagnation, friction coefficient 0.65
                </div>
              </div>
            </div>

            {/* Right Side: AeroVox 9H Coated Surface (Clipped by slider position) */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
                background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '40px',
                boxShadow: 'inset 0 0 50px rgba(0, 242, 254, 0.2)'
              }}
            >
              <div 
                style={{
                  background: 'rgba(6, 9, 14, 0.9)',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 242, 254, 0.5)',
                  maxWidth: '250px',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)'
                }}
              >
                <div style={{ color: '#00f2fe', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} />
                  <span>AEROVOX 9H Ceramic</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
                  118° superhydrophobic beading, 9H scratch armor, sealed nano-barrier, friction 0.02
                </div>
              </div>
            </div>

            {/* Vertical Drag Handle Divider */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPos}%`,
                width: '3px',
                background: '#00f2fe',
                boxShadow: '0 0 15px #00f2fe, 0 0 30px #00f2fe',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#00f2fe',
                  color: '#030712',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  boxShadow: '0 0 20px rgba(0, 242, 254, 0.8)'
                }}
              >
                ⟷
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Cards Grid */}
        <div className="grid-responsive-3">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="glass-panel"
              style={{
                padding: '26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${review.color}`,
                background: 'rgba(10, 15, 26, 0.8)'
              }}
            >
              <div>
                {/* Rating and Quote Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '3px', color: '#ffd200' }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#ffd200" color="#ffd200" />
                    ))}
                  </div>
                  <Quote size={20} color="rgba(255,255,255,0.2)" />
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>
                  "{review.text}"
                </p>
              </div>

              {/* Reviewer Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: `${review.color}20`,
                    border: `1px solid ${review.color}`,
                    color: review.color,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {review.avatar}
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 700 }}>
                    {review.name}
                  </h4>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {review.role}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
