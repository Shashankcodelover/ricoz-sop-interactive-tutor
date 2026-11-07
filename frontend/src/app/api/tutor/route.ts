import { NextResponse } from 'next/server';

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

// Master Knowledge Corpus
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

export async function POST(request: Request) {
  try {
    let question = '';
    try {
      const data = await request.json();
      question = data.question || data.q || data.prompt || '';
    } catch {
      question = '';
    }

    // Fallback if empty payload
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      question = "What are the requirements for Phase 3 MVP build and Gate G3 sign-off?";
    }

    const queryVec = generate384Vector(question);
    const qLower = question.toLowerCase();
    const queryTokens = qLower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);

    // Hybrid Scoring across Master Corpus (65% Dense + 35% Sparse)
    const scoredDocs = MASTER_DOCS.map(doc => {
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
      if (qLower.includes('playbook') || qLower.includes('gate') || qLower.includes('phase') || qLower.includes('30-day') || qLower.includes('g3')) {
        if (doc.id === 'doc_playbook_001') bonus += 0.35;
      }
      if (qLower.includes('teammate') || qLower.includes('45%') || qLower.includes('tech stack') || qLower.includes('group') || qLower.includes('mongo')) {
        if (doc.id === 'doc_tech_standards_002') bonus += 0.35;
      }
      if (qLower.includes('attendance') || qLower.includes('check in') || qLower.includes('standup')) {
        if (doc.id === 'doc_hr_attendance_003') bonus += 0.35;
      }
      if (qLower.includes('security') || qLower.includes('token') || qLower.includes('key')) {
        if (doc.id === 'doc_sec_tokens_004') bonus += 0.35;
      }

      const hybridScore = (dense * 0.65) + (sparse * 0.35) + bonus;
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
        version: topMatch.doc.version
      }
    ];

    const answer = `According to the authorized **${topMatch.doc.title}** (Version ${topMatch.doc.version}, Source: ${topMatch.doc.sourcePlatform.toUpperCase()}):\n\nHere is your sequential step-by-step operational procedure:\n\n${steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n')}\n\n---\n*Notice: Adhere strictly to the sequential prerequisite order above. Mark each step as complete in the Interactive Stepper once executed.*`;

    return NextResponse.json({
      success: true,
      question,
      answer,
      steps,
      citations,
      relevanceScore: parseFloat(topMatch.score.toFixed(4)),
      conflictReport: null,
      timestamp: new Date().toISOString()
    });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
