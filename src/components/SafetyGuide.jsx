import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Sun, 
  Wind, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function SafetyGuide() {
  const [checklist, setChecklist] = useState({
    ventilation: false,
    ignition: false,
    storage: false,
    disposal: false,
  });

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAllChecked = Object.values(checklist).every(Boolean);

  return (
    <section 
      id="safety" 
      style={{ 
        padding: '80px 0',
        position: 'relative'
      }}
    >
      <div className="app-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-neon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', marginBottom: '12px' }}>
            <ShieldCheck size={14} />
            <span>HazMat Regulatory & Eco-Safety</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>
            Safety, Storage & <span className="gradient-text-cyan">Zero-ODP Standards</span>
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Our aerosol systems adhere to strict ISO 9001 and DOT/UN1950 safety compliance, utilizing next-generation low-GWP hydrofluoroolefins and purified nitrogen.
          </p>
        </div>

        {/* 4 Pillars of Aerosol Safety Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {/* Card 1: Thermal Storage */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderTop: '3px solid #ff007a',
              background: 'rgba(10, 15, 26, 0.8)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 0, 122, 0.15)', color: '#ff007a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sun size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
              Thermal & Pressure Limits
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Never store canisters in environments exceeding <strong style={{ color: '#fff' }}>50°C (122°F)</strong>. Direct solar radiation or engine bay proximity can cause internal gas expansion beyond safety burst margins.
            </p>
          </div>

          {/* Card 2: Cross-Ventilation */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderTop: '3px solid #00f2fe',
              background: 'rgba(10, 15, 26, 0.8)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Wind size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
              Airflow & Exhaust Protocols
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Always operate in well-ventilated areas with continuous cross-draft or downdraft spray booths to prevent VOC concentration accumulation above OSHA exposure thresholds.
            </p>
          </div>

          {/* Card 3: Static & Spark Elimination */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderTop: '3px solid #ffd200',
              background: 'rgba(10, 15, 26, 0.8)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 210, 0, 0.15)', color: '#ffd200', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Flame size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
              Ignition Source Mitigation
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Ground metallic surfaces when discharging conductive aerosol sprays. Extinguish open pilot flames, welding arcs, and halogen work lamps within a 6-meter (20-foot) perimeter.
            </p>
          </div>

          {/* Card 4: Depressurized Recycling */}
          <div 
            className="glass-panel"
            style={{
              padding: '24px',
              borderTop: '3px solid #10b981',
              background: 'rgba(10, 15, 26, 0.8)'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Trash2 size={22} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
              100% Recyclable Aluminum
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Completely discharge remaining propellant before recycling. Our monobloc aluminum containers are infinitely recyclable without downgrading structural integrity.
            </p>
          </div>
        </div>

        {/* Interactive Pre-Flight Spray Checklist */}
        <div 
          className="glass-panel"
          style={{
            padding: '28px 32px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff' }}>
                Pre-Application Safety Verification
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              Check off the safety parameters prior to opening valves in industrial cleanrooms or personal workshops.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
              {[
                { key: 'ventilation', label: 'Adequate Ventilation Verified' },
                { key: 'ignition', label: 'No Active Ignition / Flames' },
                { key: 'storage', label: 'Canister Temp Under 50°C' },
                { key: 'disposal', label: 'Eye & Skin PPE Equipped' },
              ].map((item) => (
                <label 
                  key={item.key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: checklist[item.key] ? '#00f2fe' : '#94a3b8',
                    background: checklist[item.key] ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255,255,255,0.04)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${checklist[item.key] ? '#00f2fe' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={checklist[item.key]} 
                    onChange={() => toggleCheck(item.key)}
                    style={{ accentColor: '#00f2fe' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: isAllChecked ? '#10b981' : '#ffd200',
                background: 'rgba(6, 9, 14, 0.8)',
                padding: '10px 18px',
                borderRadius: '10px',
                border: `1px solid ${isAllChecked ? '#10b981' : '#ffd200'}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isAllChecked ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#ffd200" />}
              <span>{isAllChecked ? 'SAFE FOR DISCHARGE' : 'CHECKLIST PENDING'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
