const AerosolAuth = {
  step: 'email', // 'email' | 'login' | 'register' | 'forgot' | 'verify' | 'profile'
  email: '',
  name: '',
  redirectUrl: '',
  errorMsg: '',
  loading: false,

  init(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.containerId = containerId;
    this.redirectUrl = options.redirectUrl || this.getRedirectParam() || '';
    this.onSuccess = options.onSuccess || null;
    this.step = 'email';
    this.email = '';
    this.errorMsg = '';
    this.loading = false;

    this.render();
  },

  getRedirectParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '';
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
            ` : `
              <a href="${this.redirectUrl || '/account.html'}" class="btn btn-inverted btn-lg btn-full" style="text-align: center;">Continue to Account Portal →</a>
            `}
            <button onclick="AerosolAuth.switchAccount()" class="btn btn-neutral btn-md btn-full">Sign in with a different account</button>
            <button onclick="AerosolWebapp.logout()" class="btn btn-ghost btn-sm btn-full" style="color: var(--color-error);">Sign Out</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="auth-card" style="max-width: 440px; margin: 0 auto; background: var(--color-card-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 36px 32px; box-shadow: var(--shadow-overlay);">
        
        <!-- BRAND LOGO & HEADER -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="/index.html" style="font-size: 18px; font-weight: 700; color: var(--color-text); letter-spacing: -0.02em; text-decoration: none;">
            Aerosol Webapp
          </a>
          
          ${this.step === 'email' ? `
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 12px; margin-bottom: 4px;">Welcome back</h1>
            <p style="font-size: 13px; color: var(--color-text-muted);">Sign in to your account or create a new one</p>
          ` : this.step === 'login' ? `
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 12px; margin-bottom: 4px;">Welcome back</h1>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
              <span>${this.email}</span>
              <button onclick="AerosolAuth.step='email'; AerosolAuth.render();" style="font-size: 11px; color: var(--color-text-muted); cursor: pointer; text-decoration: underline;">Change</button>
            </div>
          ` : this.step === 'register' ? `
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 12px; margin-bottom: 4px;">Create your account</h1>
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
              <span>${this.email}</span>
              <button onclick="AerosolAuth.step='email'; AerosolAuth.render();" style="font-size: 11px; color: var(--color-text-muted); cursor: pointer; text-decoration: underline;">Change</button>
            </div>
          ` : `
            <h1 style="font-size: 20px; font-weight: 700; color: var(--color-text); margin-top: 12px; margin-bottom: 4px;">Reset password</h1>
            <p style="font-size: 13px; color: var(--color-text-muted);">Enter your email to receive password reset instructions</p>
          `}
        </div>

        ${this.errorMsg ? `
          <div style="padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: var(--color-error); background: var(--color-error-bg); border: 1px solid #fca5a5; border-radius: var(--radius-sm); line-height: 1.45;">
            ${this.errorMsg}
          </div>
        ` : ''}

        <!-- STEP 1: EMAIL-FIRST INPUT -->
        ${this.step === 'email' ? `
          <form onsubmit="AerosolAuth.handleEmailSubmit(event)">
            <div style="margin-bottom: 18px;">
              <label class="label">Email address or Admin ID</label>
              <input type="text" id="auth-email-input" class="input input-lg" placeholder="Enter your email or Admin ID" required value="${this.email}" autocomplete="username">
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

          <div style="text-align: center; font-size: 12px; color: var(--color-text-muted);">
            New here? <button type="button" onclick="AerosolAuth.step='register'; AerosolAuth.render();" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Create an account</button>
          </div>
        ` : ''}

        <!-- STEP 2A: EXISTING USER PASSWORD STEP -->
        ${this.step === 'login' ? `
          <form onsubmit="AerosolAuth.handleLoginSubmit(event)">
            <div style="margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" style="margin-bottom: 0;">Password</label>
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('login-pass-input')" style="font-size: 11px; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Show</button>
              </div>
              <input type="password" id="login-pass-input" class="input input-lg" placeholder="Enter your password" required autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Signing in...' : 'Sign In →'}
            </button>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <button type="button" onclick="AerosolAuth.step='forgot'; AerosolAuth.render();" style="color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">Forgot password?</button>
              <button type="button" onclick="AerosolAuth.step='register'; AerosolAuth.render();" style="color: var(--color-text); font-weight: 500; text-decoration: underline; background: none; border: none; cursor: pointer;">Create account instead</button>
            </div>
          </form>
        ` : ''}

        <!-- STEP 2B: NEW USER REGISTRATION STEP -->
        ${this.step === 'register' ? `
          <form onsubmit="AerosolAuth.handleRegisterSubmit(event)">
            <div style="margin-bottom: 14px;">
              <label class="label">Full name</label>
              <input type="text" id="reg-name-input" class="input input-lg" placeholder="Jane Smith" required autocomplete="name" value="${this.name}">
            </div>

            <div style="margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="label" style="margin-bottom: 0;">Create password</label>
                <button type="button" onclick="AerosolAuth.togglePasswordVisibility('reg-pass-input')" style="font-size: 11px; color: var(--color-text-muted); background: none; border: none; cursor: pointer;">Show</button>
              </div>
              <input type="password" id="reg-pass-input" class="input input-lg" placeholder="At least 6 characters" required minlength="6" autocomplete="new-password">
            </div>

            <div style="margin-bottom: 20px; padding: 12px 14px; background: var(--color-bg-subtle); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
              <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; line-height: 1.45; color: var(--color-text-secondary);">
                <input type="checkbox" id="reg-terms-check" style="margin-top: 2px; accent-color: var(--color-text); width: 15px; height: 15px;" required>
                <span>
                  I mark and agree to the <a href="/faq.html" target="_blank" style="text-decoration: underline; color: var(--color-text); font-weight: 500;">Terms of Service</a>, HazMat Regulations, and Privacy Policy. *
                </span>
              </label>
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Creating account...' : 'Create Account →'}
            </button>

            <div style="text-align: center; font-size: 12px; color: var(--color-text-muted);">
              Already have an account? <button type="button" onclick="AerosolAuth.step='login'; AerosolAuth.render();" style="color: var(--color-text); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">Sign in</button>
            </div>
          </form>
        ` : ''}

        <!-- STEP 3: FORGOT PASSWORD -->
        ${this.step === 'forgot' ? `
          <form onsubmit="AerosolAuth.handleForgotSubmit(event)">
            <div style="margin-bottom: 18px;">
              <label class="label">Email address</label>
              <input type="email" id="forgot-email-input" class="input input-lg" placeholder="name@example.com" required value="${this.email}">
            </div>

            <button type="submit" class="btn btn-inverted btn-lg btn-full" ${this.loading ? 'disabled' : ''} style="margin-bottom: 16px;">
              ${this.loading ? 'Sending link...' : 'Send Reset Link →'}
            </button>

            <div style="text-align: center; font-size: 12px;">
              <button type="button" onclick="AerosolAuth.step='login'; AerosolAuth.render();" style="color: var(--color-text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">← Return to sign in</button>
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

    this.email = emailInput.value.trim();
    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email })
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
        this.errorMsg = data.message || 'Error checking email.';
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
          const target = data.user.role === 'ADMIN' ? '/admin.html' : (data.redirectUrl || '/account.html');
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
    const passInput = document.getElementById('reg-pass-input');
    const termsCheck = document.getElementById('reg-terms-check');

    if (!termsCheck || !termsCheck.checked) {
      this.errorMsg = 'You must mark and agree to the Terms of Service & HazMat Guidelines to create an account.';
      this.render();
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.render();

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          name: nameInput.value.trim(),
          password: passInput.value,
          termsAccepted: true,
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

        AerosolWebapp.showToast(`Account created for ${data.user.name}!`);

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const target = data.redirectUrl || '/account.html';
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

        AerosolWebapp.showToast(`Authenticated via Google (${data.user.email})!`);

        if (this.onSuccess) {
          this.onSuccess(data);
        } else {
          const target = data.redirectUrl || (data.user.role === 'ADMIN' ? '/admin.html' : '/account.html');
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
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  },

  switchAccount() {
    if (AerosolWebapp) {
      AerosolWebapp.user = null;
      localStorage.removeItem('aerosol_user');
      localStorage.removeItem('aerosol_token');
    }
    this.step = 'email';
    this.email = '';
    this.render();
  }
};

window.AerosolAuth = AerosolAuth;
