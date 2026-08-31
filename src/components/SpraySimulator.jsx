import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Layers, 
  Zap, 
  Activity, 
  Wind, 
  CheckCircle2, 
  Flame, 
  Info,
  Sliders
} from 'lucide-react';
import { startSpraySound, stopSpraySound, playCanisterShakeSound } from '../utils/audio';

const CANISTER_FINISHES = [
  { id: 'cyan', name: 'Cyan Titanium', color: '#00f2fe', glow: 'rgba(0, 242, 254, 0.4)', bgGradient: 'linear-gradient(180deg, #00f2fe 0%, #0066cc 100%)' },
  { id: 'gold', name: 'Obsidian Gold', color: '#ffd200', glow: 'rgba(255, 210, 0, 0.4)', bgGradient: 'linear-gradient(180deg, #ffd200 0%, #b8860b 100%)' },
  { id: 'emerald', name: 'Emerald Chrome', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bgGradient: 'linear-gradient(180deg, #10b981 0%, #065f46 100%)' },
  { id: 'magenta', name: 'Crimson Stealth', color: '#ff007a', glow: 'rgba(255, 0, 122, 0.4)', bgGradient: 'linear-gradient(180deg, #ff007a 0%, #831843 100%)' },
  { id: 'violet', name: 'Prism Violet', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', bgGradient: 'linear-gradient(180deg, #8b5cf6 0%, #4c1d95 100%)' },
];

const SPRAY_PATTERNS = [
  { id: 'mist', name: 'Nano Mist (12µm)', spread: 0.45, speed: 7.5, density: 16, desc: 'Ultra-uniform coat for clear coats & sanitizers' },
  { id: 'jet', name: 'Precision Jet Stream', spread: 0.12, speed: 12.0, density: 12, desc: 'High-pressure targeted blast for contacts & crevices' },
  { id: 'fan', name: 'Automotive Wide Fan', spread: 0.65, speed: 8.5, density: 20, desc: '50% overlapping broad fan for body panels & metal' },
  { id: 'foam', name: 'Dense Expansion Foam', spread: 0.35, speed: 5.5, density: 14, desc: 'Clinging active foam for deep grease & degreasing' },
];

export default function SpraySimulator({ onAddToCart }) {
  const canvasRef = useRef(null);
  const [isSpraying, setIsSpraying] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState(CANISTER_FINISHES[0]);
  const [selectedPattern, setSelectedPattern] = useState(SPRAY_PATTERNS[0]);
  const [canisterAngle, setCanisterAngle] = useState(0); // 360 rotation
  const [propellantLevel, setPropellantLevel] = useState(100);
  const [currentPressure, setCurrentPressure] = useState(7.4);
  const [isShaking, setIsShaking] = useState(false);
  const [sprayDuration, setSprayDuration] = useState(0);
  const [targetCoatCoverage, setTargetCoatCoverage] = useState(0);

  const particlesRef = useRef([]);
  const sprayingRef = useRef(false);

  // Keep sprayingRef in sync
  useEffect(() => {
    sprayingRef.update = isSpraying;
  }, [isSpraying]);

  // Main Canvas Particle Physics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = Math.min(500, window.innerHeight * 0.6));

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = Math.min(500, window.innerHeight * 0.6);
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Coordinates for Canister & Target Surface
      const nozzleX = Math.max(120, width * 0.28);
      const nozzleY = height * 0.45;
      const targetX = width * 0.82;

      // Draw Virtual Target Substrate (e.g. coated carbon fiber / metal test card)
      ctx.save();
      const targetWidth = 14;
      const targetHeight = height * 0.7;
      const targetY = (height - targetHeight) / 2;

      // Substrate base
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 2;
      ctx.fillRect(targetX, targetY, targetWidth, targetHeight);
      ctx.strokeRect(targetX, targetY, targetWidth, targetHeight);

      // Coated film accumulation on target
      if (targetCoatCoverage > 0) {
        const coatAlpha = Math.min(0.9, targetCoatCoverage / 100);
        ctx.fillStyle = selectedFinish.color;
        ctx.globalAlpha = coatAlpha;
        ctx.shadowColor = selectedFinish.color;
        ctx.shadowBlur = 18;
        ctx.fillRect(targetX - 2, targetY + 10, targetWidth + 4, targetHeight - 20);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

      // Target Label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px JetBrains Mono';
      ctx.fillText('TARGET SUBSTRATE (9H NANO)', targetX - 45, targetY - 12);
      ctx.restore();

      // Emit new particles when spraying
      if (isSpraying && propellantLevel > 0) {
        const emitCount = selectedPattern.density;
        for (let i = 0; i < emitCount; i++) {
          const spreadFactor = (Math.random() - 0.5) * selectedPattern.spread;
          const angle = spreadFactor;
          const speed = selectedPattern.speed * (0.85 + Math.random() * 0.3);

          particlesRef.current.push({
            x: nozzleX + 18,
            y: nozzleY - 14 + (Math.random() - 0.5) * 4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 2.8,
            size: selectedPattern.id === 'foam' ? Math.random() * 5 + 3 : Math.random() * 3.5 + 1.2,
            maxSize: selectedPattern.id === 'foam' ? 14 : 7,
            alpha: 0.85,
            decay: selectedPattern.id === 'foam' ? 0.012 : 0.022,
            color: selectedFinish.color,
            isFoam: selectedPattern.id === 'foam',
            targetHit: false,
          });
        }
      }

      // Update & Draw Particle Mist
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.08; // Vapor expansion
        p.alpha -= p.decay;

        // Check impact with target substrate
        if (p.x >= targetX && p.y >= targetY && p.y <= targetY + targetHeight) {
          p.vx = (Math.random() - 0.5) * 1.5;
          p.vy = (Math.random() - 0.5) * 2;
          p.alpha -= 0.06;
          if (!p.targetHit) {
            p.targetHit = true;
            setTargetCoatCoverage((prev) => Math.min(100, prev + 0.15));
          }
        }

        if (p.alpha <= 0 || p.x > width || p.y < 0 || p.y > height) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(p.maxSize, p.size), 0, Math.PI * 2);
        
        if (p.isFoam) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        }
      }

      // Draw 3D-Look Aerosol Canister
      ctx.save();
      const canW = 58;
      const canH = 175;
      const canX = nozzleX - canW;
      const canY = nozzleY - 14;

      // Nozzle Plunger (depresses slightly when spraying)
      const plungerOffset = isSpraying ? 5 : 0;
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.fillRect(nozzleX - 14, canY - 22 + plungerOffset, 18, 16);
      ctx.strokeRect(nozzleX - 14, canY - 22 + plungerOffset, 18, 16);

      // Nozzle Orifice
      ctx.fillStyle = selectedFinish.color;
      ctx.fillRect(nozzleX + 2, canY - 17 + plungerOffset, 4, 6);

      // Metallic Top Dome / Crimped Valve Cup
      const domeGradient = ctx.createLinearGradient(canX, canY, canX + canW, canY);
      domeGradient.addColorStop(0, '#94a3b8');
      domeGradient.addColorStop(0.3, '#f1f5f9');
      domeGradient.addColorStop(0.7, '#64748b');
      domeGradient.addColorStop(1, '#334155');
      ctx.fillStyle = domeGradient;
      ctx.beginPath();
      ctx.ellipse(canX + canW / 2, canY, canW / 2, 14, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Main Cylinder Body with selected finish gradient
      const bodyGradient = ctx.createLinearGradient(canX, canY, canX + canW, canY);
      bodyGradient.addColorStop(0, '#0f172a');
      bodyGradient.addColorStop(0.2, selectedFinish.color);
      bodyGradient.addColorStop(0.5, '#ffffff');
      bodyGradient.addColorStop(0.8, selectedFinish.color);
      bodyGradient.addColorStop(1, '#020617');

      ctx.fillStyle = bodyGradient;
      ctx.fillRect(canX, canY, canW, canH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.strokeRect(canX, canY, canW, canH);

      // Canister Label Artwork
      ctx.fillStyle = 'rgba(6, 9, 14, 0.85)';
      ctx.fillRect(canX + 4, canY + 30, canW - 8, 95);
      
      // Label Brand
      ctx.fillStyle = selectedFinish.color;
      ctx.font = 'bold 9px Space Grotesk';
      ctx.fillText('AEROVOX', canX + 8, canY + 48);
      
      ctx.fillStyle = '#fff';
      ctx.font = '7px Outfit';
      ctx.fillText('PRO-AEROSOL', canX + 8, canY + 60);

      // Level Indicator line on can
      const fillHeight = (propellantLevel / 100) * 40;
      ctx.fillStyle = selectedFinish.color;
      ctx.fillRect(canX + 8, canY + 105 - fillHeight, 6, fillHeight);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(canX + 8, canY + 65, 6, 40);

      // Bottom concave base
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(canX + canW / 2, canY + canH, canW / 2, 10, 0, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpraying, selectedFinish, selectedPattern, propellantLevel, targetCoatCoverage]);

  // Deplete propellant and pressure during continuous spraying
  useEffect(() => {
    let interval;
    if (isSpraying) {
      startSpraySound(selectedPattern.id);
      interval = setInterval(() => {
        setPropellantLevel((prev) => Math.max(0, +(prev - 0.4).toFixed(1)));
        setCurrentPressure((prev) => Math.max(3.2, +(prev - 0.04).toFixed(2)));
        setSprayDuration((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      stopSpraySound();
      // Pressure gradually recovers when resting
      interval = setInterval(() => {
        setCurrentPressure((prev) => Math.min(7.4, +(prev + 0.05).toFixed(2)));
      }, 300);
    }
    return () => {
      clearInterval(interval);
      stopSpraySound();
    };
  }, [isSpraying, selectedPattern]);

  const handleStartSpray = (e) => {
    e.preventDefault();
    if (propellantLevel <= 0) return;
    setIsSpraying(true);
  };

  const handleStopSpray = (e) => {
    e.preventDefault();
    setIsSpraying(false);
  };

  const handleShakeCan = () => {
    setIsShaking(true);
    playCanisterShakeSound();
    setTimeout(() => {
      playCanisterShakeSound();
    }, 120);
    setTimeout(() => {
      playCanisterShakeSound();
      setIsShaking(false);
      setCurrentPressure(7.8); // Instant pressure boost from agitation!
    }, 350);
  };

  const handleResetCanister = () => {
    setPropellantLevel(100);
    setCurrentPressure(7.4);
    setSprayDuration(0);
    setTargetCoatCoverage(0);
  };

  return (
    <section 
      id="spray-lab"
      style={{
        padding: '70px 0',
        position: 'relative'
      }}
    >
      <div className="app-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="badge-neon" style={{ marginBottom: '12px' }}>
            <Sparkles size={14} />
            <span>Interactive Propulsion Physics & 3D Lab</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Interactive <span className="gradient-text-cyan">3D Aerosol Simulator</span>
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Test realistic spray mist dynamics, select high-precision nozzle patterns, customize canister finishes, and observe nanocoating film coverage in real time.
          </p>
        </div>

        {/* Main Simulator Card */}
        <div 
          className="glass-panel-glow"
          style={{
            padding: '28px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Control Bar */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
              paddingBottom: '20px',
              marginBottom: '20px'
            }}
          >
            {/* Pattern Switcher */}
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Select Valve & Nozzle Pattern:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SPRAY_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern)}
                    style={{
                      background: selectedPattern.id === pattern.id ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${selectedPattern.id === pattern.id ? '#00f2fe' : 'rgba(148, 163, 184, 0.2)'}`,
                      color: selectedPattern.id === pattern.id ? '#00f2fe' : '#94a3b8',
                      borderRadius: '8px',
                      padding: '7px 13px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-heading)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {pattern.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Canister Finish Picker */}
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Canister Anodized Finish:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {CANISTER_FINISHES.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish)}
                    title={finish.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: finish.color,
                      border: selectedFinish.id === finish.id ? '2px solid #fff' : '2px solid transparent',
                      boxShadow: selectedFinish.id === finish.id ? `0 0 12px ${finish.color}` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Canvas Area */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.9) 0%, rgba(6, 9, 14, 0.98) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 242, 254, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              cursor: isSpraying ? 'crosshair' : 'default'
            }}
            className={isShaking ? 'animate-float' : ''}
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* Live Overlay HUD Telemetry */}
            <div 
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#94a3b8',
                background: 'rgba(6, 9, 14, 0.75)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                pointerEvents: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>CHAMBER PRESSURE:</span>
                <span style={{ color: currentPressure < 5 ? '#ff007a' : '#00f2fe', fontWeight: 800 }}>
                  {currentPressure.toFixed(1)} BAR ({Math.round(currentPressure * 14.5)} PSI)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>PROPELLANT FILL:</span>
                <span style={{ color: propellantLevel < 20 ? '#ff007a' : '#10b981', fontWeight: 800 }}>
                  {propellantLevel.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>TARGET FILM COAT:</span>
                <span style={{ color: '#ffd200', fontWeight: 800 }}>
                  {targetCoatCoverage.toFixed(0)}% COVERAGE
                </span>
              </div>
            </div>

            {/* Spray Instructions helper */}
            {!isSpraying && propellantLevel > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  color: '#00f2fe',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  animation: 'pulseGlow 2s infinite'
                }}
              >
                Press & Hold Trigger Button Below to Actuate Spray Valve
              </div>
            )}
          </div>

          {/* Action Trigger Bar */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginTop: '22px'
            }}
          >
            {/* Main Spray Hold Button */}
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
              <button
                onMouseDown={handleStartSpray}
                onMouseUp={handleStopSpray}
                onTouchStart={handleStartSpray}
                onTouchEnd={handleStopSpray}
                disabled={propellantLevel <= 0}
                style={{
                  flex: 1,
                  background: isSpraying 
                    ? 'linear-gradient(135deg, #ff007a 0%, #7928ca 100%)' 
                    : 'linear-gradient(135deg, #00f2fe 0%, #0088ff 100%)',
                  color: isSpraying ? '#fff' : '#030712',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  cursor: propellantLevel <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: isSpraying 
                    ? '0 0 35px rgba(255, 0, 122, 0.7)' 
                    : '0 4px 25px rgba(0, 242, 254, 0.4)',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                <Wind size={22} className={isSpraying ? 'animate-pulse-glow' : ''} />
                <span>
                  {propellantLevel <= 0 ? 'CANISTER DEPLETED' : isSpraying ? 'VALVE OPEN (SPRAYING...)' : 'PRESS & HOLD TO SPRAY'}
                </span>
              </button>

              {/* Shake Canister Button */}
              <button
                onClick={handleShakeCan}
                title="Shake to agitate propellant and internal micro-beads"
                className="btn-secondary"
                style={{ padding: '14px 18px', borderRadius: '12px' }}
              >
                <RotateCcw size={18} />
                <span>Shake Can</span>
              </button>

              {/* Reset Canister */}
              <button
                onClick={handleResetCanister}
                title="Refill propellant and clear substrate"
                className="btn-secondary"
                style={{ padding: '14px 18px', borderRadius: '12px' }}
              >
                <span>Reset</span>
              </button>
            </div>

            {/* Pattern Description */}
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '360px', textAlign: 'right' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{selectedPattern.name}: </span>
              {selectedPattern.desc}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
