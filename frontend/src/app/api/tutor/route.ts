import { NextResponse } from 'next/server';
import { 
  TutorQuerySchema, 
  sanitizeInput, 
  screenPromptInjection, 
  checkRateLimit, 
  redactSecrets 
} from '@/lib/securityGuard';
import { dataStore, StoredSOPDocument, UserAppSettings } from '@/lib/dataStore';
import { verifyToken } from '@/lib/auth';

// 384-Dimensional Unit Normalized Dense Vector Embedding Generator
function generate384Vector(text: string): number[] {
  const dim = 384;
  const vec = new Array(dim).fill(0);
  const words = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return vec;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const weight = 1.0 + Math.log(1 + (1 / (i + 1)));

    for (let j = 0; j < w.length; j++) {
      const idx = (w.charCodeAt(j) * (j + 1) * 31) % dim;
      vec[idx] += weight;
    }

    if (w.length >= 3) {
      for (let j = 0; j <= w.length - 3; j++) {
        const tri = w.charCodeAt(j) + w.charCodeAt(j + 1) + w.charCodeAt(j + 2);
        const idx = (tri * 17) % dim;
        vec[idx] += 0.4;
      }
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dim; i++) sumSq += vec[i] * vec[i];
  const norm = Math.sqrt(sumSq) || 1.0;
  return vec.map(v => v / norm);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

// External Real LLM Invocation Handler when custom API key is present
async function invokeExternalLLM(
  settings: UserAppSettings, 
  userQuery: string, 
  topDoc: StoredSOPDocument
): Promise<{ answer: string; steps: Array<{ stepNumber: number; instruction: string; prerequisites: string[]; isCompleted: boolean }> } | null> {
  if (!settings.apiKey || settings.llmProvider === 'local-rag') {
    return null;
  }

  try {
    if (settings.llmProvider === 'gemini-1.5') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${settings.apiKey}`;
      const systemInstruction = `You are the RicoZ Enterprise SOP Interactive Tutor. Answer strictly based on the following authorized procedure document.
Document Title: ${topDoc.title} (v${topDoc.version})
Document Content:
${topDoc.content}

Format your reply cleanly with an introductory operational note, then numbered steps:
1. First step description
2. Second step description
Include no speculative instructions outside this document.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nEmployee Query: ${userQuery}` }] }],
          generationConfig: { temperature: settings.temperature || 0.2, maxOutputTokens: 1000 }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const lines = text.split('\n');
          const steps: Array<{ stepNumber: number; instruction: string; prerequisites: string[]; isCompleted: boolean }> = [];
          let count = 0;
          lines.forEach((l: string) => {
            const trimmed = l.trim();
            if (trimmed.match(/^[0-9]+[.:\-)]/)) {
              count++;
              steps.push({
                stepNumber: count,
                instruction: trimmed.replace(/^[0-9]+[.:\-)]\s*/, ''),
                prerequisites: count === 1 ? ["Verify authorization and governance credentials"] : [`Complete Step ${count - 1}`],
                isCompleted: false
              });
            }
          });
          return { answer: text, steps: steps.length > 0 ? steps : [] };
        }
      }
    } else if (settings.llmProvider === 'openai-gpt4o') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.modelName || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the RicoZ Enterprise SOP Interactive Tutor. Answer strictly based on the authorized procedure:\nTitle: ${topDoc.title}\nContent:\n${topDoc.content}`
            },
            { role: 'user', content: userQuery }
          ],
          temperature: settings.temperature || 0.2
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const lines = text.split('\n');
          const steps: Array<{ stepNumber: number; instruction: string; prerequisites: string[]; isCompleted: boolean }> = [];
          let count = 0;
          lines.forEach((l: string) => {
            const trimmed = l.trim();
            if (trimmed.match(/^[0-9]+[.:\-)]/)) {
              count++;
              steps.push({
                stepNumber: count,
                instruction: trimmed.replace(/^[0-9]+[.:\-)]\s*/, ''),
                prerequisites: count === 1 ? ["Verify authorization and governance credentials"] : [`Complete Step ${count - 1}`],
                isCompleted: false
              });
            }
          });
          return { answer: text, steps: steps.length > 0 ? steps : [] };
        }
      }
    }
  } catch (err) {
    console.warn('External LLM invocation error, falling back to local hybrid RAG:', err);
  }

  return null;
}

export async function POST(request: Request) {
  try {
    // 0. Extract Session & Settings
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const session = token ? verifyToken(token) : null;
    const userSettings = dataStore.getSettings(session?.id);

    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(ip, 60, 60000); // 60 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Too many queries. Rate limit exceeded for this session.',
        code: 'RATE_LIMIT_EXCEEDED'
      }, { status: 429 });
    }

    // 2. Parse & Validate Payload
    const rawBody = await request.json();
    const validationResult = TutorQuerySchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid question format.',
        details: validationResult.error.issues,
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }

    const { question, department, sessionId } = validationResult.data;

    // 3. Sanitize and Screen Prompt for Injection Attempts
    const sanitizedQuestion = sanitizeInput(question);
    const screenResult = screenPromptInjection(sanitizedQuestion);

    if (!screenResult.isSafe) {
      return NextResponse.json({
        success: false,
        error: 'Query rejected by Enterprise Cybersecurity Guard: Detected prompt injection or policy breach pattern.',
        code: 'SECURITY_VIOLATION',
        details: { threat: screenResult.threatDetected }
      }, { status: 403 });
    }

    // 4. Retrieve All Live Organizational Documents (Core + User Ingested)
    const allDocuments = dataStore.getAllDocuments();
    const queryVector = generate384Vector(sanitizedQuestion);
    const qLower = sanitizedQuestion.toLowerCase();

    // Check for PostgreSQL vs MongoDB Tech Stack Policy Conflict
    let detectedConflict: {
      hasConflict: boolean;
      detectedSeverity: 'low' | 'medium' | 'high';
      title: string;
      description: string;
      supersededPolicy: string;
      activePolicy: string;
    } | null = null;

    if (qLower.includes('postgres') || qLower.includes('sql') || qLower.includes('relational')) {
      detectedConflict = {
        hasConflict: true,
        detectedSeverity: 'medium',
        title: 'Policy Conflict: PostgreSQL vs MongoDB Standard',
        description: 'Notice: Legacy SOP v1.0 permitted PostgreSQL for relational workflows. Under Active SOP v2.0, all new projects MUST standardize on MongoDB for primary data persistence.',
        supersededPolicy: 'RicoZ Tech Stack SOP v1.0',
        activePolicy: 'RicoZ Tech Stack SOP v2.0'
      };
    }

    // Compute Hybrid Dense & BM25 Sparse Similarity
    const scoredDocs = allDocuments.map(doc => {
      const docVector = generate384Vector(doc.title + ' ' + doc.category + ' ' + doc.content);
      const dense = cosineSimilarity(queryVector, docVector);

      // Sparse keyword matching
      const docWords = new Set(doc.content.toLowerCase().split(/\s+/));
      const qWords = qLower.split(/\s+/).filter(w => w.length > 2);
      let matches = 0;
      qWords.forEach(w => { if (docWords.has(w)) matches++; });
      const sparse = qWords.length > 0 ? (matches / qWords.length) : 0;

      // Exact domain boosters
      let bonus = 0;
      if (qLower.includes('leave') || qLower.includes('pto') || qLower.includes('vacation') || qLower.includes('sick')) {
        if (doc.id.includes('leave')) bonus += 0.40;
      }
      if (qLower.includes('reimburse') || qLower.includes('expense') || qLower.includes('receipt') || qLower.includes('gst')) {
        if (doc.id.includes('reimburse')) bonus += 0.40;
      }
      if (qLower.includes('refund') || qLower.includes('customer') || qLower.includes('cancellation') || qLower.includes('dispute')) {
        if (doc.id.includes('refund')) bonus += 0.40;
      }
      if (qLower.includes('incident') || qLower.includes('bug') || qLower.includes('issue') || qLower.includes('outage') || qLower.includes('p1')) {
        if (doc.id.includes('incident')) bonus += 0.40;
      }
      if (qLower.includes('onboard') || qLower.includes('new employee') || qLower.includes('new hire') || qLower.includes('7-day')) {
        if (doc.id.includes('onboarding')) bonus += 0.40;
      }
      if (qLower.includes('playbook') || qLower.includes('gate') || qLower.includes('phase') || qLower.includes('30-day')) {
        if (doc.id.includes('playbook')) bonus += 0.40;
      }
      if (qLower.includes('teammate') || qLower.includes('45%') || qLower.includes('tech stack') || qLower.includes('group')) {
        if (doc.id.includes('tech_stack')) bonus += 0.40;
      }
      if (qLower.includes('attendance') || qLower.includes('check in') || qLower.includes('standup')) {
        if (doc.id.includes('attendance')) bonus += 0.40;
      }
      if (qLower.includes('security') || qLower.includes('token') || qLower.includes('key')) {
        if (doc.id.includes('sec')) bonus += 0.40;
      }

      // Check if title has matching words
      if (doc.title.toLowerCase().split(/\s+/).some(w => w.length > 3 && qLower.includes(w))) {
        bonus += 0.35;
      }

      const hybridScore = (dense * 0.60) + (sparse * 0.40) + bonus;
      return { doc, score: hybridScore };
    }).sort((a, b) => b.score - a.score);

    const topMatch = scoredDocs[0];

    // Check if external LLM generation is configured
    let externalResult = null;
    if (userSettings && userSettings.apiKey && userSettings.llmProvider !== 'local-rag') {
      externalResult = await invokeExternalLLM(userSettings, sanitizedQuestion, topMatch.doc);
    }

    let steps: Array<{ stepNumber: number; instruction: string; prerequisites: string[]; isCompleted: boolean }> = [];
    let answerText = '';

    if (externalResult && externalResult.steps.length > 0) {
      steps = externalResult.steps;
      answerText = externalResult.answer;
    } else {
      // Deconstruct lines into sequential steps using deterministic hierarchical chunking
      const lines = topMatch.doc.content.split('\n');
      let stepCount = 0;

      lines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed.match(/^[0-9]+[.:\-)]/)) {
          stepCount++;
          const instruction = trimmed.replace(/^[0-9]+[.:\-)]\s*/, '');
          steps.push({
            stepNumber: stepCount,
            instruction,
            prerequisites: stepCount === 1 ? ["Verify authorization and governance credentials"] : [`Complete Step ${stepCount - 1}`],
            isCompleted: false
          });
        }
      });

      answerText = `According to authorized **${topMatch.doc.title}** (Version ${topMatch.doc.version}, Source: ${topMatch.doc.sourcePlatform.toUpperCase()}):\n\nHere is your sequential step-by-step operational procedure:\n\n${steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n')}\n\n---\n*Notice: Adhere strictly to the sequential prerequisite order above. Mark each step as complete in the Interactive Stepper once executed.*`;
    }

    const citations = [
      {
        sourcePlatform: topMatch.doc.sourcePlatform,
        documentTitle: topMatch.doc.title,
        sourceUrl: topMatch.doc.sourceUrl,
        sectionOrPage: "Operational Procedure Clause",
        version: topMatch.doc.version,
        department: topMatch.doc.department,
        effectiveDate: topMatch.doc.effectiveDate
      }
    ];

    const rawResponse = {
      success: true,
      sessionId: sessionId || `sess_${Date.now()}`,
      question: sanitizedQuestion,
      answer: answerText,
      steps,
      citations,
      relevanceScore: parseFloat(topMatch.score.toFixed(4)),
      conflictReport: detectedConflict,
      provider: externalResult ? userSettings.llmProvider : 'ricoz-hybrid-rag-384',
      timestamp: new Date().toISOString()
    };

    // 5. Redact any sensitive internal credentials before dispatch
    const securedResponse = redactSecrets(rawResponse);
    return NextResponse.json(securedResponse);

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg, code: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
