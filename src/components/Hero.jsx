import React, { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Droplets, Compass } from 'lucide-react';

export default function Hero({ onExploreLab, onExploreCatalog }) {
  const canvasRef = useRef(null);

  // Dynamic ambient aerosol particle cloud simulation in hero background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 0.8,
        vx: (Math.random() - 0.5) * 0.4 + 0.2,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        color: i % 3 === 0 ? 'rgba(0, 242, 254, ' : i % 3 === 1 ? 'rgba(255, 0, 122, ' : 'rgba(16, 185, 129, ',
        alpha: Math.random() * 0.45 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.003;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(0.65, p.alpha))})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color.includes('242') ? '#00f2fe' : '#ff007a';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '70px 0 50px',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.85
        }}
      />

      <div className="app-container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '1000px' }}>
        
        {/* Top Feature Pill */}
        <div style={{ display: 'inline-flex', marginBottom: '24px' }}>
          <div 
            className="badge-neon animate-pulse-glow"
            style={{ 
              padding: '8px 18px', 
              fontSize: '0.85rem',
              backdropFilter: 'blur(10px)',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.4)'
            }}
          >
            <Sparkles size={16} />
            <span>Next-Generation Aerosol Propulsion & Nano-Atomization</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: '24px'
          }}
        >
          Precision Mist. <br />
          <span className="gradient-text-cyan">Engineered Performance.</span>
        </h1>

        {/* Subtitle */}
        <p 
          style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Discover cutting-edge aerosol solutions for aerospace, industrial coatings, dielectric electronics, and medical-grade sanitization. Powered by low-VOC eco-propellants and 360° all-angle atomizers.
        </p>

        {/* CTAs */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '50px'
          }}
        >
          <button
            onClick={onExploreLab}
            className="btn-primary"
            style={{
              padding: '16px 32px',
              fontSize: '1.05rem',
              borderRadius: '14px'
            }}
          >
            <Sparkles size={20} />
            <span>Launch 3D Spray Simulator</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreCatalog}
            className="btn-secondary"
            style={{
              padding: '16px 30px',
              fontSize: '1.05rem',
              borderRadius: '14px'
            }}
          >
            <span>Explore High-Pressure Catalog</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div 
          className="glass-panel"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            padding: '24px 28px',
            background: 'rgba(10, 15, 26, 0.75)',
            border: '1px solid rgba(0, 242, 254, 0.2)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#00f2fe', marginBottom: '4px' }}>
              <Droplets size={18} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800 }}>12-15 µm</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Micro-Vapor Atomization
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ff007a', marginBottom: '4px' }}>
              <Compass size={18} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800 }}>360°</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All-Angle Ball Valve
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#10b981', marginBottom: '4px' }}>
              <ShieldCheck size={18} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800 }}>0% ODP</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Eco-HFO Propellants
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ffd200', marginBottom: '4px' }}>
              <Zap size={18} />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', fontWeight: 800 }}>99.98%</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pressure Integrity
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
