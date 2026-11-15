/**
 * Enterprise Cybersecurity & Prompt Injection Defense Guard
 * RicoZ Internal Knowledge & SOP Interactive Tutor
 * 
 * Provides:
 * 1. Threat Modeling & Prompt Injection Interception (Jailbreaks, Instruction Overrides, Leaks)
 * 2. Zod Schema Validation & Input Sanitization
 * 3. Secret & Credential Redaction Hygiene
 * 4. Rate Limiting Protection (DDoS & Compute Exhaustion Defense)
 * 5. Secure Error Handler Middleware (Prevents Stack Trace & Token Leakage)
 */

const { z } = require('zod');
const rateLimit = require('express-rate-limit');

// ============================================================================
// 1. THREAT MODELING PATTERNS: PROMPT INJECTIONS & JAILBREAK SIGNATURES
// ============================================================================

const PROMPT_INJECTION_PATTERNS = [
  // Direct Instruction Overrides
  /ignore\s+(?:all|any|previous|the\s+above|prior)\s+(?:instructions|prompts|rules|commands|context|directives)/i,
  /disregard\s+(?:all|previous|prior|the\s+above)\s+(?:instructions|directives|rules|guidelines)/i,
  /override\s+(?:the|your|all)?\s*(?:instructions|system|rules|protocols|safety)/i,
  /forget\s+(?:all|everything|previous)\s+(?:instructions|rules|context)/i,

  // Jailbreak Personas & Modes
  /you\s+are\s+now\s+(?:in\s+)?(?:dan|jailbreak|unrestricted|god\s*mode|developer\s*mode|chaos\s*mode|evil)/i,
  /pretend\s+(?:you\s+have\s+no\s+rules|you\s+are\s+not\s+bound|rules\s+do\s+not\s+apply|to\s+be\s+an?\s+unfiltered)/i,
  /\bdo\s+anything\s+now\b/i,
  /\bDAN\s+mode\b/i,
  /\bjailbreak\b/i,
  /\bsudo\s+mode\b/i,
  /\bdeveloper\s+override\b/i,
  /\badmin\s+(?:access|override|bypass)\b/i,

  // System Prompt Exfiltration & Leakage
  /(?:repeat|print|reveal|output|display|show|leak|expose|dump|echo)\s+(?:the|your|all|me)?\s*(?:initial|internal|system|base|hidden|underlying)?\s*(?:system\s+)?(?:prompt|instructions|rules|directives|message|guidelines)(?:\s+(?:above|verbatim|below|here))?/i,
  /(?:what\s+(?:is|are)|tell\s+me)\s+(?:the|your)\s+(?:initial|internal|system|base|hidden)?\s*(?:prompt|instructions|rules)/i,
  /show\s+everything\s+(?:above|before)\s+this\s+line/i,
  /(?:system\s+prompt|system\s+instructions)\s+(?:leak|dump|reveal|verbatim)/i,

  // LLM Delimiter & Special Token Smuggling
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<<\/SYS>>/i,
  /###\s*(?:System|Human|Assistant|Instruction):/i,
  /---\s*BEGIN\s+SYSTEM\s+PROMPT/i,

  // Code / Injection Escapes
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:\s*/i,
  /union\s+select\b/i,
  /exec\s*\(\s*xp_/i
];

// Patterns for sensitive secrets that must NEVER leak in responses or logs
const SENSITIVE_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{20,}/g,                        // OpenAI keys
  /ntn_[a-zA-Z0-9_-]{20,}/g,                       // Notion integration keys
  /ghp_[a-zA-Z0-9_-]{20,}/g,                       // GitHub Personal Access Tokens
  /xox[baprs]-[a-zA-Z0-9_-]+/g,                    // Slack tokens
  /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,              // Bearer auth tokens
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,  // Private keys
  /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/gi           // DB connection credentials
];

// ============================================================================
// 2. INPUT SANITIZATION & NORMALIZATION
// ============================================================================

/**
 * Strips zero-width characters, control codes, and HTML tags.
 * Normalizes Unicode to standard form (NFKC) to prevent homoglyph evasion.
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    // Normalize Unicode
    .normalize('NFKC')
    // Remove zero-width spaces, joiners, and byte order marks
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    // Remove control characters (except newline, return, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tag brackets
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Recursively redacts sensitive keys and values from strings or objects.
 */
function redactSecrets(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    let scrubbed = data;
    SENSITIVE_PATTERNS.forEach(pattern => {
      scrubbed = scrubbed.replace(pattern, '[REDACTED_SECRET]');
    });
    return scrubbed;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item));
  }

  if (typeof data === 'object') {
    const scrubbedObj = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('authorization')
      ) {
        scrubbedObj[key] = '[REDACTED_CREDENTIAL]';
      } else {
        scrubbedObj[key] = redactSecrets(value);
      }
    }
    return scrubbedObj;
  }

  return data;
}

// ============================================================================
// 3. THREAT DETECTION & PROMPT INJECTION SCREENER
// ============================================================================

/**
 * Screens query for malicious patterns, jailbreaks, and prompt injections.
 * @param {string} text - User query or raw input
 * @returns {{ isSafe: boolean, threatDetected: string|null, matchedPattern: string|null }}
 */
function screenPromptInjection(text) {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, threatDetected: null, matchedPattern: null };
  }

  const normalized = text.normalize('NFKC').toLowerCase();

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      const match = normalized.match(pattern);
      return {
        isSafe: false,
        threatDetected: 'PROMPT_INJECTION_ATTEMPT',
        matchedPattern: match ? match[0] : pattern.source
      };
    }
  }

  // Check for excessive repetitive control character or delimiter density
  const specialChars = (text.match(/[{}\[\]<>\\\/|_~`^]/g) || []).length;
  if (text.length > 50 && specialChars / text.length > 0.45) {
    return {
      isSafe: false,
      threatDetected: 'OBFUSCATION_ANOMALY',
      matchedPattern: 'High special character ratio'
    };
  }

  return { isSafe: true, threatDetected: null, matchedPattern: null };
}

// ============================================================================
// 4. ZOD VALIDATION SCHEMAS
// ============================================================================

const TutorQuerySchema = z.object({
  question: z
    .string({ required_error: 'A valid question string is required.' })
    .min(3, { message: 'Question must be at least 3 characters long.' })
    .max(2000, { message: 'Question exceeds maximum allowed limit of 2000 characters.' }),
  sessionId: z
    .string()
    .regex(/^[a-zA-Z0-9_\-:]+$/, { message: 'Invalid sessionId format.' })
    .max(64)
    .optional(),
  department: z.string().max(64).optional(),
  sourcePlatform: z.enum(['notion', 'google_drive', 'confluence', 'all']).optional()
});

const IngestSchema = z.object({
  platform: z.enum(['notion', 'google_drive', 'confluence'], {
    required_error: 'Supported platforms are notion, google_drive, or confluence.'
  }),
  rawData: z.union([z.record(z.any()), z.string()], {
    required_error: 'rawData must be provided.'
  })
});

// ============================================================================
// 5. RATE LIMITING DEFINITIONS (ANTI-DDOS & VECTOR RESOURCE PROTECTION)
// ============================================================================

// Global general API rate limiter: 100 requests per 15 minutes per IP
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Strict rate limiter for compute-intensive RAG Tutor queries: 30 requests per minute per IP
const tutorQueryRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RAG embedding query limit reached. Maximum 30 requests per minute per IP.',
    code: 'TUTOR_RATE_LIMIT_EXCEEDED'
  }
});

// Strict rate limiter for document ingestion: 10 requests per minute per IP
const ingestRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Document ingestion rate limit exceeded. Maximum 10 ingestions per minute.',
    code: 'INGEST_RATE_LIMIT_EXCEEDED'
  }
});

// ============================================================================
// 6. EXPRESS SECURITY MIDDLEWARE INTERCEPTORS
// ============================================================================

/**
 * Express Middleware: Intercepts & Screens Tutor Queries against Injections
 */
function promptInjectionGuardMiddleware(req, res, next) {
  // Validate schema first
  const parsed = TutorQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(i => i.message).join(' ');
    return res.status(400).json({
      success: false,
      error: errorMessages,
      code: 'VALIDATION_ERROR'
    });
  }

  const rawQuestion = parsed.data.question;
  const screenResult = screenPromptInjection(rawQuestion);

  if (!screenResult.isSafe) {
    console.warn(`[SECURITY ALERT] Prompt Injection Blocked | Threat: ${screenResult.threatDetected} | IP: ${req.ip} | Time: ${new Date().toISOString()}`);
    return res.status(403).json({
      success: false,
      error: 'Security Policy Violation: The query was flagged as an unauthorized prompt injection or system override attempt. Query rejected.',
      code: 'PROMPT_INJECTION_BLOCKED',
      threatType: screenResult.threatDetected
    });
  }

  // Sanitize the question and store safe version on req.body
  req.body.question = sanitizeInput(rawQuestion);
  next();
}

/**
 * Express Middleware: Validates SOP Ingest payloads
 */
function ingestGuardMiddleware(req, res, next) {
  const parsed = IngestSchema.safeParse(req.body);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(i => i.message).join(' ');
    return res.status(400).json({
      success: false,
      error: errorMessages,
      code: 'INGEST_VALIDATION_ERROR'
    });
  }
  next();
}

/**
 * Express Secure Error Handler: Prevents Stack Trace or Secret Leaks in Responses
 */
function secureErrorHandler(err, req, res, next) {
  console.error(`[INTERNAL_ERROR_CAUGHT] ${err.message || 'Unknown error'}`);

  // Scrub any accidental secrets from error messages
  const safeMessage = redactSecrets(err.message || 'An internal system error occurred.');

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred while processing your request. Please contact SecOps.' 
      : safeMessage,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  sanitizeInput,
  redactSecrets,
  screenPromptInjection,
  TutorQuerySchema,
  IngestSchema,
  apiRateLimiter,
  tutorQueryRateLimiter,
  ingestRateLimiter,
  promptInjectionGuardMiddleware,
  ingestGuardMiddleware,
  secureErrorHandler
};
