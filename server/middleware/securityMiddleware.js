import fs from 'fs';
import path from 'path';

const attempts = new Map();
const idempotencyStore = new Map();
const logFile = path.join(process.cwd(), 'server', 'data', 'audit_logs.json');

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

export const rateLimiter = (maxAttempts = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    let record = attempts.get(key);
    if (!record || now - record.startTime > windowMs) {
      attempts.set(key, { count: 1, startTime: now });
      return next();
    }

    record.count += 1;
    if (record.count > maxAttempts) {
      logAudit('RATE_LIMIT_EXCEEDED', { ip, path: req.path, count: record.count });
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before trying again.',
      });
    }

    next();
  };
};

// ─── URL Sanitization ─────────────────────────────────────────────────────────

/** Validates that a redirect URL is internal (not an open redirect). */
export const sanitizeRedirectUrl = (targetUrl, fallback = '/account.html') => {
  if (!targetUrl || typeof targetUrl !== 'string') return fallback;
  const trimmed = targetUrl.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('://')) {
    return trimmed;
  }
  return fallback;
};

// ─── Idempotency Lock ─────────────────────────────────────────────────────────

export const idempotencyLock = (req, res, next) => {
  const key = req.headers['x-idempotency-key'] || req.body?.idempotencyKey;
  if (!key) return next();

  const existing = idempotencyStore.get(key);
  if (existing) {
    if (existing.status === 'processing') {
      return res.status(409).json({ success: false, message: 'Request is already processing. Please wait.' });
    }
    if (existing.status === 'completed') {
      return res.json(existing.response);
    }
  }

  idempotencyStore.set(key, { status: 'processing', timestamp: Date.now() });

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    idempotencyStore.set(key, { status: 'completed', response: data, timestamp: Date.now() });
    return originalJson(data);
  };

  next();
};

// ─── Audit Logging ────────────────────────────────────────────────────────────

export const logAudit = (eventType, details = {}) => {
  const logEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventType,
    details,
    timestamp: new Date().toISOString(),
  };

  console.log(`[audit] ${logEntry.timestamp} | ${eventType}:`, details);

  try {
    const dir = path.dirname(logFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let logs = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8') || '[]');
    }
    logs.unshift(logEntry);
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
