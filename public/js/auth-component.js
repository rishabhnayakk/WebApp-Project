const AerosolAuth = {
  step: 'email', // 'email' | 'login' | 'register' | 'forgot' | 'profile'
  email: '',
  name: '',
  showOptional: false,
  redirectUrl: '',
  errorMsg: '',
  loading: false,

  init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.containerId = containerId;
    this.redirectUrl = options.redirectUrl || this.getRedirectParam() || '';
    this.onSuccess = options.onSuccess || null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = options.mode || urlParams.get('mode') || urlParams.get('tab') || '';
    
    this.step = (modeParam === 'register' || modeParam === 'signup') ? 'register' : 'email';
    this.email = '';
    this.name = '';
    this.showOptional = false;
    this.errorMsg = '';
    this.loading = false;

    this.render();
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
      icon.textContent = this.showOptional ? '▲ Hide' : '▼ Add';
    }
  },

  openPolicyModal(type) {
    const isTerms = type === 'terms';
    const title = isTerms ? 'Terms & Conditions' : 'Privacy Policy';
    const content = isTerms ? `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">1. Industrial Product & HazMat Policy</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            All chemical formulations, precision aerosols, and propellant canisters are sold for commercial, laboratory, and authorized use in strict accordance with ISO 9001:2015 standards.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">2. Payment & Shipping Transparency</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We do not collect credit cards, UPI IDs, or delivery addresses at account registration. All payment and shipping information is collected safely and encrypted only during checkout.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">3. Delivery & Damage Claims</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            Orders are dispatched in compliance with surface HazMat logistics. Damaged canisters reported within 48 hours receive immediate replacement or credit.
          </p>
        </div>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">1. Data Collection & Privacy</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We collect your Full Name and Email Address exclusively to authenticate your account and securely record previous orders and formulations. We never sell your personal information.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">2. Zero Sensitive Financial Data at Signup</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            We never request credit/debit card numbers, UPI PINs, bank details, or government IDs during signup. Payments are processed during checkout through secure 256-bit encrypted gateways.
          </p>
        </div>
        <div>
          <h4 style="font-size: 14px; font-weight: 600; color: var(--color-text); margin: 0 0 4px 0;">3. Marketing Choice & Opt-In</h4>
          <p style="font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            Marketing communications are 100% opt-in and never pre-checked. You may change your communication preferences anytime from your account dashboard.
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
            <a href="/faq.html" target="_blank" class="btn btn-ghost btn-xs" style="text-decoration: underline;">Open Full Documentation ↗</a>
            <button type="button" onclick="AerosolAuth.closePolicyModal()" class="btn btn-inverted btn-xs" style="padding: 6px 16px;">I Understand</button>
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

    const u = AerosolWebapp ? AerosolWebapp.user : null;

    if (u && u.id && this.step !== 'profile') {
      this.step = 'profile';
    }

    if (this.step === 'profile' && u && u.id) {
      container.innerHTML = `
        <div style="max-width: 440px; margin: 0 auto; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 36px 32px; box-shadow: var(--shadow-overlay);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">Aerosol Webapp</div>
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 4px;">Welcome back, ${u.name.split(' ')[0]}</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin-top: 4px;">${u.email} · <span style="color: var(--color-success); font-weight: 600;">✓ Signed In (${u.role || 'CUSTOMER'})</span></p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? `
              <a href="/admin.html" class="btn btn-inverted btn-lg btn-full" style="text-align: center;">Go to Admin Operations Console ↗</a>
              <a href="/index.html" class="btn btn-neutral btn-md btn-full" style="text-align: center;">Go to Home Page →</a>
            ` : `
              <a href="/index.html" class="btn btn-inverted btn-lg btn-full" style="text-align: center;">Go to Home Page →</a>
              <a href="/account.html" class="btn btn-neutral btn-md btn-full" style="text-align: center;">View Orders & Saved Addresses ↗</a>
            `}
            <button onclick="AerosolAuth.switchAccount()" class="btn btn-ghost btn-sm btn-full">Sign in with a different account</button>
            <button onclick="AerosolWebapp.logout()" class="btn btn-ghost btn-sm btn-full" style="color: var(--color-error);">Sign Out</button>
          </div>
        </div>
      `;
      return;
    }

    const isRegister = this.step === 'register';

    container.innerHTML = `
      <div class="auth-card" style="max-width: 460px; margin: 0 auto; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 32px 28px; box-shadow: var(--shadow-overlay);">
        
        <!-- BRAND LOGO -->
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="/index.html" style="font-size: 18px; font-weight: 700; color: var(--color-text); letter-spacing: -0.02em; text-decoration: none;">
            Aerosol Webapp
          </a>
        </div>

        <!-- AUTH TABS: SIGN IN vs CREATE ACCOUNT -->
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

        <!-- STEP 1: SIGN IN / EMAIL-FIRST -->
        ${this.step === 'email' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 4px 0;">Welcome back</h1>
            <p style="font-size: 13px; color: var(--color-text-muted); margin: 0;">Sign in to your account with your email address.</p>
          </div>

          <form onsubmit="AerosolAuth.handleEmailSubmit(event)">
            <div style="margin-bottom: 18px; text-align: left;">
              <label class="label" for="auth-email-input" style="font-weight: 600; margin-bottom: 6px; display: block;">Email address</label>
              <input type="email" id="auth-email-input" class="input input-lg" placeholder="Enter your email address" required value="${this.email}" autocomplete="username">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 20px;">
              ${this.loading ? 'Checking account...' : 'Continue →'}
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
            <span>OR</span>
            <div style="flex: 1; height: 1px; background: var(--color-border);"></div>
          </div>

          <!-- GOOGLE OAUTH BUTTON -->
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

        <!-- STEP 2A: EXISTING USER PASSWORD STEP -->
        ${this.step === 'login' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0 0 6px 0;">Welcome back</h1>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; color: var(--color-text-secondary);">
              <span>${this.email}</span>
              <button onclick="AerosolAuth.step='email'; AerosolAuth.render();" style="font-size: 11px; color: var(--color-text-muted); cursor: pointer; text-decoration: underline; background: none; border: none;">Change</button>
            </div>
          </div>

          <form onsubmit="AerosolAuth.handleLoginSubmit(event)">
            <div style="margin-bottom: 18px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" for="login-pass-input" style="font-weight: 600; margin-bottom: 0;">Password</label>
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('login-pass-input')" style="font-size: 11px; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Show</button>
              </div>
              <input type="password" id="login-pass-input" class="input input-lg" placeholder="Enter your password" required autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Signing in...' : 'Sign In →'}
            </button>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <button type="button" onclick="AerosolAuth.step='forgot'; AerosolAuth.render();" style="color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">Forgot password?</button>
              <button type="button" onclick="AerosolAuth.switchTab('register')" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Create account instead</button>
            </div>
          </form>
        ` : ''}

        <!-- STEP 2B: SIGNUP / CREATE ACCOUNT SCREEN -->
        ${this.step === 'register' ? `
          <div style="margin-bottom: 20px; text-align: left;">
            <h1 style="font-size: 22px; font-weight: 700; color: var(--color-text); margin: 0 0 6px 0;">Create your account</h1>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">Sign up to place orders, track shipments, and access chemical formulations.</p>
          </div>

          <form onsubmit="AerosolAuth.handleRegisterSubmit(event)">
            <!-- REQUIRED: Full name -->
            <div style="margin-bottom: 14px; text-align: left;">
              <label class="label" for="reg-name-input" style="font-weight: 600; margin-bottom: 6px; display: block;">
                Full Name <span style="color: var(--color-error);">*</span>
              </label>
              <input type="text" id="reg-name-input" class="input input-lg" placeholder="Jane Smith" required autocomplete="name" value="${this.name || ''}">
            </div>

            <!-- REQUIRED: Email address -->
            <div style="margin-bottom: 14px; text-align: left;">
              <label class="label" for="reg-email-input" style="font-weight: 600; margin-bottom: 6px; display: block;">
                Email <span style="color: var(--color-error);">*</span>
              </label>
              <input type="email" id="reg-email-input" class="input input-lg" placeholder="name@example.com" required autocomplete="email" value="${this.email || ''}">
            </div>

            <!-- REQUIRED: Password -->
            <div style="margin-bottom: 14px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" for="reg-pass-input" style="font-weight: 600; margin-bottom: 0;">
                  Password <span style="color: var(--color-error);">*</span>
                </label>
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('reg-pass-input')" style="font-size: 11px; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Show</button>
              </div>
              <input type="password" id="reg-pass-input" class="input input-lg" placeholder="At least 6 characters" required minlength="6" autocomplete="new-password">
            </div>

            <!-- REQUIRED: Confirm password -->
            <div style="margin-bottom: 16px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" for="reg-confirm-pass-input" style="font-weight: 600; margin-bottom: 0;">
                  Confirm Password <span style="color: var(--color-error);">*</span>
                </label>
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('reg-confirm-pass-input')" style="font-size: 11px; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Show</button>
              </div>
              <input type="password" id="reg-confirm-pass-input" class="input input-lg" placeholder="Re-enter your password" required minlength="6" autocomplete="new-password">
            </div>

            <!-- OPTIONAL DETAILS TOGGLE (Phone number & Date of birth) -->
            <div style="margin-bottom: 16px; border: 1px dashed var(--color-border); border-radius: var(--radius-sm); padding: 10px 14px; background: var(--color-bg-subtle); text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="AerosolAuth.toggleOptionalFields()">
                <span style="font-size: 12px; font-weight: 600; color: var(--color-text);">Optional details (Phone, Date of birth)</span>
                <span id="optional-toggle-icon" style="font-size: 11px; color: var(--color-text-muted); font-weight: 500;">
                  ${this.showOptional ? '▲ Hide' : '▼ Add'}
                </span>
              </div>
              <div id="reg-optional-section" style="display: ${this.showOptional ? 'block' : 'none'}; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border);">
                <div style="margin-bottom: 10px;">
                  <label class="label" for="reg-phone-input" style="font-size: 11px; margin-bottom: 4px; display: block;">
                    Phone number <span style="color: var(--color-text-muted); font-weight: 400;">— useful for order updates/OTP</span>
                  </label>
                  <input type="tel" id="reg-phone-input" class="input" placeholder="+1 (555) 000-0000" autocomplete="tel">
                </div>
                <div>
                  <label class="label" for="reg-dob-input" style="font-size: 11px; margin-bottom: 4px; display: block;">
                    Date of birth <span style="color: var(--color-text-muted); font-weight: 400;">— optional age verification</span>
                  </label>
                  <input type="date" id="reg-dob-input" class="input">
                </div>
              </div>
            </div>

            <!-- DON'T ASK AT SIGNUP REASSURANCE -->
            <div style="margin-bottom: 16px; padding: 9px 12px; background: var(--color-bg-subtle); border-radius: var(--radius-sm); font-size: 11px; color: var(--color-text-muted); text-align: left; line-height: 1.45;">
              🔒 We never ask for payment details, UPI ID, delivery address, or bank information at signup. These are collected safely only when needed during checkout.
            </div>

            <!-- T&C / PRIVACY / MARKETING CONSENTS -->
            <div style="margin-bottom: 22px; display: flex; flex-direction: column; gap: 12px; text-align: left;">
              <!-- Checkbox 1: Terms & Conditions -->
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-terms-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;" required>
                <span>
                  I agree to the <a href="javascript:void(0)" onclick="AerosolAuth.openPolicyModal('terms')" style="text-decoration: underline; color: var(--color-text); font-weight: 600;">Terms &amp; Conditions</a> and understand the store's policies. <span style="color: var(--color-error);">*</span>
                </span>
              </label>

              <!-- Checkbox 2: Privacy Policy -->
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-privacy-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;" required>
                <span>
                  I have read and understand the <a href="javascript:void(0)" onclick="AerosolAuth.openPolicyModal('privacy')" style="text-decoration: underline; color: var(--color-text); font-weight: 600;">Privacy Policy</a>. <span style="color: var(--color-error);">*</span>
                </span>
              </label>

              <!-- Checkbox 3: Marketing (Optional, NEVER PRE-CHECKED) -->
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-marketing-check" style="margin-top: 2px; accent-color: var(--color-text); width: 16px; height: 16px; flex-shrink: 0;">
                <span>
                  Send me offers, discounts, and promotional updates by email/SMS. <span style="color: var(--color-text-muted);">(Optional)</span>
                </span>
              </label>
            </div>

            <!-- SUBMIT: CREATE ACCOUNT -->
            <button type="submit" class="btn btn-inverted btn-lg btn-full" id="create-account-btn" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <!-- SWITCH TO LOGIN -->
            <div style="text-align: center; font-size: 13px; color: var(--color-text-muted);">
              Already have an account? <button type="button" onclick="AerosolAuth.switchTab('login')" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Log in</button>
            </div>
          </form>
        ` : ''}

        <!-- STEP 3: FORGOT PASSWORD -->
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
              <button type="button" onclick="AerosolAuth.switchTab('login')" style="color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">← Return to sign in</button>
            </div>
          </form>
        ` : ''}

      </div>
    `;
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
        if (data.exists) {
          this.step = 'login';
        } else {
          this.step = 'register';
        }
      } else {
        this.errorMsg = data.message || 'Error checking account.';
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Could not connect to authentication service. Please try again.';
    }

    this.render();
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const passInput = document.getElementById('login-pass-input');
    if (!passInput || !passInput.value) return;

    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: passInput.value,
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

        // If admin logged in through unified login, store admin session for admin console
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

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const isAdm = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
          const target = isAdm ? '/admin.html' : (this.redirectUrl || '/index.html');
          setTimeout(() => { window.location.href = target; }, 300);
        }
      } else {
        this.errorMsg = data.message || 'The password you entered is incorrect.';
        this.render();
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Authentication service offline. Please try again.';
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
      this.errorMsg = 'Passwords do not match. Please re-enter your password.';
      this.render();
      return;
    }

    if (!termsCheck || !termsCheck.checked) {
      this.errorMsg = "Please agree to the Terms & Conditions and understand the store's policies.";
      this.render();
      return;
    }

    if (!privacyCheck || !privacyCheck.checked) {
      this.errorMsg = 'Please confirm that you have read and understand the Privacy Policy.';
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
        AerosolWebapp.showToast(`Account created for ${data.user.name}!`);

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
      this.errorMsg = 'Registration service offline. Please try again.';
      this.render();
    }
  },

  async handleGoogleAuth() {
    this.loading = true;
    this.errorMsg = '';
    AerosolWebapp.showToast('Connecting to Google OAuth identity provider...');

    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email || 'user.google@gmail.com',
          name: 'Google Verified User',
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
        AerosolWebapp.showToast(`Authenticated via Google (${data.user.email})!`);

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const isAdm = data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN';
          const target = isAdm ? '/admin.html' : (this.redirectUrl || '/index.html');
          setTimeout(() => { window.location.href = target; }, 300);
        }
      }
    } catch (err) {
      this.loading = false;
      this.errorMsg = 'Google authentication failed.';
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

  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
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
