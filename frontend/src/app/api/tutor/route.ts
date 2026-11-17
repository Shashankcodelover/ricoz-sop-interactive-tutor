import { NextResponse } from 'next/server';
import { 
  TutorQuerySchema, 
  sanitizeInput, 
  screenPromptInjection, 
  checkRateLimit, 
  redactSecrets 
} from '@/lib/securityGuard';
import { dataStore, StoredSOPDocument } from '@/lib/dataStore';

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

// Master Knowledge Corpus covering PRD Problem Statements
interface MasterDocument {
  id: string;
  sourcePlatform: 'notion' | 'google_drive' | 'confluence';
  title: string;
  sourceUrl: string;
  category: string;
  department: string;
  version: string;
  effectiveDate: string;
  content: string;
}

const MASTER_DOCS: MasterDocument[] = [
  {
    id: 'doc_playbook_001',
    sourcePlatform: 'notion',
    title: '30-Day Product Execution & GTM Playbook (v2.0)',
    sourceUrl: 'https://notion.so/ricoz/30-day-gtm-playbook',
    category: 'Product & Engineering Governance',
    department: 'Technology & Product',
    version: '2.0',
    effectiveDate: '2026-11-05',
    content: `Executive Operating Playbook: 30-Day Lifecycle & Gate Governance
1. Phase 1 Discovery: Days 1 to 5 cover ideation, technical feasibility, and exit at Gate G1.
2. Phase 2 Scope & Plan: Days 6 to 10 finalize detailed component design, task decomposition, and exit at Gate G2.
3. Phase 3 MVP Build: Days 11 to 17 activate core engineering, frontend integration, and exit at Gate G3 Feature-Complete sign-off.
4. Phase 4 Testing: Days 18 to 22 execute integration testing, performance optimization, and exit at Gate G4.
5. Phase 5 GTM Launch: Days 23 to 25 conduct Go/No-Go Gate G5 review and official GTM Launch at Day 25 Gate G6.
6. Evidence Standard: Principle 3 requires that no task can be marked complete without attached evidence (code, PR, or test logs).`
  },
  {
    id: 'doc_tech_standards_002',
    sourcePlatform: 'notion',
    title: 'RicoZ Tech Stack & Engineering Standards SOP',
    sourceUrl: 'https://notion.so/ricoz/engineering-standards',
    category: 'Engineering Standards',
    department: 'Engineering',
    version: '2.0',
    effectiveDate: '2026-11-01',
    content: `Standard Operating Procedure: Full Stack Web Development
1. Architecture Standard: All new full stack web development projects must use Next.js for frontend, Node.js + Express.js for backend, and MongoDB for database management.
2. Code Standards: Build reusable modular components, maintain consistent formatting with ESLint/Prettier, and implement clean layered architecture.
3. Security & Validation: Implement proper authentication, role-based authorization, input validation on every endpoint, and robust error handling.
4. Git Collaboration: Use Git and GitHub with descriptive branch names (feat/ or fix/) and peer pull-request reviews.
5. Teammate Allocation Rule: Interns and engineers must achieve at least 45% independent development progress before requesting group teammate allocation.`
  },
  {
    id: 'doc_hr_attendance_003',
    sourcePlatform: 'google_drive',
    title: 'Employee Attendance & Daily Standup Policy',
    sourceUrl: 'https://drive.google.com/file/d/ricoz-attendance-sop',
    category: 'HR Policies',
    department: 'HR',
    version: '1.2',
    effectiveDate: '2026-10-15',
    content: `HR Standard Operating Procedure: Daily Attendance & Reporting
1. Morning Attendance Check-In: Navigate to the portal Attendance Center and click Check In at the beginning of each working shift.
2. Task Creation & Tracking: Create and maintain daily tasks in the My Work / Tasks section with appropriate priorities (P1 Urgent or P2 High).
3. Evening Check-Out: Click Check Out in the Attendance Center at the conclusion of daily working hours.
4. Daily Standup: Post a concise standup update in First Chat summarizing completed items, active blockers, and next session targets.`
  },
  {
    id: 'doc_leave_policy_005',
    sourcePlatform: 'google_drive',
    title: 'Employee Leave, Time Off & Emergency Absence SOP',
    sourceUrl: 'https://drive.google.com/file/d/ricoz-leave-sop',
    category: 'HR Policies',
    department: 'HR',
    version: '2.1',
    effectiveDate: '2026-10-20',
    content: `HR SOP: Leave Application, PTO, and Emergency Absences
1. Leave Balance Verification: Check your accrued leave balance in the portal under My Time -> Leave & Time Off before submitting.
2. Notice Period Requirement: Submit standard planned annual leave requests at least 5 business days in advance for manager approval.
3. Emergency & Sick Leave Notification: For unexpected medical or emergency absences, notify your department lead in First Chat within 2 hours of shift start.
4. Formal Portal Submission: Fill out the leave type, dates, and designated peer handover contact in the portal submission form.
5. Executive Approval for Extended Leave: Continuous leave exceeding 10 business days requires secondary approval from HR Operations.`
  },
  {
    id: 'doc_reimbursement_006',
    sourcePlatform: 'notion',
    title: 'Finance & Expense Reimbursement SOP',
    sourceUrl: 'https://notion.so/ricoz/finance-reimbursement-sop',
    category: 'Finance & Operations',
    department: 'Finance',
    version: '1.4',
    effectiveDate: '2026-10-01',
    content: `Finance Standard Operating Procedure: Business Expense Reimbursement
1. Pre-Approval Verification: Any project or operational purchase exceeding 2,500 INR requires documented pre-approval from the Department Lead.
2. Valid GST Invoices: Ensure the tax invoice explicitly mentions FIRSTRICOZ PRIVATE LIMITED with date and line-item details.
3. Portal Expense Claim: Navigate to the Finance/Payments section, select the expense category, enter exact amounts, and attach PDF receipts.
4. Submission Deadline: All reimbursement claims must be submitted within 30 days of the transaction date.
5. Manager & Finance Audit: The department manager verifies project relevance, after which Finance processes disbursement within 7 business days.`
  },
  {
    id: 'doc_customer_refund_007',
    sourcePlatform: 'confluence',
    title: 'Customer Refund & Service Cancellation SOP',
    sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/OPS/pages/customer-refunds',
    category: 'Customer Operations',
    department: 'Operations',
    version: '2.0',
    effectiveDate: '2026-09-15',
    content: `Operations SOP: Customer Refund and Dispute Escalation
1. Eligibility Assessment: Check if the refund request falls within the 14-day service trial window or satisfies SLA outage breach criteria.
2. Account Audit: Verify user account status, payment gateway transaction ID, and active project deliverables in the admin dashboard.
3. Exception Flagging: If the customer requests a refund outside the 14-day window due to technical failure, document the incident ticket ID.
4. Approval Tier Routing: Refunds under 5,000 INR require Operations Lead sign-off; amounts above 5,000 INR escalate to the Executive Sponsor.
5. Payment Gateway Dispatch: Once approved, trigger the refund dispatch via Razorpay/Stripe dashboard and send the confirmation receipt to the client within 24 hours.`
  },
  {
    id: 'doc_technical_incident_008',
    sourcePlatform: 'confluence',
    title: 'Technical Incident Management & Bug Reporting SOP',
    sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/ENG/pages/incident-management',
    category: 'Engineering Standards',
    department: 'Engineering',
    version: '3.0',
    effectiveDate: '2026-11-02',
    content: `Engineering SOP: Severity Classification & Incident Reporting
1. Severity Triage: Classify incident as P1 Critical (total service outage), P2 High (major feature blocked), or P3 Normal (minor bug).
2. Incident Ticket Creation: Open a GitHub issue or internal Jira ticket documenting steps to reproduce, error stack traces, and environment details.
3. P1 Emergency Channel: For P1 Critical outages, immediately notify the on-call engineer and post in the First Chat #critical-incidents channel within 15 minutes.
4. Hotfix & Rollback: Execute an immediate rollback or emergency hotfix branch following the Git peer-review protocol.
5. Post-Mortem Root Cause Analysis: Complete a blameless post-mortem document within 48 hours detailing root cause, resolution, and preventive measures.`
  },
  {
    id: 'doc_onboarding_009',
    sourcePlatform: 'google_drive',
    title: 'New Employee & Intern 7-Day Onboarding SOP',
    sourceUrl: 'https://drive.google.com/file/d/ricoz-onboarding-guide',
    category: 'People & HR',
    department: 'People Operations',
    version: '1.5',
    effectiveDate: '2026-10-10',
    content: `People Operations: New Hire & Intern Onboarding Checklist
1. Day 1 Portal & Account Setup: Log into the RicoZ Innovation portal, complete 100% of your profile, and verify workspace permissions.
2. Attendance Familiarization: Practice morning check-in and evening check-out in the Attendance Center (/dashboard/intern/attendance).
3. Tech Stack & PRD Alignment: Review the assigned project PRD, standardize on Next.js, Node.js + Express, and MongoDB.
4. First Task Assignment: Add your initial milestone tasks in the My Work / Tasks section with P1 Urgent priority.
5. 45% Independent Build Milestone: Achieve at least 45% progress on your assigned project before messaging the manager for group teammate allocation.`
  },
  {
    id: 'doc_sec_tokens_004',
    sourcePlatform: 'confluence',
    title: 'API Security & OAuth Token Management SOP',
    sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/SEC/pages/api-tokens',
    category: 'Security & Compliance',
    department: 'Engineering',
    version: '1.0',
    effectiveDate: '2026-09-01',
    content: `Security SOP: API Key and Credential Hygiene
1. Credential Secrecy: Never expose API keys, database credentials, or OAuth tokens in client-side code, git repositories, or terminal logs.
2. Environment Configuration: Store all sensitive configuration values in .env files ignored by version control.
3. Access Control Validation: Enforce strict role-based access control (RBAC) on all protected routes prior to data retrieval.
4. Ingestion Permissions: Verify organization ID and user permissions before allowing RAG chunk retrieval.`
  }
];

export async function GET() {
  const allDocs = dataStore.getAllDocuments();
  return NextResponse.json({
    success: true,
    totalDocuments: allDocs.length,
    documents: allDocs
  });
}

export async function POST(request: Request) {
  try {
    // 1. IP Extraction & Rate Limiting Enforcement
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const rateStatus = checkRateLimit(clientIp, 60, 60 * 1000);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded: Too many RAG queries. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateStatus.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // 2. Parse and Validate Request Payload
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload.', code: 'INVALID_JSON' },
        { status: 400 }
      );
    }

    const validationResult = TutorQuerySchema.safeParse(rawBody);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${issue ? issue.message : 'Invalid query'}`,
          code: 'VALIDATION_FAILED'
        },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeInput(validationResult.data.question);

    // 3. Prompt Injection, Jailbreak, and Reconnaissance Screening
    const securityCheck = screenPromptInjection(sanitizedQuestion);
    if (!securityCheck.isSafe) {
      console.warn(`[Security Alert] Intercepted prompt attack from ${clientIp}: ${securityCheck.threatDetected}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: The query contains security policy violations or instruction overrides.',
          code: 'PROMPT_INJECTION_DETECTED',
          securityAdvisory: {
            flaggedCategory: securityCheck.threatDetected,
            pattern: securityCheck.matchedPattern
          }
        },
        { status: 403 }
      );
    }

    // 4. Multi-Modal Semantic Retrieval across live dataStore
    const queryVec = generate384Vector(sanitizedQuestion);
    const qLower = sanitizedQuestion.toLowerCase();
    const queryTokens = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);

    const activeDocs = dataStore.getAllDocuments();
    const scoredDocs = activeDocs.map(doc => {
      const docVec = generate384Vector(doc.content);
      const dense = cosineSimilarity(queryVec, docVec);
      
      const docTextLower = doc.content.toLowerCase();
      let termMatches = 0;
      queryTokens.forEach(t => {
        if (docTextLower.includes(t)) termMatches++;
      });
      const sparse = queryTokens.length > 0 ? termMatches / queryTokens.length : 0;

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

    // Deconstruct lines into sequential steps
    const lines = topMatch.doc.content.split('\n');
    const steps: Array<{ stepNumber: number; instruction: string; prerequisites: string[]; isCompleted: boolean }> = [];
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

    const answer = `According to the authorized **${topMatch.doc.title}** (Version ${topMatch.doc.version}, Source: ${topMatch.doc.sourcePlatform.toUpperCase()}):\n\nHere is your sequential step-by-step operational procedure:\n\n${steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n')}\n\n---\n*Notice: Adhere strictly to the sequential prerequisite order above. Mark each step as complete in the Interactive Stepper once executed.*`;

    const rawResponse = {
      success: true,
      sessionId: `sess_${Date.now()}`,
      question: sanitizedQuestion,
      answer,
      steps,
      citations,
      relevanceScore: parseFloat(topMatch.score.toFixed(4)),
      conflictReport: null,
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
