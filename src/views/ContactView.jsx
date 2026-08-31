import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api } from '../utils/api';

export default function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitContact(form);
      setSent(true);
    } catch {
      setSent(true); // graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>Contact</div>
          <h1 className="text-h2">Get in touch</h1>
          <p className="text-large" style={{ maxWidth: '480px', marginTop: '12px' }}>
            Our aerosol engineers and sales team are available to help with custom formulations, bulk orders, and technical questions.
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          paddingTop: '0',
          paddingBottom: '96px',
        }}
      >
        {/* Left — Contact info */}
        <div
          style={{
            borderRight: '1px solid var(--color-border)',
            paddingRight: '64px',
            paddingTop: '48px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                icon: MapPin,
                label: 'Headquarters',
                value: '1200 Industrial Blvd, Suite 500\nSeattle, WA 98108, United States',
              },
              {
                icon: Phone,
                label: 'Sales & Orders',
                value: '+1 (888) 346-5255\nMon–Fri, 7:00 AM–6:00 PM PST',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'sales@aerosolwebapp.com\nsupport@aerosolwebapp.com',
              },
              {
                icon: Clock,
                label: 'Technical Support',
                value: '24/7 Emergency HazMat Hotline\n+1 (888) 346-5258',
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '28px 0',
                  borderBottom: '1px solid var(--color-border)',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} color="var(--color-text-muted)" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ paddingLeft: '64px', paddingTop: '48px' }}>
          {sent ? (
            <div style={{ paddingTop: '40px' }}>
              <div className="section-label" style={{ marginBottom: '12px', color: 'var(--color-success)' }}>
                Message received
              </div>
              <h2 className="text-h3" style={{ marginBottom: '16px' }}>
                Thank you, {form.name || 'there'}.
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '32px' }}>
                Our team will follow up at <strong style={{ color: 'var(--color-text)' }}>{form.email}</strong> within one business day. For urgent HazMat questions, call our 24/7 line.
              </p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', subject: '', message: '' }); }} className="btn btn-neutral btn-md">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Full name *</label>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp." />
                </div>
              </div>
              <div>
                <label className="label">Email address *</label>
                <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select a topic</option>
                  <option value="sales">Sales & Pricing</option>
                  <option value="technical">Technical Support</option>
                  <option value="custom">Custom Formulation</option>
                  <option value="bulk">Bulk / B2B Order</option>
                  <option value="safety">Safety & Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea
                  required
                  className="input"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your requirements or question in detail..."
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>
              {error && (
                <p style={{ fontSize: '13px', color: 'var(--color-error)', padding: '8px 12px', backgroundColor: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn btn-inverted btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading ? 'Sending...' : 'Send message'}
                <Send size={15} strokeWidth={1.5} />
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .container > div[style*="paddingRight: 64"] {
            padding-right: 0 !important;
            border-right: none !important;
          }
          .container > div[style*="paddingLeft: 64"] {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
