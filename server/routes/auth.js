import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import passport from 'passport';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { rateLimiter, sanitizeRedirectUrl, logAudit } from '../middleware/securityMiddleware.js';

dotenv.config();

export const getAdminConfig = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      Object.assign(process.env, parsed);
    }
  } catch (err) {
    // fallback to existing env
  }

  return {
    adminId: (process.env.ADMIN_ID || '').trim(),
    adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    adminPassword: (process.env.ADMIN_PASSWORD || '').trim()
  };
};

export const isAdminIdentifier = (identifier) => {
  if (!identifier) return false;
  const q = identifier.trim().toLowerCase();
  const cfg = getAdminConfig();
  return (cfg.adminId && q === cfg.adminId.toLowerCase()) ||
         (cfg.adminEmail && q === cfg.adminEmail.toLowerCase());
};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aerosol_secret_jwt_key_2026_super_secure';

const usersFilePath = path.join(process.cwd(), 'server', 'data', 'users.json');

const loadUsersFromFile = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = JSON.parse(fs.readFileSync(usersFilePath, 'utf8') || '[]');
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Could not load users.json:', e.message);
  }
  return null;
};

const initialUsersFromFile = loadUsersFromFile();

export const usersDB = initialUsersFromFile || [
  {
    id: 'usr-101',
    name: 'Dr. Marcus Sterling',
    email: 'm.sterling@novaaero.com',
    password: 'sterling123',
    phone: '+1 (206) 555-0182',
    role: 'CUSTOMER',
    company: 'NovaAero Dynamics LLC',
    tier: 'B2B Enterprise Gold',
    discountTier: 15,
    termsAccepted: true,
    isEmailVerified: true,
    mfaEnabled: false,
    authProviders: ['email'],
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00.000Z',
    addresses: []
  },
  {
    id: 'usr-102',
    name: 'Elena Rostova',
    email: 'elena.rostova@hypersonic.com',
    password: 'elena123',
    phone: '+1 (415) 555-0199',
    role: 'CUSTOMER',
    company: 'HyperSonic Detailing',
    tier: 'Commercial Member',
    discountTier: 10,
    termsAccepted: true,
    isEmailVerified: true,
    mfaEnabled: false,
    authProviders: ['email', 'google'],
    status: 'ACTIVE',
    createdAt: '2026-02-10T11:20:00.000Z',
    addresses: []
  },
  {
    id: 'usr-admin',
    name: 'Operations Administrator',
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    phone: '+1 (800) 555-AERO',
    role: 'ADMIN',
    company: 'Aerosol Webapp HQ',
    tier: 'Super Administrator',
    discountTier: 0,
    termsAccepted: true,
    isEmailVerified: true,
    mfaEnabled: true,
    authProviders: ['email'],
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    addresses: []
  }
];

const resetTokens = new Map();
const activeSessions = new Set();

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 100 * 365 * 24 * 60 * 60 * 1000 // 100 years - session persists indefinitely until logout
};

export const generateToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company || '',
      tier: user.tier || 'Customer'
    },
    JWT_SECRET,
    { expiresIn: '36500d' } // 100 years - never automatically logged out
  );
  activeSessions.add(token);
  return token;
};

export const saveUsersToFile = () => {
  try {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Filter out temporary admin from saving into users.json if admin is in env
    const persistable = usersDB.filter(u => u.id !== 'usr-admin');
    fs.writeFileSync(usersFilePath, JSON.stringify(persistable, null, 2));
  } catch (e) {
    console.error('Failed to save users to disk:', e);
  }
};

/**
 * Finds an existing user by googleId or email, or registers a brand new user.
 * Supports Passport.js Google OAuth 2.0 strategy and GIS token verification.
 */
export const findOrCreateGoogleUser = async ({ googleId, email, name, picture }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  let user = usersDB.find((u) => 
    (googleId && u.googleId === googleId) ||
    (u.email && u.email.toLowerCase() === cleanEmail && u.status !== 'DEACTIVATED')
  );

  if (user) {
    // Existing user: Link Google account
    if (!user.authProviders) user.authProviders = ['email'];
    if (!user.authProviders.includes('google')) {
      user.authProviders.push('google');
    }
    if (googleId) user.googleId = googleId;
    if (picture && (!user.picture || user.picture.includes('default') || user.picture.includes('unsplash'))) {
      user.picture = picture;
    }
    user.isEmailVerified = true;
    saveUsersToFile();
    logAudit('ACCOUNT_LINKED_GOOGLE', {
      userId: user.id,
      email: user.email,
      googleId: user.googleId,
      name: user.name,
      authMethod: 'Passport.js Google OAuth'
    });
  } else {
    // Brand new user: Automatically register new account
    user = {
      id: `usr-goog-${Date.now()}`,
      name: (name || 'Google User').trim(),
      email: cleanEmail,
      password: null, // Never store passwords for OAuth-authenticated users
      picture: picture || '',
      googleId: googleId || null,
      phone: '',
      company: '',
      dob: '',
      role: 'CUSTOMER',
      tier: 'Google Verified Member',
      discountTier: 5,
      termsAccepted: true,
      privacyAccepted: true,
      marketingAccepted: false,
      isEmailVerified: true,
      mfaEnabled: false,
      authProviders: ['google'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      addresses: []
    };
    usersDB.push(user);
    saveUsersToFile();
    logAudit('USER_CREATED_GOOGLE', {
      userId: user.id,
      email: user.email,
      googleId: user.googleId,
      name: user.name,
      authMethod: 'Passport.js Google OAuth'
    });
  }

  // Synchronize to MongoDB User document if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          googleId: user.googleId,
          authProviders: user.authProviders,
          isEmailVerified: true,
          role: user.role,
          tier: user.tier,
          status: user.status
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (dbErr) {
      // Graceful fallback to in-memory / JSON persistence
    }
  }

  return user;
};

// Public auth configuration
router.get('/config', (req, res) => {
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const isConfigured = Boolean(
    googleClientId &&
    googleClientSecret &&
    !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID')
  );

  res.json({
    success: true,
    googleClientId,
    isConfigured,
    isPassportConfigured: isConfigured,
    authStrategy: 'passport-google-oauth20',
    callbackUrl: `${appUrl}/api/v1/auth/google/callback`,
    appUrl
  });
});

// Passport.js Google OAuth 2.0 - Initiate Sign-In / Registration
router.get('/google', (req, res, next) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  const redirectTarget = sanitizeRedirectUrl(req.query.redirect, '/account.html');

  if (!clientId || !clientSecret || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    return res.redirect(
      `/login.html?error=${encodeURIComponent('Google OAuth is not configured in .env. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')}&show_guide=1`
    );
  }

  const state = Buffer.from(JSON.stringify({ returnTo: redirectTarget })).toString('base64');

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state
  })(req, res, next);
});

// Passport.js Google OAuth 2.0 - Callback Endpoint
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err || !user) {
      const errorMsg = err?.message || info?.message || 'Google authentication failed.';
      console.warn('Passport Google OAuth callback failure:', errorMsg);
      return res.redirect(`/login.html?error=${encodeURIComponent(errorMsg)}`);
    }

    try {
      let returnTo = '/account.html';
      if (req.query.state) {
        try {
          const parsed = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf8'));
          if (parsed?.returnTo) {
            returnTo = sanitizeRedirectUrl(parsed.returnTo, '/account.html');
          }
        } catch (e) {
          // ignore malformed state
        }
      }

      const token = generateToken(user);

      // Set HTTP-only persistent session cookie (100 years - never expires automatically)
      res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);

      const isTargetAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
      const destination = isTargetAdmin ? '/admin.html' : returnTo;
      const separator = destination.includes('?') ? '&' : '?';

      return res.redirect(
        `${destination}${separator}token=${encodeURIComponent(token)}&google_auth=success&name=${encodeURIComponent(user.name)}`
      );
    } catch (tokenErr) {
      console.error('Error generating token in Google callback:', tokenErr);
      return res.redirect(`/login.html?error=${encodeURIComponent('Failed to generate authentication session.')}`);
    }
  })(req, res, next);
});

// Admin login handler for admin portal
router.post('/admin-login', rateLimiter(30, 60000), (req, res) => {
  const { adminId, password, email } = req.body;
  const inputId = (adminId || email || '').trim().toLowerCase();
  if (!inputId || !password) {
    return res.status(400).json({ success: false, message: 'Please enter both admin ID/email and password.' });
  }

  const cfg = getAdminConfig();
  const isMatch = isAdminIdentifier(inputId) && password.trim() === cfg.adminPassword;

  if (isMatch) {
    const adminUser = {
      id: cfg.adminId,
      name: 'Operations Administrator',
      email: inputId.includes('@') ? inputId : cfg.adminEmail,
      role: 'ADMIN',
      tier: 'Super Administrator'
    };
    const token = generateToken(adminUser);
    res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);
    logAudit('ADMIN_DIRECT_LOGIN_SUCCESS', {
      adminId: inputId,
      name: adminUser.name,
      email: adminUser.email,
      role: 'ADMIN',
      authMethod: 'Admin Direct Console',
      loginTime: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Admin access granted.',
      token,
      data: {
        ...adminUser,
        token
      }
    });
  }

  logAudit('ADMIN_DIRECT_LOGIN_FAILED', { adminId: inputId, ip: req.ip });
  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials.'
  });
});

// Check if user/admin email exists
router.post('/email-lookup', rateLimiter(30, 60000), (req, res) => {
  const { email, identifier } = req.body;
  const input = (email || identifier || '').trim();

  if (!input) {
    return res.status(400).json({ success: false, message: 'Please enter your email address.' });
  }

  const cleanInput = input.toLowerCase();
  const cfg = getAdminConfig();

  if (isAdminIdentifier(cleanInput)) {
    return res.json({
      success: true,
      exists: true,
      email: cleanInput.includes('@') ? cleanInput : cfg.adminEmail,
      name: 'Operations Administrator',
      isGoogleConnected: false,
      role: 'ADMIN',
      requiresMfa: false
    });
  }

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanInput && u.status !== 'DEACTIVATED');

  if (user) {
    return res.json({
      success: true,
      exists: true,
      email: user.email,
      name: user.name,
      isGoogleConnected: user.authProviders?.includes('google') || false,
      role: user.role || 'CUSTOMER',
      isEmailVerified: user.isEmailVerified
    });
  }

  return res.json({
    success: true,
    exists: false,
    email: cleanInput,
    name: null,
    role: 'CUSTOMER'
  });
});

// Standard user & admin login
router.post('/login', rateLimiter(30, 60000), (req, res) => {
  const { email, password, redirect } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const q = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectUrl(redirect, '/admin.html');
  const cfg = getAdminConfig();

  if (isAdminIdentifier(q) && password.trim() === cfg.adminPassword) {
    const adminUser = {
      id: cfg.adminId,
      name: 'Operations Administrator',
      email: q.includes('@') ? q : cfg.adminEmail,
      role: 'ADMIN',
      tier: 'Super Administrator'
    };
    const token = generateToken(adminUser);
    res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);
    logAudit('ADMIN_LOGIN_SUCCESS', {
      adminId: cfg.adminId,
      name: adminUser.name,
      email: adminUser.email,
      role: 'ADMIN',
      authMethod: 'Unified Admin Login',
      loginTime: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Signed in successfully as Admin.',
      token,
      redirectUrl: '/admin.html',
      user: {
        id: cfg.adminId,
        name: 'Operations Administrator',
        email: q.includes('@') ? q : cfg.adminEmail,
        role: 'ADMIN',
        tier: 'Super Administrator',
        company: 'Aerosol Webapp HQ',
        phone: '+1 (800) 555-AERO',
        addresses: [],
        isEmailVerified: true,
        authProviders: ['email']
      }
    });
  }

  const user = usersDB.find((u) => u.email.toLowerCase() === q && u.status !== 'DEACTIVATED');

  if (!user || user.password !== password) {
    logAudit('LOGIN_FAILED', { email: q, ip: req.ip });
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password. Please try again.'
    });
  }

  const token = generateToken(user);
  res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);
  logAudit('LOGIN_SUCCESS', {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || 'Not provided',
    role: user.role || 'CUSTOMER',
    authMethod: 'Email & Password',
    loginTime: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    redirectUrl: safeRedirect,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'CUSTOMER',
      company: user.company || '',
      phone: user.phone || '',
      addresses: user.addresses || [],
      tier: user.tier || 'Standard Member',
      isEmailVerified: user.isEmailVerified,
      authProviders: user.authProviders || ['email']
    }
  });
});

// Register new account
router.post('/register', rateLimiter(10, 60000), (req, res) => {
  const {
    email,
    name,
    password,
    confirmPassword,
    termsAccepted,
    privacyAccepted,
    phone,
    dob,
    marketingAccepted,
    redirect
  } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Please enter your full name.' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({
      success: false,
      message: 'Please agree to the Terms & Conditions.'
    });
  }

  if (!privacyAccepted) {
    return res.status(400).json({
      success: false,
      message: 'Please accept the Privacy Policy.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectUrl(redirect, '/account.html');
  const existing = usersDB.find((u) => u.email.toLowerCase() === cleanEmail && u.status !== 'DEACTIVATED');

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `An account already exists for ${cleanEmail}. Please sign in.`
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    phone: (phone || '').trim(),
    dob: (dob || '').trim(),
    role: 'CUSTOMER',
    company: '',
    tier: 'Standard Member',
    discountTier: 0,
    termsAccepted: true,
    privacyAccepted: true,
    marketingAccepted: Boolean(marketingAccepted),
    isEmailVerified: false,
    mfaEnabled: false,
    authProviders: ['email'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    addresses: []
  };

  usersDB.push(newUser);
  const token = generateToken(newUser);
  res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);

  logAudit('USER_REGISTERED', {
    userId: newUser.id,
    email: newUser.email,
    marketingAccepted: newUser.marketingAccepted,
    role: 'CUSTOMER'
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    redirectUrl: safeRedirect,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      dob: newUser.dob,
      role: 'CUSTOMER',
      company: newUser.company,
      tier: newUser.tier,
      addresses: newUser.addresses,
      isEmailVerified: false,
      authProviders: ['email']
    }
  });
});

// Google sign-in (Secure Google Identity Services / OAuth 2.0)
router.post('/google', rateLimiter(20, 60000), async (req, res) => {
  const { credential, redirect, isDevMock, devUser } = req.body;
  const safeRedirect = sanitizeRedirectUrl(redirect, '/account.html');

  let verifiedGoogleData = null;

  // 1. Production Google ID Token Verification
  if (credential) {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    if (!clientId) {
      logAudit('GOOGLE_LOGIN_ERROR_NOCLIENTID', { ip: req.ip });
      return res.status(500).json({
        success: false,
        message: 'Google Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID in your .env file.'
      });
    }

    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.sub || !payload.email) {
        logAudit('GOOGLE_TOKEN_INVALID_PAYLOAD', { ip: req.ip });
        return res.status(401).json({
          success: false,
          message: 'Invalid Google credential token payload.'
        });
      }

      verifiedGoogleData = {
        googleId: payload.sub,
        email: payload.email.trim().toLowerCase(),
        name: payload.name || payload.given_name || 'Google Verified User',
        picture: payload.picture || '',
        emailVerified: Boolean(payload.email_verified)
      };
    } catch (verifyError) {
      logAudit('GOOGLE_TOKEN_VERIFY_FAILED', {
        error: verifyError.message,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: `Google token verification failed: ${verifyError.message}`
      });
    }
  } else if (isDevMock && process.env.NODE_ENV !== 'production') {
    // Non-production local development simulation helper
    verifiedGoogleData = {
      googleId: devUser?.googleId || `goog-mock-${Date.now()}`,
      email: (devUser?.email || 'user.google@gmail.com').trim().toLowerCase(),
      name: devUser?.name || 'Google Verified User',
      picture: devUser?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      emailVerified: true
    };
    logAudit('GOOGLE_DEV_MOCK_LOGIN', { email: verifiedGoogleData.email, ip: req.ip });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Google credential token is required for authentication.'
    });
  }

  // 2. Database Lookup & Account Linking / Creation via Unified Helper
  const user = await findOrCreateGoogleUser({
    googleId: verifiedGoogleData.googleId,
    email: verifiedGoogleData.email,
    name: verifiedGoogleData.name,
    picture: verifiedGoogleData.picture
  });

  // 3. Issue JWT Token & Set Secure HTTP-only Cookie
  const token = generateToken(user);
  res.cookie('aerosol_token', token, AUTH_COOKIE_OPTIONS);

  const isTargetAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return res.json({
    success: true,
    message: `Welcome back, ${user.name}! Signed in with Google.`,
    token,
    redirectUrl: isTargetAdmin ? '/admin.html' : safeRedirect,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture || '',
      googleId: user.googleId || '',
      role: user.role,
      tier: user.tier,
      isEmailVerified: true,
      authProviders: user.authProviders
    }
  });
});

// Request password reset code
router.post('/forgot-password', rateLimiter(5, 60000), (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  resetTokens.set(cleanEmail, { token, expiresAt: Date.now() + 15 * 60 * 1000, used: false });

  logAudit('PASSWORD_RESET_REQUESTED', { email: cleanEmail });

  res.json({
    success: true,
    message: `A reset code has been sent to ${cleanEmail}. (Demo code: ${token})`
  });
});

// Reset password with code
router.post('/reset-password', rateLimiter(5, 60000), (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = resetTokens.get(cleanEmail);

  if (!record || record.used || record.token !== token || record.expiresAt < Date.now()) {
    logAudit('PASSWORD_RESET_FAILED', { email: cleanEmail });
    return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
  }

  record.used = true;
  resetTokens.delete(cleanEmail);

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.password = newPassword;
    logAudit('PASSWORD_RESET_SUCCESS', { userId: user.id, email: user.email });
  }

  res.json({
    success: true,
    message: 'Password updated successfully. You can now log in.'
  });
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.aerosol_token;
  if (token) activeSessions.delete(token);

  res.clearCookie('aerosol_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  logAudit('LOGOUT_SUCCESS', { userId: req.user.id });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Deactivate account
router.delete('/account', requireAuth, (req, res) => {
  const userId = req.user.id;
  const user = usersDB.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  user.status = 'DEACTIVATED';
  user.password = null;
  user.phone = '[REDACTED]';

  res.clearCookie('aerosol_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  logAudit('ACCOUNT_DEACTIVATED', { userId, email: user.email });
  res.json({
    success: true,
    message: 'Your account has been deactivated.'
  });
});

// Current user profile
router.get('/me', requireAuth, (req, res) => {
  const user = usersDB.find((u) => u.id === req.user.id && u.status !== 'DEACTIVATED') || req.user;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture || '',
      googleId: user.googleId || '',
      role: user.role || 'CUSTOMER',
      company: user.company || '',
      phone: user.phone || '',
      addresses: user.addresses || [],
      tier: user.tier || 'Standard Member',
      isEmailVerified: user.isEmailVerified ?? true,
      authProviders: user.authProviders || ['email']
    }
  });
});

// Update profile
router.put('/profile', (req, res) => {
  const { email, name, phone, company } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'User email is required.' });

  const user = usersDB.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (company !== undefined) user.company = company.trim();
  }
  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user
  });
});

// Update saved shipping addresses
router.put('/addresses', (req, res) => {
  const { email, addresses } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'User email is required.' });

  const user = usersDB.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    user.addresses = Array.isArray(addresses) ? addresses : [];
  }
  res.json({
    success: true,
    message: 'Addresses saved successfully!',
    addresses: user ? user.addresses : addresses
  });
});

// Admin view of recent user logins
router.get('/admin/logins', (req, res) => {
  try {
    const logFile = path.join(process.cwd(), 'server', 'data', 'audit_logs.json');
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8') || '[]');
    }

    const loginTypes = new Set([
      'LOGIN_SUCCESS',
      'USER_REGISTERED',
      'ADMIN_LOGIN_SUCCESS',
      'ADMIN_DIRECT_LOGIN_SUCCESS',
      'ACCOUNT_LINKED_GOOGLE',
      'USER_CREATED_GOOGLE'
    ]);

    const logins = logs
      .filter(l => loginTypes.has(l.eventType))
      .map(l => {
        const d = l.details || {};
        const matchedUser = usersDB.find(u => 
          (d.userId && u.id === d.userId) || 
          (d.email && u.email.toLowerCase() === d.email.toLowerCase()) ||
          (d.adminId && (u.id === d.adminId || u.email.toLowerCase() === d.adminId.toLowerCase()))
        );

        return {
          id: l.id,
          name: d.name || (matchedUser ? matchedUser.name : (d.adminId ? 'Operations Administrator' : 'Customer User')),
          phone: d.phone || (matchedUser && matchedUser.phone ? matchedUser.phone : 'Not provided'),
          email: d.email || (matchedUser ? matchedUser.email : (d.adminId || 'N/A')),
          role: d.role || (matchedUser ? matchedUser.role : (l.eventType.includes('ADMIN') ? 'ADMIN' : 'CUSTOMER')),
          authMethod: d.authMethod || (l.eventType.includes('ADMIN') ? 'Admin Login' : l.eventType.includes('GOOGLE') ? 'Google OAuth' : 'Email & Password'),
          timestamp: d.loginTime || l.timestamp,
          ip: d.ip || '127.0.0.1'
        };
      });

    res.json({
      success: true,
      total: logins.length,
      data: logins
    });
  } catch (err) {
    console.error('Failed to read login audits:', err);
    res.status(500).json({ success: false, message: 'Could not load login history' });
  }
});

export default router;
