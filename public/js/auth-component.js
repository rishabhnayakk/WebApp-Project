const AerosolAuth = {
  step: 'email',
  email: '',
  name: '',
  showOptional: false,
  redirectUrl: '',
  errorMsg: '',
  loading: false,
  googleClientId: '',
  isGoogleConfigured: false,
  gisInitialized: false,

  init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.containerId = containerId;
    this.redirectUrl = options.redirectUrl || this.getRedirectParam() || '';
    this.onSuccess = options.onSuccess || null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = options.mode || urlParams.get('mode') || urlParams.get('tab') || '';
    const errorParam = urlParams.get('error');
    
    this.step = (modeParam === 'register' || modeParam === 'signup') ? 'register' : 'email';
    this.email = '';
    this.name = '';
    this.showOptional = false;
    this.errorMsg = errorParam ? decodeURIComponent(errorParam) : '';
    this.loading = false;

    if (urlParams.get('show_guide') === '1') {
      setTimeout(() => this.showGoogleConfigGuide(), 350);
    }

    this.fetchAuthConfig();
    this.render();
  },

  async fetchAuthConfig() {
    try {
      const res = await fetch('/api/v1/auth/config');
      const data = await res.json();
      if (data.success) {
        this.googleClientId = (data.googleClientId || '').trim();
        this.isGoogleConfigured = Boolean(data.isConfigured || data.isPassportConfigured);
        this.isPassportConfigured = Boolean(data.isPassportConfigured);
        this.callbackUrl = data.callbackUrl || '/api/v1/auth/google/callback';
        this.initGoogleIdentity();
      }
    } catch (e) {
      console.warn('Auth configuration lookup:', e.message);
    }
  },

  initGoogleIdentity() {
    if (!this.googleClientId || this.gisInitialized) return;
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      // Retry once script loads
      setTimeout(() => this.initGoogleIdentity(), 300);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (resp) => AerosolAuth.handleGoogleCredentialResponse(resp),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin'
      });
      this.gisInitialized = true;

      // Render into active slots if present
      const slot = document.getElementById('google-official-btn-slot');
      if (slot) {
        slot.innerHTML = '';
        window.google.accounts.id.renderButton(slot, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.min(380, slot.parentElement?.clientWidth || 360)
        });
      }
    } catch (err) {
      console.warn('Google Identity Services initialization notice:', err);
    }
  },

  getRedirectParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '';
  },

  switchTab(tab) {
    this.errorMsg = '';
    if (tab === 'register') {
      this.step = 'register';
    } else {
      this.step = this.email ? 'login' : 'email';
    }
    this.render();
  },

  toggleOptionalFields() {
    this.showOptional = !this.showOptional;
    const section = document.getElementById('reg-optional-section');
    const icon = document.getElementById('optional-toggle-icon');
    if (section && icon) {
      section.style.display = this.showOptional ? 'block' : 'none';
      icon.textContent = this.showOptional ? 'Hide' : 'Add';
    }
  },

  openPolicyModal(type) {
    const isTerms = type === 'terms';
    const title = isTerms ? 'Terms & Conditions' : 'Privacy Policy';
    const content = isTerms ? `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">1. Product Usage & Safety</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            All aerosol canisters and chemical formulations must be stored, handled, and used strictly according to canister labels and safety datasheets.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">2. Orders & Payments</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We do not collect credit cards, UPI IDs, or delivery addresses at account registration. All payment and shipping details are entered securely during checkout.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">3. Shipping & Deliveries</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            Orders are dispatched via certified ground transport. Any damaged goods reported within 48 hours of delivery are eligible for prompt replacement or credit.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">4. Account Access</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            You are responsible for keeping your login credentials confidential. Access timestamps are recorded to monitor account security.
          </p>
        </div>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">1. Information We Collect</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We collect your name and email address to manage your account and process orders. We do not sell or rent your personal information to third parties.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">2. Payment Security</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We never request credit card numbers, UPI PINs, or bank details during signup. Payments are handled through encrypted, industry-standard gateways.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">3. Communication Preferences</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            Promotional updates are strictly opt-in. You can update your marketing preferences at any time in your account settings.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">4. Security & Audit Logs</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            Login timestamps and IP addresses are recorded to protect accounts from unauthorized access and detect fraudulent activity.
          </p>
        </div>
      </div>
    `;

    let modalEl = document.getElementById('auth-policy-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'auth-policy-modal';
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 9998;" onclick="AerosolAuth.closePolicyModal()"></div>
      <div style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 9999; pointer-events: none;">
        <div style="max-width: 480px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; background: var(--color-card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-overlay); border: 1px solid var(--color-border); pointer-events: auto; overflow: hidden;">
          <div style="padding: 18px 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 16px; font-weight: 700; margin: 0; color: var(--color-text);">${title}</h3>
            <button type="button" onclick="AerosolAuth.closePolicyModal()" style="font-size: 18px; line-height: 1; border: none; background: none; color: var(--color-text-muted); cursor: pointer; padding: 4px 8px;">✕</button>
          </div>
          <div style="padding: 24px; overflow-y: auto; flex: 1;">
            ${content}
          </div>
          <div style="padding: 14px 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: 8px; background: var(--color-bg-subtle);">
            <a href="/faq.html" target="_blank" class="btn btn-ghost btn-xs" style="text-decoration: underline;">Full FAQs ↗</a>
            <button type="button" onclick="AerosolAuth.closePolicyModal()" class="btn btn-inverted btn-xs" style="padding: 6px 16px;">Got It</button>
          </div>
        </div>
      </div>
    `;
    modalEl.style.display = 'block';
  },

  closePolicyModal() {
    const modalEl = document.getElementById('auth-policy-modal');
    if (modalEl) modalEl.style.display = 'none';
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const u = AerosolWebapp ? (typeof AerosolWebapp.getUser === 'function' ? AerosolWebapp.getUser() : AerosolWebapp.user) : null;

    if (u && u.id && this.step !== 'profile') {
      this.step = 'profile';
    }

    if (this.step === 'profile' && u && u.id) {
      container.innerHTML = `
        <div style="max-width: 440px; margin: 0 auto; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 36px 32px; box-shadow: var(--shadow-overlay);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">Aerosol Webapp</div>
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 4px;">Welcome back, ${u.name.split(' ')[0]}</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin-top: 4px;">${u.email} · <span style="color: var(--color-success); font-weight: 600;">Signed In (${u.role || 'CUSTOMER'})</span></p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? `
              <a href="/admin.html" class="btn btn-inverted btn-lg btn-full" style="text-align: center;">Go to Admin Console ↗</a>
              <a href="/index.html" class="btn btn-neutral btn-md btn-full" style="text-align: center;">Home Page →</a>
            ` : `
              <a href="/index.html" class="btn btn-inverted btn-lg btn-full" style="text-align: center;">Continue Shopping →</a>
              <a href="/account.html" class="btn btn-neutral btn-md btn-full" style="text-align: center;">View Orders &amp; Addresses ↗</a>
            `}
            <button onclick="AerosolAuth.switchAccount()" class="btn btn-ghost btn-sm btn-full">Use a different account</button>
            <button onclick="AerosolWebapp.logout()" class="btn btn-ghost btn-sm btn-full" style="color: var(--color-error);">Sign Out</button>
          </div>
        </div>
      `;
      return;
    }

    const isRegister = this.step === 'register';

    container.innerHTML = `
      <div class="auth-card" style="max-width: 460px; margin: 0 auto; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 32px 28px; box-shadow: var(--shadow-overlay);">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="/index.html" style="font-size: 18px; font-weight: 700; color: var(--color-text); letter-spacing: -0.02em; text-decoration: none;">
            Aerosol Webapp
          </a>
        </div>

        <div style="display: flex; border-bottom: 1px solid var(--color-border); margin-bottom: 24px;">
          <button type="button" onclick="AerosolAuth.switchTab('login')" style="flex: 1; padding: 10px 14px; font-size: 13px; font-weight: ${!isRegister ? '600' : '500'}; color: ${!isRegister ? 'var(--color-text)' : 'var(--color-text-muted)'}; border-bottom: ${!isRegister ? '2px solid var(--color-text)' : '2px solid transparent'}; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; transition: all 0.15s ease;">
            Sign In
          </button>
          <button type="button" onclick="AerosolAuth.switchTab('register')" style="flex: 1; padding: 10px 14px; font-size: 13px; font-weight: ${isRegister ? '600' : '500'}; color: ${isRegister ? 'var(--color-text)' : 'var(--color-text-muted)'}; border-bottom: ${isRegister ? '2px solid var(--color-text)' : '2px solid transparent'}; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; transition: all 0.15s ease;">
            Create Account
          </button>
        </div>

        ${this.errorMsg ? `
          <div style="padding: 10px 14px; margin-bottom: 18px; font-size: 12px; color: var(--color-error); background: var(--color-error-bg); border: 1px solid #fca5a5; border-radius: var(--radius-sm); line-height: 1.45; text-align: left;">
            ${this.errorMsg}
          </div>
        ` : ''}

        ${this.step === 'email' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 4px 0;">Welcome back</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin: 0;">Sign in with your email to continue.</p>
          </div>

          <form onsubmit="AerosolAuth.handleEmailSubmit(event)">
            <div style="margin-bottom: 18px; text-align: left;">
              <label class="label" for="auth-email-input" style="font-weight: 600; margin-bottom: 6px; display: block;">Email address</label>
              <input type="email" id="auth-email-input" class="input input-lg" placeholder="Enter your email address" required value="${this.email}" autocomplete="username">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 20px;">
              ${this.loading ? 'Checking...' : 'Continue →'}
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
            <span>OR</span>
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
          </div>

          <button type="button" onclick="AerosolAuth.handleGoogleAuth()" class="btn btn-neutral btn-lg btn-full" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; font-weight: 500;">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style="text-align: center; font-size: 13px; color: var(--color-text-muted);">
            New here? <button type="button" onclick="AerosolAuth.switchTab('register')" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Create an account</button>
          </div>
        ` : ''}

        ${this.step === 'login' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 4px 0;">Enter password</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin: 0;">
              Signing in as <strong style="color: var(--color-text);">${this.email}</strong> 
              <button type="button" onclick="AerosolAuth.step = 'email'; AerosolAuth.render();" style="font-size: 12px; color: var(--color-text-secondary); text-decoration: underline; background: none; border: none; cursor: pointer; margin-left: 4px;">Change</button>
            </p>
          </div>

          <form onsubmit="AerosolAuth.handleLoginSubmit(event)">
            <div style="margin-bottom: 16px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" for="login-pass-input" style="font-weight: 600; margin: 0;">Password</label>
                <button type="button" onclick="AerosolAuth.step = 'forgot'; AerosolAuth.render();" style="font-size: 12px; color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">Forgot password?</button>
              </div>
              <div style="position: relative;">
                <input type="password" id="login-pass-input" class="input input-lg" placeholder="Enter your password" required autocomplete="current-password" autofocus style="padding-right: 54px;">
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('login-pass-input', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 12px; font-weight: 500;">Show</button>
              </div>
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
            <span>OR</span>
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
          </div>

          <button type="button" onclick="AerosolAuth.handleGoogleAuth()" class="btn btn-neutral btn-md btn-full" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 18px; font-weight: 500;">
            <span>Continue with Google</span>
          </button>

          <div style="text-align: center; font-size: 13px; color: var(--color-text-muted);">
            Don't have an account? <button type="button" onclick="AerosolAuth.switchTab('register')" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Create an account</button>
          </div>
        ` : ''}

        ${this.step === 'register' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 4px 0;">Create your account</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin: 0;">Get instant access to order history and faster checkout.</p>
          </div>

          <form onsubmit="AerosolAuth.handleRegisterSubmit(event)">
            <div style="margin-bottom: 14px; text-align: left;">
              <label class="label" for="reg-name-input" style="font-weight: 600; margin-bottom: 4px; display: block;">
                Full name <span style="color: var(--color-error);">*</span>
              </label>
              <input type="text" id="reg-name-input" class="input" placeholder="e.g. Rahul Sharma" required value="${this.name}" autocomplete="name">
            </div>

            <div style="margin-bottom: 14px; text-align: left;">
              <label class="label" for="reg-email-input" style="font-weight: 600; margin-bottom: 4px; display: block;">
                Email address <span style="color: var(--color-error);">*</span>
              </label>
              <input type="email" id="reg-email-input" class="input" placeholder="name@company.com" required value="${this.email}" autocomplete="username">
            </div>

            <div style="margin-bottom: 14px; text-align: left;">
              <label class="label" for="reg-pass-input" style="font-weight: 600; margin-bottom: 4px; display: block;">
                Password <span style="color: var(--color-error);">*</span>
              </label>
              <div style="position: relative;">
                <input type="password" id="reg-pass-input" class="input" placeholder="At least 6 characters" required autocomplete="new-password" style="padding-right: 50px;">
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('reg-pass-input', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 12px; font-weight: 500;">Show</button>
              </div>
            </div>

            <div style="margin-bottom: 16px; text-align: left;">
              <label class="label" for="reg-confirm-pass-input" style="font-weight: 600; margin-bottom: 4px; display: block;">
                Confirm password <span style="color: var(--color-error);">*</span>
              </label>
              <div style="position: relative;">
                <input type="password" id="reg-confirm-pass-input" class="input" placeholder="Re-enter password" required autocomplete="new-password" style="padding-right: 50px;">
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('reg-confirm-pass-input', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 12px; font-weight: 500;">Show</button>
              </div>
            </div>

            <div style="margin-bottom: 16px; border: 1px dashed var(--color-border); border-radius: var(--radius-sm); padding: 10px 14px; text-align: left; background: var(--color-bg-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="AerosolAuth.toggleOptionalFields()">
                <span style="font-size: 12px; font-weight: 600; color: var(--color-text-secondary);">
                  Additional profile info <span style="color: var(--color-text-muted); font-weight: 400;">(optional)</span>
                </span>
                <span id="optional-toggle-icon" style="font-size: 11px; font-weight: 600; color: var(--color-text-muted);">
                  ${this.showOptional ? 'Hide' : 'Add'}
                </span>
              </div>
              <div id="reg-optional-section" style="display: ${this.showOptional ? 'block' : 'none'}; margin-top: 10px;">
                <div style="margin-bottom: 10px;">
                  <label class="label" for="reg-phone-input" style="font-size: 11px; margin-bottom: 4px; display: block;">Contact phone</label>
                  <input type="tel" id="reg-phone-input" class="input" placeholder="+91 98765 43210" autocomplete="tel">
                </div>
                <div>
                  <label class="label" for="reg-dob-input" style="font-size: 11px; margin-bottom: 4px; display: block;">Date of birth</label>
                  <input type="date" id="reg-dob-input" class="input">
                </div>
              </div>
            </div>

            <div style="margin-bottom: 16px; padding: 9px 12px; background: var(--color-bg-subtle); border-radius: var(--radius-sm); font-size: 11px; color: var(--color-text-muted); text-align: left; line-height: 1.45;">
              Payment details and delivery addresses are never requested at signup—only securely entered during checkout.
            </div>

            <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; text-align: left;">
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-terms-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;" required>
                <span>
                  I agree to the <a href="javascript:void(0)" onclick="AerosolAuth.openPolicyModal('terms')" style="text-decoration: underline; color: var(--color-text); font-weight: 600;">Terms &amp; Conditions</a>. <span style="color: var(--color-error);">*</span>
                </span>
              </label>

              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-privacy-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;" required>
                <span>
                  I have read the <a href="javascript:void(0)" onclick="AerosolAuth.openPolicyModal('privacy')" style="text-decoration: underline; color: var(--color-text); font-weight: 600;">Privacy Policy</a>. <span style="color: var(--color-error);">*</span>
                </span>
              </label>

              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-marketing-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;">
                <span>
                  Receive product updates, formulation alerts, and discounts. <span style="color: var(--color-text-muted);">(Optional)</span>
                </span>
              </label>
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" id="create-account-btn" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">
              <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
              <span>OR</span>
              <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
            </div>

            <button type="button" onclick="AerosolAuth.handleGoogleAuth()" class="btn btn-neutral btn-lg btn-full" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; font-weight: 500;">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            <div style="text-align: center; font-size: 13px; color: var(--color-text-muted);">
              Already have an account? <button type="button" onclick="AerosolAuth.switchTab('login')" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Sign in</button>
            </div>
          </form>
        ` : ''}

        ${this.step === 'forgot' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 6px 0;">Reset password</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin: 0;">Enter your email to receive password reset instructions.</p>
          </div>

          <form onsubmit="AerosolAuth.handleForgotSubmit(event)">
            <div style="margin-bottom: 18px; text-align: left;">
              <label class="label" for="forgot-email-input" style="font-weight: 600; margin-bottom: 6px; display: block;">Email address</label>
              <input type="email" id="forgot-email-input" class="input input-lg" placeholder="name@example.com" required value="${this.email}">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Sending link...' : 'Send Reset Link →'}
            </button>

            <div style="text-align: center; font-size: 12px;">
              <button type="button" onclick="AerosolAuth.switchTab('login')" style="color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">← Back to sign in</button>
            </div>
          </form>
        ` : ''}

      </div>
    `;

    setTimeout(() => {
      this.initGoogleIdentity();
    }, 50);
  },

  async handleEmailSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email-input');
    if (!emailInput || !emailInput.value.trim()) return;

    const identifier = emailInput.value.trim();
    this.email = identifier;
    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, identifier })
      });

      const data = await res.json();
      this.loading = false;

      if (data.success) {
        this.step = data.exists ? 'login' : 'register';
      } else {
        this.errorMsg = data.message || 'Error checking account.';
      }
    } catch (err) {
      this.loading = false;
      this.step = 'login';
    }

    this.render();
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const passInput = document.getElementById('login-pass-input');
    if (!passInput || !passInput.value) return;

    const passVal = passInput.value.trim();
    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: passVal,
          redirect: this.redirectUrl
        })
      });

      const data = await res.json();
      this.loading = false;

      if (data.success && data.user) {
        AerosolWebapp.user = data.user;
        AerosolWebapp.saveUser();
        if (data.token) {
          localStorage.setItem('aerosol_token', data.token);
        }

        if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          const adminSession = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: 'ADMIN',
            tier: data.user.tier || 'Super Administrator',
            token: data.token
          };
          sessionStorage.setItem('aerosol_admin_auth', JSON.stringify(adminSession));
          localStorage.setItem('aerosol_admin_auth', JSON.stringify(adminSession));
        }

        AerosolWebapp.updateHeaderBadges();
        AerosolWebapp.showToast(data.message || `Welcome back, ${data.user.name}!`);

        try {
          const loginAudit = {
            id: 'audit-' + Date.now(),
            name: data.user.name || 'User',
            email: data.user.email || this.email,
            phone: data.user.phone || 'Not provided',
            role: data.user.role || 'CUSTOMER',
            authMethod: 'Email & Password',
            timestamp: new Date().toISOString()
          };
          const savedAudits = JSON.parse(localStorage.getItem('aerosol_login_audits') || '[]');
          savedAudits.unshift(loginAudit);
          localStorage.setItem('aerosol_login_audits', JSON.stringify(savedAudits.slice(0, 100)));
        } catch (e) {}

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const isAdm = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
          const target = isAdm ? '/admin.html' : (this.redirectUrl || '/index.html');
          setTimeout(() => { window.location.href = target; }, 300);
        }
      } else {
        this.errorMsg = data.message || 'Incorrect password.';
        this.render();
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Could not connect to server. Please try again.';
      this.render();
    }
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('reg-name-input');
    const emailInput = document.getElementById('reg-email-input');
    const passInput = document.getElementById('reg-pass-input');
    const confirmPassInput = document.getElementById('reg-confirm-pass-input');
    const phoneInput = document.getElementById('reg-phone-input');
    const dobInput = document.getElementById('reg-dob-input');
    const termsCheck = document.getElementById('reg-terms-check');
    const privacyCheck = document.getElementById('reg-privacy-check');
    const marketingCheck = document.getElementById('reg-marketing-check');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const confirmPassword = confirmPassInput ? confirmPassInput.value : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const dob = dobInput ? dobInput.value.trim() : '';
    const marketingAccepted = Boolean(marketingCheck && marketingCheck.checked);

    if (!name || name.length < 2) {
      this.errorMsg = 'Please enter your full name.';
      this.render();
      return;
    }

    if (!email || !email.includes('@')) {
      this.errorMsg = 'Please enter a valid email address.';
      this.render();
      return;
    }

    if (!password || password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters long.';
      this.render();
      return;
    }

    if (password !== confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      this.render();
      return;
    }

    if (!termsCheck || !termsCheck.checked) {
      this.errorMsg = 'Please accept the Terms & Conditions.';
      this.render();
      return;
    }

    if (!privacyCheck || !privacyCheck.checked) {
      this.errorMsg = 'Please accept the Privacy Policy.';
      this.render();
      return;
    }

    this.name = name;
    this.email = email;
    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          phone,
          dob,
          termsAccepted: true,
          privacyAccepted: true,
          marketingAccepted,
          redirect: this.redirectUrl
        })
      });

      const data = await res.json();
      this.loading = false;

      if (data.success && data.user) {
        AerosolWebapp.user = data.user;
        AerosolWebapp.saveUser();
        if (data.token) {
          localStorage.setItem('aerosol_token', data.token);
        }

        AerosolWebapp.updateHeaderBadges();
        AerosolWebapp.showToast(`Account created successfully!`);

        try {
          const loginAudit = {
            id: 'audit-' + Date.now(),
            name: data.user.name || name,
            email: data.user.email || email,
            phone: data.user.phone || phone || 'Not provided',
            role: data.user.role || 'CUSTOMER',
            authMethod: 'Account Registration',
            timestamp: new Date().toISOString()
          };
          const savedAudits = JSON.parse(localStorage.getItem('aerosol_login_audits') || '[]');
          savedAudits.unshift(loginAudit);
          localStorage.setItem('aerosol_login_audits', JSON.stringify(savedAudits.slice(0, 100)));
        } catch (e) {}

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const target = this.redirectUrl || '/index.html';
          setTimeout(() => { window.location.href = target; }, 300);
        }
      } else {
        this.errorMsg = data.message || 'Could not create account.';
        this.render();
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Registration failed. Please try again.';
      this.render();
    }
  },

  handleGoogleAuth() {
    this.errorMsg = '';

    // If Google OAuth credentials are fully configured on the server, initiate Passport.js flow
    if (this.isGoogleConfigured) {
      this.loading = true;
      this.render();
      const redirectParam = this.redirectUrl || window.location.pathname;
      window.location.href = `/api/v1/auth/google?redirect=${encodeURIComponent(redirectParam)}`;
      return;
    }

    // When GOOGLE_CLIENT_ID / SECRET is not configured in .env yet, show guided modal
    this.showGoogleConfigGuide();
  },

  async handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      this.errorMsg = 'Google sign-in was cancelled or no token was provided.';
      this.loading = false;
      this.render();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credential: response.credential,
          redirect: this.redirectUrl
        })
      });

      const data = await res.json();
      this.loading = false;

      if (data.success && data.user) {
        this.processSuccessfulAuth(data, 'Passport.js / Google OAuth 2.0');
      } else {
        this.errorMsg = data.message || 'Google token verification failed.';
        this.render();
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Could not communicate with authentication server. Please check connection.';
      this.render();
    }
  },

  processSuccessfulAuth(data, authMethod = 'Google OAuth 2.0') {
    AerosolWebapp.user = data.user;
    AerosolWebapp.saveUser();
    if (data.token) {
      localStorage.setItem('aerosol_token', data.token);
    }

    if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
      const adminSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: 'ADMIN',
        tier: data.user.tier || 'Super Administrator',
        token: data.token
      };
      sessionStorage.setItem('aerosol_admin_auth', JSON.stringify(adminSession));
      localStorage.setItem('aerosol_admin_auth', JSON.stringify(adminSession));
    }

    AerosolWebapp.updateHeaderBadges();
    AerosolWebapp.showToast(data.message || `Signed in with Google!`);

    try {
      const loginAudit = {
        id: 'audit-' + Date.now(),
        name: data.user.name || 'Google User',
        email: data.user.email || '',
        phone: data.user.phone || 'Google Account Phone',
        role: data.user.role || 'CUSTOMER',
        authMethod: authMethod,
        timestamp: new Date().toISOString()
      };
      const savedAudits = JSON.parse(localStorage.getItem('aerosol_login_audits') || '[]');
      savedAudits.unshift(loginAudit);
      localStorage.setItem('aerosol_login_audits', JSON.stringify(savedAudits.slice(0, 100)));
    } catch (e) {}

    if (this.onSuccess) {
      this.onSuccess(data);
    } else {
      const isAdm = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
      const target = isAdm ? '/admin.html' : (data.redirectUrl || this.redirectUrl || '/account.html');
      setTimeout(() => { window.location.href = target; }, 350);
    }
  },

  showGoogleConfigGuide() {
    let modalEl = document.getElementById('google-config-guide-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'google-config-guide-modal';
      document.body.appendChild(modalEl);
    }

    const callback = this.callbackUrl || `${window.location.origin}/api/v1/auth/google/callback`;

    modalEl.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px); z-index: 99998;" onclick="AerosolAuth.closeConfigGuide()"></div>
      <div style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 99999; pointer-events: none;">
        <div style="max-width: 540px; width: 100%; max-height: 90vh; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-overlay); pointer-events: auto; overflow-y: auto; text-align: left; padding: 28px;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h3 style="font-size: 18px; font-weight: 700; color: var(--color-text); margin: 0;">Passport.js Google OAuth Setup</h3>
            </div>
            <button type="button" onclick="AerosolAuth.closeConfigGuide()" style="border: none; background: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--color-text-muted);">✕</button>
          </div>

          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 16px;">
            Passport.js Google OAuth 2.0 strategy is integrated to authenticate new & existing users. To connect live Google Cloud credentials:
          </p>

          <div style="background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 18px; font-size: 12px; line-height: 1.6; color: var(--color-text-secondary);">
            <strong>1. Google Cloud Console</strong> → Credentials → Create OAuth 2.0 Client ID (Web Application)<br>
            <strong>2. Authorized JavaScript origins:</strong> <code style="font-family: var(--font-mono); background: var(--color-card-bg); padding: 2px 4px; border-radius: 3px;">${window.location.origin}</code><br>
            <strong>3. Authorized redirect URIs:</strong> <code style="font-family: var(--font-mono); background: var(--color-card-bg); padding: 2px 4px; border-radius: 3px;">${callback}</code><br>
            <strong>4. Add to your <code style="font-family: var(--font-mono);">.env</code> file:</strong><br>
            <code style="font-family: var(--font-mono); color: var(--color-text); display: block; margin-top: 4px; background: var(--color-card-bg); padding: 6px 8px; border-radius: 3px; border: 1px solid var(--color-border);">GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com<br>GOOGLE_CLIENT_SECRET=your-client-secret</code>
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px;">
            <button type="button" onclick="AerosolAuth.runDevGoogleSimulation()" class="btn btn-inverted btn-md btn-full" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Test Google Auth (Local Simulation for New User) →</span>
            </button>
            <button type="button" onclick="AerosolAuth.closeConfigGuide()" class="btn btn-neutral btn-sm btn-full">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    modalEl.style.display = 'block';
  },

  closeConfigGuide() {
    const modalEl = document.getElementById('google-config-guide-modal');
    if (modalEl) modalEl.style.display = 'none';
  },

  async runDevGoogleSimulation() {
    this.closeConfigGuide();
    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isDevMock: true,
          devUser: {
            googleId: 'goog-' + Date.now(),
            email: this.email || 'rahul.google@gmail.com',
            name: 'Rahul Sharma (Google)',
            picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
          },
          redirect: this.redirectUrl
        })
      });

      const data = await res.json();
      this.loading = false;

      if (data.success && data.user) {
        this.processSuccessfulAuth(data, 'Google OAuth (Verified)');
      } else {
        this.errorMsg = data.message || 'Simulation failed.';
        this.render();
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Could not run local test flow.';
      this.render();
    }
  },

  async handleForgotSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('forgot-email-input');
    if (!emailInput || !emailInput.value) return;

    this.loading = true;
    this.render();

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value.trim() })
      });

      const data = await res.json();
      this.loading = false;
      this.errorMsg = '';
      AerosolWebapp.showToast(data.message || 'Reset instructions sent.');
      this.step = 'login';
      this.render();
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Service unavailable.';
      this.render();
    }
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    if (btn) btn.textContent = isPass ? 'Hide' : 'Show';
  },

  switchAccount() {
    if (AerosolWebapp) {
      AerosolWebapp.user = null;
      localStorage.removeItem('aerosol_user');
      localStorage.removeItem('aerosol_token');
    }
    this.step = 'email';
    this.email = '';
    this.name = '';
    this.render();
  }
};

window.AerosolAuth = AerosolAuth;
