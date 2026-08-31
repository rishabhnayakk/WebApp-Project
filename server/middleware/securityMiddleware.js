import fs from 'fs';
import path from 'path';

// In-memory rate limiter tracking IP attempts
const attemptStore = new Map();
// In-memory concurrency / idempotency lock store
const idempotencyStore = new Map();

// 1. RATE LIMITING MIDDLEWARE (Brute-Force & Denial of Service Protection)
export const rateLimiter = (maxAttempts = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    let record = attemptStore.get(key);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      attemptStore.set(key, record);
      return next();
    }

    record.count += 1;
    if (record.count > maxAttempts) {
      logAudit('RATE_LIMIT_EXCEEDED', { ip, path: req.path, count: record.count });
      return res.status(429).json({
        success: false,
        message: 'Too many authentication requests. Rate limit exceeded. Please wait a minute before trying again.'
      });
    }

    next();
  };
};

// 2. SAFE INTERNAL REDIRECT SANITIZER (Prevents Open Redirect Vulnerabilities)
export const sanitizeRedirectUrl = (targetUrl, fallback = '/account.html') => {
  if (!targetUrl || typeof targetUrl !== 'string') return fallback;
  const trimmed = targetUrl.trim();
  // Must start with '/' and NOT with '//' or contain '://' (blocks external domains)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed;
  }
  return fallback;
};

// 3. IDEMPOTENCY / CONCURRENCY LOCK MIDDLEWARE (Prevents Duplicate Order Charges)
export const idempotencyLock = (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'] || req.body?.idempotencyKey;
  if (!idempotencyKey) return next();

  const existing = idempotencyStore.get(idempotencyKey);
  if (existing) {
    if (existing.status === 'processing') {
      return res.status(409).json({
        success: false,
        message: 'A transaction request with this idempotency key is currently processing. Please do not re-submit.'
      });
    }
    if (existing.status === 'completed') {
      return res.json(existing.response);
    }
  }

  idempotencyStore.set(idempotencyKey, { status: 'processing', timestamp: Date.now() });

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    idempotencyStore.set(idempotencyKey, { status: 'completed', response: data, timestamp: Date.now() });
    return originalJson(data);
  };

  next();
};

// 4. SECURITY AUDIT LOGGER (Logs Security Events to disk & console)
const logFile = path.join(process.cwd(), 'server', 'data', 'audit_logs.json');

export const logAudit = (eventType, details = {}) => {
  const logEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventType,
    details,
    timestamp: new Date().toISOString()
  };

  console.log(`[AUDIT LOG] ${logEntry.timestamp} | ${eventType}:`, details);

  try {
    const dir = path.dirname(logFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8') || '[]');
    }
    logs.unshift(logEntry);
    if (logs.length > 500) logs = logs.slice(0, 500); // keep last 500 events
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
