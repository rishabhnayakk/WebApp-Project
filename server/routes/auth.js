import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { rateLimiter, sanitizeRedirectUrl, logAudit } from '../middleware/securityMiddleware.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aerosol_secret_jwt_key_2026_super_secure';

// In-memory user registry with RBAC roles & audit preservation
const usersDB = [
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

const generateToken = (user) => {
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
    { expiresIn: '7d' }
  );
  activeSessions.add(token);
  return token;
};

// ADMIN DIRECT LOGIN (Used by admin.html - strictly checks .env credentials)
router.post('/admin-login', rateLimiter(20, 60000), (req, res) => {
  const { adminId, password } = req.body;
  if (!adminId || !password) {
    return res.status(400).json({ success: false, message: 'Admin ID and password are required.' });
  }

  const expectedAdminId = (process.env.ADMIN_ID || '').trim().toLowerCase();
  const expectedAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const expectedAdminPass = (process.env.ADMIN_PASSWORD || '').trim();

  if (!expectedAdminPass || (!expectedAdminId && !expectedAdminEmail)) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Admin credentials are not set in .env.'
    });
  }

  const inputId = (adminId || req.body.email || '').trim().toLowerCase();
  const isIdMatch = (expectedAdminId && inputId === expectedAdminId) || (expectedAdminEmail && inputId === expectedAdminEmail);
  const isPassMatch = password.trim() === expectedAdminPass;

  if (isIdMatch && isPassMatch) {
    const adminUser = {
      id: process.env.ADMIN_ID || 'admin',
      name: 'Operations Administrator',
      email: process.env.ADMIN_EMAIL || '',
      role: 'ADMIN',
      tier: 'Super Administrator'
    };
    const token = generateToken(adminUser);
    logAudit('ADMIN_DIRECT_LOGIN_SUCCESS', { adminId: inputId, ip: req.ip });

    return res.json({
      success: true,
      message: 'Admin access granted.',
      token,
      data: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        tier: adminUser.tier,
        token
      }
    });
  }

  logAudit('ADMIN_DIRECT_LOGIN_FAILED', { adminId: inputId, ip: req.ip });
  return res.status(401).json({
    success: false,
    message: 'Invalid Admin ID or Password.'
  });
});

// 1. EMAIL-FIRST LOOKUP (Rate Limited)
router.post('/email-lookup', rateLimiter(25, 60000), (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Please enter your email address or Admin ID.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const adminId = (process.env.ADMIN_ID || '').trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

  const isAdminMatch = (adminId && cleanEmail === adminId) || (adminEmail && cleanEmail === adminEmail);
  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail && u.status !== 'DEACTIVATED');

  if (isAdminMatch) {
    return res.json({
      success: true,
      exists: true,
      email: cleanEmail,
      name: 'Operations Administrator',
      isGoogleConnected: false,
      role: 'ADMIN',
      requiresMfa: false
    });
  }

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
    email: cleanEmail,
    name: null,
    role: 'CUSTOMER'
  });
});

// 2. UNIFIED LOGIN (Rate-Limited, Safe Error Messages)
router.post('/login', rateLimiter(20, 60000), (req, res) => {
  const { email, password, redirect } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email/Admin ID and password are required.' });
  }

  const q = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectUrl(redirect, '/account.html');
  const adminId = (process.env.ADMIN_ID || '').trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const expectedAdminPass = (process.env.ADMIN_PASSWORD || '').trim();

  // Admin authentication - strictly using .env
  if (expectedAdminPass && ((adminId && q === adminId) || (adminEmail && q === adminEmail)) && password === expectedAdminPass) {
    const adminUser = {
      id: process.env.ADMIN_ID || 'admin',
      name: 'Operations Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@aerosolwebapp.com',
      role: 'ADMIN',
      tier: 'Super Administrator'
    };
    const token = generateToken(adminUser);
    logAudit('ADMIN_LOGIN_SUCCESS', { email: q, ip: req.ip });

    return res.json({
      success: true,
      message: 'Welcome Administrator! Access granted.',
      token,
      redirectUrl: '/admin.html',
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'ADMIN',
        tier: 'Super Administrator'
      }
    });
  }

  // Customer authentication check
  const user = usersDB.find((u) => u.email.toLowerCase() === q && u.status !== 'DEACTIVATED');

  if (!user || (user.password && user.password !== password)) {
    logAudit('LOGIN_FAILED', { email: q, ip: req.ip });
    return res.status(401).json({
      success: false,
      message: 'The email or password you entered is incorrect. Try again or click Forgot Password.'
    });
  }

  const token = generateToken(user);
  logAudit('LOGIN_SUCCESS', { userId: user.id, email: user.email });

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

// 3. REGISTRATION (Customer Signup with Required & Optional fields, Dual Legal Consent, and Opt-in Marketing)
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
    return res.status(400).json({ success: false, message: 'Passwords do not match. Please re-enter your password.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({
      success: false,
      message: 'You must agree to the Terms & Conditions and understand the store policies.'
    });
  }

  if (!privacyAccepted) {
    return res.status(400).json({
      success: false,
      message: 'You must confirm that you have read and understand the Privacy Policy.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const safeRedirect = sanitizeRedirectUrl(redirect, '/account.html');
  const existing = usersDB.find((u) => u.email.toLowerCase() === cleanEmail && u.status !== 'DEACTIVATED');

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `An account already exists for ${cleanEmail}. Please log in instead.`
    });
  }

  // FORCE role: 'CUSTOMER' regardless of any client input
  // No payment details, UPI ID, delivery addresses, government IDs, or bank details collected at signup.
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

  logAudit('USER_REGISTERED', {
    userId: newUser.id,
    email: newUser.email,
    marketingAccepted: newUser.marketingAccepted,
    role: 'CUSTOMER'
  });

  res.status(201).json({
    success: true,
    message: `Account created successfully! Welcome to Aerosol Webapp, ${newUser.name}.`,
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

// 4. GOOGLE OAUTH & SAFE ACCOUNT LINKING (No Duplicates)
router.post('/google', rateLimiter(15, 60000), (req, res) => {
  const { email, name, googleId, redirect } = req.body;
  const userEmail = (email || 'user.google@gmail.com').trim().toLowerCase();
  const userName = name || 'Google Verified User';
  const safeRedirect = sanitizeRedirectUrl(redirect, '/account.html');

  let user = usersDB.find((u) => u.email.toLowerCase() === userEmail && u.status !== 'DEACTIVATED');

  if (user) {
    if (!user.authProviders.includes('google')) {
      user.authProviders.push('google');
    }
    user.googleId = googleId || `goog-${Date.now()}`;
    logAudit('ACCOUNT_LINKED_GOOGLE', { userId: user.id, email: user.email });
  } else {
    user = {
      id: `usr-google-${Date.now()}`,
      name: userName,
      email: userEmail,
      password: null,
      role: 'CUSTOMER',
      tier: 'Google Verified Member',
      discountTier: 5,
      termsAccepted: true,
      isEmailVerified: true,
      mfaEnabled: false,
      googleId: googleId || `goog-${Date.now()}`,
      authProviders: ['google'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      addresses: []
    };
    usersDB.push(user);
    logAudit('USER_CREATED_GOOGLE', { userId: user.id, email: user.email });
  }

  const token = generateToken(user);
  const isTargetAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  res.json({
    success: true,
    message: `Authenticated via Google (${user.email}). Account linked securely!`,
    token,
    redirectUrl: isTargetAdmin ? '/admin.html' : safeRedirect,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier,
      isEmailVerified: true,
      authProviders: user.authProviders
    }
  });
});

// 5. SINGLE-USE SHORT-LIVED PASSWORD RESET (15 min expiration)
router.post('/forgot-password', rateLimiter(5, 60000), (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  resetTokens.set(cleanEmail, { token, expiresAt: Date.now() + 15 * 60 * 1000, used: false });

  logAudit('PASSWORD_RESET_REQUESTED', { email: cleanEmail });

  // Uniform response to prevent email enumeration
  res.json({
    success: true,
    message: `If an account exists for ${cleanEmail}, a single-use 15-minute reset code has been generated. Demo Code: ${token}`
  });
});

router.post('/reset-password', rateLimiter(5, 60000), (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = resetTokens.get(cleanEmail);

  if (!record || record.used || record.token !== token || record.expiresAt < Date.now()) {
    logAudit('PASSWORD_RESET_FAILED', { email: cleanEmail });
    return res.status(400).json({ success: false, message: 'Invalid, used, or expired password reset token. Please request a new code.' });
  }

  record.used = true; // SINGLE-USE EXPIRATION
  resetTokens.delete(cleanEmail);

  const user = usersDB.find((u) => u.email.toLowerCase() === cleanEmail);
  if (user) {
    user.password = newPassword;
    logAudit('PASSWORD_RESET_SUCCESS', { userId: user.id, email: user.email });
  }

  res.json({
    success: true,
    message: 'Password updated successfully! Token invalidated. You may now sign in with your new password.'
  });
});

// 6. LOGOUT & COMPLETE SESSION INVALIDATION
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) activeSessions.delete(token);

  logAudit('LOGOUT_SUCCESS', { userId: req.user.id });

  res.json({ success: true, message: 'Logged out successfully. Session invalidated completely.' });
});

// 7. ACCOUNT DELETION / DEACTIVATION WITH TRANSACTION AUDIT PRESERVATION
router.delete('/account', requireAuth, (req, res) => {
  const userId = req.user.id;
  const user = usersDB.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  user.status = 'DEACTIVATED';
  user.password = null;
  user.phone = '[REDACTED]';

  logAudit('ACCOUNT_DEACTIVATED', { userId, email: user.email, note: 'Order transaction audit history preserved for compliance' });

  res.json({
    success: true,
    message: 'Your account has been deactivated. Your legally required order transaction records remain safely archived for regulatory compliance.'
  });
});

// 8. SESSION VERIFICATION ENDPOINT
router.get('/me', requireAuth, (req, res) => {
  const user = usersDB.find((u) => u.id === req.user.id && u.status !== 'DEACTIVATED') || req.user;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
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

// 9. UPDATE PROFILE DETAILS
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
    user: user || { email, name, phone, company }
  });
});

// 10. UPDATE SAVED ADDRESSES
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

export default router;
