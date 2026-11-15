/**
 * Enterprise Next.js Cybersecurity & Prompt Injection Guard
 * RicoZ Internal Knowledge & SOP Interactive Tutor
 */

import { z } from 'zod';

// ============================================================================
// 1. PROMPT INJECTION & JAILBREAK PATTERN LIBRARY
// ============================================================================

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
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

  // LLM Delimiters & Special Token Smuggling
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<<\/SYS>>/i,
  /###\s*(?:System|Human|Assistant|Instruction):/i,
  /---\s*BEGIN\s+SYSTEM\s+PROMPT/i,

  // Dangerous Code / Web Injection
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript:\s*/i,
  /union\s+select\b/i
];

const SENSITIVE_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9_-]{20,}/g,                        // OpenAI keys
  /ntn_[a-zA-Z0-9_-]{20,}/g,                       // Notion integration keys
  /ghp_[a-zA-Z0-9_-]{20,}/g,                       // GitHub tokens
  /xox[baprs]-[a-zA-Z0-9_-]+/g,                    // Slack tokens
  /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,              // Bearer auth tokens
  /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,  // Private keys
  /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/gi           // DB credentials
];

// ============================================================================
// 2. INPUT SANITIZATION
// ============================================================================

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function redactSecrets(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    let scrubbed = data;
    for (const pattern of SENSITIVE_PATTERNS) {
      scrubbed = scrubbed.replace(pattern, '[REDACTED_SECRET]');
    }
    return scrubbed;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item));
  }

  if (typeof data === 'object') {
    const scrubbedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
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
// 3. THREAT EVALUATION
// ============================================================================

export interface ScreenResult {
  isSafe: boolean;
  threatDetected: string | null;
  matchedPattern: string | null;
}

export function screenPromptInjection(text: string): ScreenResult {
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
// 4. ZOD VALIDATION SCHEMA
// ============================================================================

export const TutorQuerySchema = z.object({
  question: z
    .string()
    .min(3, { message: 'Question must be at least 3 characters long.' })
    .max(2000, { message: 'Question exceeds maximum allowed limit of 2000 characters.' }),
  sessionId: z
    .string()
    .regex(/^[a-zA-Z0-9_\-:]+$/, { message: 'Invalid sessionId format.' })
    .max(64)
    .optional(),
  department: z.string().max(64).optional()
});

// ============================================================================
// 5. IN-MEMORY RATE LIMITER FOR NEXT.JS ROUTE HANDLERS
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enforces sliding-window rate limiting for Next.js API Routes.
 * Defaults to 30 requests per minute per IP for RAG queries.
 */
export function checkRateLimit(
  ip: string,
  limit = 30,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  // Periodic cleanup if store grows
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}
