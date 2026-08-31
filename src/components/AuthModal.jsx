import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../utils/api';

const DEMO_USERS = [
  { label: 'Retail Customer', role: 'customer', name: 'Alex Rivera', email: 'alex.rivera@gmail.com', tier: 'Standard Member' },
  { label: 'B2B Enterprise Gold', role: 'customer_b2b', name: 'Dr. Marcus Sterling', email: 'm.sterling@novaaero.com', company: 'NovaAero Dynamics', tier: 'B2B Enterprise Gold' },
  { label: 'Admin', role: 'admin', name: 'Aerosol Admin', email: 'admin@aerosolwebapp.com', tier: 'Super Admin' },
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // signin | register | reset
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'signin') {
        res = await api.login({ email: form.email, password: form.password });
      } else if (mode === 'register') {
        res = await api.register({ name: form.name, email: form.email, password: form.password });
      } else {
        await new Promise(r => setTimeout(r, 800));
        alert(`Password reset link sent to ${form.email}`);
        setMode('signin');
        setLoading(false);
        return;
      }
      if (res.success) {
        onAuthSuccess(res.data || res.user);
        onClose();
        setForm({ name: '', email: '', password: '' });
      } else {
        setError(res.message || 'Authentication failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (user) => {
    onAuthSuccess({
      id: `usr-${Math.random().toString(36).slice(2, 8)}`,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company || null,
      tier: user.tier,
      phone: '+1 (555) 000-0000',
      addresses: [
        {
          id: 'addr-1',
          isDefault: true,
          type: 'Primary',
          name: user.name,
          company: user.company || '',
          street: '740 Aerospace Blvd',
          city: 'Seattle',
          state: 'WA',
          zip: '98108',
        },
      ],
    });
    onClose();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} style={{ zIndex: 960 }} />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 970,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-overlay)',
            overflow: 'hidden',
            animation: 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              {mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'}
            </span>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Form */}
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'register' && (
                <div>
                  <label className="label">Full name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  required
                  autoFocus={mode !== 'register'}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="label" style={{ margin: 0 }}>Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                  />
                </div>
              )}

              {error && (
                <p style={{ fontSize: '13px', color: 'var(--color-error)', padding: '8px 12px', backgroundColor: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-inverted btn-lg btn-full"
                style={{ marginTop: '4px' }}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign in'
                  : mode === 'register'
                  ? 'Create account'
                  : 'Send reset link'}
              </button>
            </form>

            {/* Mode toggle */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '16px' }}>
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('register'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontWeight: 500, cursor: 'pointer', fontSize: '13px' }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '20px 0 16px',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Demo accounts</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Demo switches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEMO_USERS.map((user) => (
                <button
                  key={user.role}
                  onClick={() => handleDemoLogin(user)}
                  className="btn btn-neutral btn-sm"
                  style={{ justifyContent: 'flex-start', gap: '10px', padding: '8px 12px' }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-bg-muted)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      flexShrink: 0,
                    }}
                  >
                    {user.name[0]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
                      {user.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
