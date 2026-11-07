// Embedded In-Memory RAG Engine for Serverless Edge / Vercel Full Stack Deployment

interface SOPDoc {
  sourcePlatform: 'notion' | 'google_drive' | 'confluence';
  title: string;
  sourceUrl: string;
  category: string;
  department: string;
  version: string;
  effectiveDate: string;
  content: string;
}

const KNOWLEDGE_BASE: SOPDoc[] = [
  {
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

function generateVector(text: string): number[] {
  const dim = 64;
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    for (let j = 0; j < w.length; j++) {
      const idx = (w.charCodeAt(j) * (j + 1) * (i + 1)) % dim;
      vec[idx] += 1;
    }
  }
  let norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm === 0) norm = 1;
  return vec.map(v => v / norm);
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Valid question is required' }, { status: 400 });
    }

    const queryVec = generateVector(question);
    const queryTerms = question.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // Score knowledge base
    const scored = KNOWLEDGE_BASE.map(doc => {
      const docVec = generateVector(doc.content);
      const vecScore = cosineSim(queryVec, docVec);
      const textLower = doc.content.toLowerCase();
      let matchCount = 0;
      for (const t of queryTerms) {
        if (textLower.includes(t)) matchCount++;
      }
      const kwScore = queryTerms.length > 0 ? matchCount / queryTerms.length : 0;
      const hybridScore = (vecScore * 0.6) + (kwScore * 0.4);

      return { doc, score: hybridScore };
    }).sort((a, b) => b.score - a.score);

    const topMatch = scored[0];
    if (!topMatch || topMatch.score < 0.12) {
      return Response.json({
        answer: "I could not find an authorized SOP or internal policy directly addressing this operational question. To prevent non-compliant actions, please escalate this request to your department manager or HR lead.",
        steps: [],
        citations: [],
        relevanceScore: 0,
        conflictAlert: null
      });
    }

    // Extract steps
    const stepLines = topMatch.doc.content.split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/^(?:\d+\.|\bStep\s+\d+:?|-|\*)\s+/i));

    const steps = stepLines.map((line, idx) => ({
      stepNumber: idx + 1,
      instruction: line.replace(/^(?:\d+\.|\bStep\s+\d+:?|-|\*)\s+/i, ''),
      prerequisites: idx === 0 ? ["Verify identity and document authorization"] : [`Completion of Step ${idx}`],
      isCompleted: false
    }));

    const citations = [
      {
        sourcePlatform: topMatch.doc.sourcePlatform,
        documentTitle: topMatch.doc.title,
        sourceUrl: topMatch.doc.sourceUrl,
        sectionOrPage: "Operational Procedure Clause",
        version: topMatch.doc.version
      }
    ];

    const answer = `Based on the official **${topMatch.doc.title}** (Source: ${topMatch.doc.sourcePlatform.toUpperCase()}), here is your guided step-by-step operational procedure:

${steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n')}

*All steps must be executed in strict sequence according to company guidelines.*`;

    return Response.json({
      success: true,
      question,
      answer,
      steps,
      citations,
      relevanceScore: parseFloat(topMatch.score.toFixed(4)),
      conflictAlert: null,
      timestamp: new Date().toISOString()
    });

  } catch {
    return Response.json({ error: 'Internal server error processing RAG tutor query' }, { status: 500 });
  }
}
