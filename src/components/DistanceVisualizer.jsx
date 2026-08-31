import React, { useState } from 'react';
import { 
  Compass, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Thermometer, 
  Droplets, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { playCanisterShakeSound } from '../utils/audio';

export default function DistanceVisualizer() {
  const [distanceCm, setDistanceCm] = useState(22);
  const [shakeSecondsRemaining, setShakeSecondsRemaining] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Evaluate spray zone
  let status = 'optimal';
  let statusColor = '#10b981';
  let statusTitle = 'PERFECT OPTIMAL ATOMIZATION';
  let statusDesc = 'Nano-uniform droplet coalescence, mirror gloss leveling, and zero orange-peel.';
  let filmVisualClass = 'film-optimal';

  if (distanceCm < 16) {
    status = 'too-close';
    statusColor = '#ff007a';
    statusTitle = 'TOO CLOSE: RISK OF RUNS & SOLVENT POP';
    statusDesc = 'Excessive liquid build-up leads to sagging, drip marks, and trapped propellant bubbling.';
    filmVisualClass = 'film-close';
  } else if (distanceCm > 30) {
    status = 'too-far';
    statusColor = '#ffd200';
    statusTitle = 'TOO FAR: DRY SPRAY & DUSTING';
    statusDesc = 'Solvent evaporates in mid-air before impact, resulting in a rough, dry, porous finish.';
    filmVisualClass = 'film-far';
  }

  const startShakeTimer = () => {
    if (isShaking) return;
    setIsShaking(true);
    setShakeSecondsRemaining(5);

    playCanisterShakeSound();

    const interval = setInterval(() => {
      playCanisterShakeSound();
      setShakeSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsShaking(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <section 
      id="technology" 
      style={{ 
        padding: '80px 0',
        position: 'relative'
      }}
    >
      <div className="app-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-neon" style={{ marginBottom: '12px' }}>
            <Compass size={14} />
            <span>Application Engineering Guide</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>
            Precision <span className="gradient-text-cyan">Distance & Technique</span> Visualizer
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Aerosol finishes depend heavily on the velocity cone and atmospheric flash-off distance. Drag the interactive distance slider below to see how nozzle distance impacts the final film coat.
          </p>
        </div>

        {/* Main Interactive Widget */}
        <div 
          className="glass-panel"
          style={{
            padding: '32px',
            background: 'rgba(10, 15, 26, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.25)'
          }}
        >
          {/* Top Distance Slider Control */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Nozzle to Substrate Distance:
              </span>
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '1.25rem', 
                  fontWeight: 900, 
                  color: statusColor,
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${statusColor}40`
                }}
              >
                {distanceCm} cm ({Math.round(distanceCm / 2.54)} inches)
              </div>
            </div>

            <input
              type="range"
              min="8"
              max="45"
              value={distanceCm}
              onChange={(e) => setDistanceCm(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #ff007a 0%, #ff007a 25%, #10b981 35%, #10b981 65%, #ffd200 75%, #ffd200 100%)`,
                outline: 'none',
                cursor: 'pointer',
                accentColor: statusColor
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
              <span>8 cm (Close)</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>20-25 cm (Optimal Zone)</span>
              <span>45 cm (Distant)</span>
            </div>
          </div>

          {/* Interactive Visual Graphic Comparison */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center',
              background: 'rgba(6, 9, 14, 0.6)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '30px'
            }}
          >
            {/* Visual Spray Cone Diagram */}
            <div 
              style={{
                height: '180px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                background: 'radial-gradient(ellipse at left, rgba(0, 242, 254, 0.1) 0%, transparent 70%)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Canister on Left */}
              <div 
                style={{
                  width: '28px',
                  height: '80px',
                  background: 'linear-gradient(to bottom, #94a3b8, #334155)',
                  borderRadius: '4px',
                  position: 'relative',
                  border: '1px solid #fff'
                }}
              >
                <div style={{ width: '8px', height: '6px', background: '#00f2fe', position: 'absolute', top: '-6px', right: '-4px' }} />
              </div>

              {/* Dynamic Cone Lines */}
              <div 
                style={{
                  flex: 1,
                  height: `${Math.min(160, Math.max(30, (distanceCm / 45) * 150))}px`,
                  background: `linear-gradient(to right, rgba(0, 242, 254, 0.8) 0%, ${statusColor}40 100%)`,
                  clipPath: 'polygon(0% 48%, 100% 0%, 100% 100%, 0% 52%)',
                  margin: '0 16px',
                  transition: 'all 0.15s ease',
                  boxShadow: `0 0 20px ${statusColor}50`
                }}
              />

              {/* Simulated Surface Plate on Right */}
              <div 
                style={{
                  width: '18px',
                  height: '140px',
                  background: '#0f172a',
                  border: `2px solid ${statusColor}`,
                  boxShadow: `0 0 15px ${statusColor}60`,
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual texture on substrate */}
                {status === 'too-close' && (
                  <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, height: '40px', background: '#ff007a', opacity: 0.8 }} />
                )}
                {status === 'optimal' && (
                  <div style={{ position: 'absolute', inset: '10px 0', background: '#10b981', opacity: 0.9, boxShadow: '0 0 10px #10b981' }} />
                )}
                {status === 'too-far' && (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#ffd200 2px, transparent 2px)', backgroundSize: '6px 6px', opacity: 0.7 }} />
                )}
              </div>
            </div>

            {/* Status Information Box */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {status === 'optimal' ? (
                  <CheckCircle2 size={22} color="#10b981" />
                ) : status === 'too-close' ? (
                  <XCircle size={22} color="#ff007a" />
                ) : (
                  <AlertTriangle size={22} color="#ffd200" />
                )}
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>
                  {statusTitle}
                </h3>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px' }}>
                {statusDesc}
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge-neon" style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#fff', fontSize: '0.78rem' }}>
                  Recommended Passes: 2-3 Coats
                </span>
                <span className="badge-neon" style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#00f2fe', fontSize: '0.78rem' }}>
                  Overlap: 50% Stroke
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Interactive Shake & Environment Assist */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              paddingTop: '10px'
            }}
          >
            {/* Canister Agitation Trainer */}
            <div 
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '18px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                  Canister Agitator Shake Test
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                  {isShaking ? `Agitating pigments... (${shakeSecondsRemaining}s)` : 'Listen for internal steel mixing ball'}
                </p>
              </div>

              <button
                onClick={startShakeTimer}
                disabled={isShaking}
                className={isShaking ? 'btn-primary animate-float' : 'btn-primary'}
                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <RotateCcw size={16} />
                <span>{isShaking ? `${shakeSecondsRemaining}s` : 'Shake'}</span>
              </button>
            </div>

            {/* Environmental Conditions Gauge */}
            <div 
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '18px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <Thermometer size={28} color="#00f2fe" />
              <div>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                  Ideal Spray Climate
                </h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <span>Temp: <strong style={{ color: '#10b981' }}>20°C - 25°C</strong></span>
                  <span>Humidity: <strong style={{ color: '#00f2fe' }}>&lt; 60% RH</strong></span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
