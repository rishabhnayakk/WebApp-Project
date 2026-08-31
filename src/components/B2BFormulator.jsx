import React, { useState } from 'react';
import { 
  Sliders, 
  Send, 
  CheckCircle2, 
  Layers, 
  Gauge, 
  Factory, 
  FileCheck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../utils/api';

export default function B2BFormulator() {
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    canisterSize: '500ml Heavy Aluminum',
    propellant: 'Eco-HFO 1234ze (Ultra Low GWP < 1)',
    valveType: '360° All-Angle Ball Valve',
    quantity: 5000,
    canFinish: 'Matte Anodized Metallic',
    specialRequirements: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Unit Cost calculation
  const calculateEstimates = () => {
    const qty = parseInt(formData.quantity, 10) || 1000;
    let baseUnit = 5.50;
    if (qty >= 50000) baseUnit = 2.80;
    else if (qty >= 25000) baseUnit = 3.10;
    else if (qty >= 10000) baseUnit = 3.45;
    else if (qty >= 5000) baseUnit = 3.90;
    else if (qty >= 2500) baseUnit = 4.40;

    if (formData.propellant.includes('HFO')) baseUnit += 0.40;
    if (formData.valveType.includes('360')) baseUnit += 0.25;
    if (formData.canFinish.includes('Holographic')) baseUnit += 0.35;

    const total = baseUnit * qty;
    return {
      unitPrice: baseUnit.toFixed(2),
      totalPrice: total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  };

  const estimates = calculateEstimates();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.company || !formData.email) {
      setErrorMsg('Please provide your company name and commercial email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitCustomQuote(formData);
      if (res.success) {
        setSubmittedQuote(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit quote request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="b2b-formulator" 
      style={{ 
        padding: '80px 0',
        position: 'relative' 
      }}
    >
      <div className="app-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div className="badge-neon" style={{ marginBottom: '12px' }}>
            <Factory size={14} />
            <span>Contract Aerosol Manufacturing & Custom Fill</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800 }}>
            Custom <span className="gradient-text-cyan">Aerosol Formulator</span> & B2B Quoter
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '10px auto 0', fontSize: '1.05rem' }}>
            Configure your private-label aerosol specifications, select valve geometries and propellant matrices, and receive instant contract batch volume pricing.
          </p>
        </div>

        {/* Main Formulator Card */}
        <div 
          className="glass-panel-glow"
          style={{
            padding: '36px',
            background: 'rgba(10, 15, 26, 0.9)',
          }}
        >
          {submittedQuote ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#fff', marginBottom: '10px' }}>
                Engineering Formulation Spec Logged!
              </h3>
              <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto 24px' }}>
                Quote Reference: <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{submittedQuote.id}</strong> has been transmitted to our senior aerosol chemical engineering team.
              </p>

              <div 
                style={{
                  maxWidth: '500px',
                  margin: '0 auto 30px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Client Partner:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{submittedQuote.company}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Batch Volume:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{submittedQuote.quantity.toLocaleString()} units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Estimated Unit Rate:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{submittedQuote.estimatedUnitCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Estimated Total:</span>
                  <span style={{ color: '#00f2fe', fontWeight: 800, fontSize: '1.1rem' }}>{submittedQuote.totalEstimate}</span>
                </div>
              </div>

              <button
                onClick={() => setSubmittedQuote(null)}
                className="btn-secondary"
              >
                <span>Configure Another Formulation</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* Configuration Matrix Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '30px'
                }}
              >
                {/* Canister Size */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                    1. Canister Form Factor
                  </label>
                  <select
                    value={formData.canisterSize}
                    onChange={(e) => setFormData({ ...formData, canisterSize: e.target.value })}
                    className="glass-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="300ml Monobloc Aluminum">300ml Monobloc Aluminum (10.1 fl oz)</option>
                    <option value="400ml Tinplate Gloss">400ml Tinplate 3-Piece (13.5 fl oz)</option>
                    <option value="500ml Heavy Aluminum">500ml Heavy Aluminum (16.9 fl oz)</option>
                    <option value="650ml Jumbo High-Pressure">650ml Jumbo High-Pressure (22.0 fl oz)</option>
                  </select>
                </div>

                {/* Propellant Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                    2. Propellant System
                  </label>
                  <select
                    value={formData.propellant}
                    onChange={(e) => setFormData({ ...formData, propellant: e.target.value })}
                    className="glass-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Eco-HFO 1234ze (Ultra Low GWP < 1)">Eco-HFO 1234ze (Ultra Low GWP &lt; 1, Zero ODP)</option>
                    <option value="Compressed Purified N2 Micro-Jet">Compressed Purified N2 (100% Non-Flammable)</option>
                    <option value="Hydrocarbon Blend A-70 High Stability">Hydrocarbon Blend A-70 (High Output Volume)</option>
                    <option value="CO2 Micro-Jet Hybrid">CO2 Micro-Jet Hybrid (Compact High Pressure)</option>
                  </select>
                </div>

                {/* Valve & Actuator */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                    3. Valve & Nozzle Actuation
                  </label>
                  <select
                    value={formData.valveType}
                    onChange={(e) => setFormData({ ...formData, valveType: e.target.value })}
                    className="glass-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="360° All-Angle Ball Valve">360° All-Angle Inversion Valve</option>
                    <option value="Smart-Straw Dual Action Jet">Smart-Straw Dual Action Flip Nozzle</option>
                    <option value="Variable Micron Fan Atomizer">Variable Micron Fan Atomizer Cap</option>
                    <option value="Locking Total-Release Fogger">Locking Total-Release Room Fogger</option>
                  </select>
                </div>

                {/* Canister Exterior Finish */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                    4. Can Exterior & Lithography
                  </label>
                  <select
                    value={formData.canFinish}
                    onChange={(e) => setFormData({ ...formData, canFinish: e.target.value })}
                    className="glass-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Matte Anodized Metallic">Matte Anodized Metallic Finish</option>
                    <option value="High-Gloss 8-Color Litho">High-Gloss 8-Color Litho Printing</option>
                    <option value="Holographic Chroma Shift">Holographic Chroma Shift Coating</option>
                    <option value="Soft-Touch Tactile Velvet">Soft-Touch Tactile Grip Polymer</option>
                  </select>
                </div>

                {/* Batch Quantity */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      5. Contract Run Volume: <strong style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{formData.quantity.toLocaleString()} Canisters</strong>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Bulk discount active</span>
                  </div>

                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'linear-gradient(to right, #00f2fe, #10b981)',
                      outline: 'none',
                      cursor: 'pointer',
                      accentColor: '#00f2fe'
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    <span>1,000 (Pilot Batch)</span>
                    <span>10,000 (Standard Tier)</span>
                    <span>50,000+ (High Volume OEM)</span>
                  </div>
                </div>
              </div>

              {/* Live Price Estimation Display Bar */}
              <div 
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '30px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Estimated Unit Price (FOB Cleanroom)
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
                    ${estimates.unitPrice} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>/ can</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Estimated Contract Value
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 900, color: '#00f2fe' }}>
                    ${estimates.totalPrice}
                  </div>
                </div>
              </div>

              {/* Contact Information Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Company / Brand Name *"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="Contact Name & Title"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="email"
                  placeholder="Work / Commercial Email *"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input"
                />
                <input
                  type="tel"
                  placeholder="Direct Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="glass-input"
                />
              </div>

              {errorMsg && (
                <div style={{ color: '#ff007a', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.05rem',
                  justifyContent: 'center',
                  borderRadius: '12px'
                }}
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Calculating & Dispatching Specs...' : 'Request Formal Engineering Feasibility & Quote'}</span>
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
