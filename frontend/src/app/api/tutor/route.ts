import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let question = '';
    try {
      const data = await request.json();
      question = data.question || '';
    } catch {
      question = '';
    }

    const qLower = (question || '').toLowerCase();

    if (qLower.includes('attendance') || qLower.includes('standup') || qLower.includes('check in')) {
      return NextResponse.json({
        success: true,
        question,
        answer: "Based on the official **Employee Attendance & Daily Standup Policy** (Source: GOOGLE DRIVE), here is your daily reporting procedure:\n\n**Step 1:** Navigate to the Attendance Center (/dashboard/intern/attendance) and click Check In at the beginning of each working shift.\n\n**Step 2:** Create and maintain daily tasks in the My Work / Tasks section with appropriate priorities (P1 Urgent or P2 High).\n\n**Step 3:** Click Check Out in the Attendance Center at the conclusion of daily working hours.\n\n**Step 4:** Post a concise standup update in First Chat summarizing completed items, active blockers, and next session targets.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Morning Attendance Check-In on portal.",
            prerequisites: ["Portal login active"],
            isCompleted: false
          },
          {
            stepNumber: 2,
            instruction: "Task Creation & Tracking with P1/P2 priorities.",
            prerequisites: ["Completion of Step 1"],
            isCompleted: false
          },
          {
            stepNumber: 3,
            instruction: "Evening Check-Out at the conclusion of hours.",
            prerequisites: ["Completion of Step 2"],
            isCompleted: false
          },
          {
            stepNumber: 4,
            instruction: "Post daily standup update in First Chat.",
            prerequisites: ["Completion of Step 3"],
            isCompleted: false
          }
        ],
        citations: [
          {
            sourcePlatform: "google_drive",
            documentTitle: "Employee Attendance & Daily Standup Policy",
            sourceUrl: "https://drive.google.com/file/d/ricoz-attendance-sop",
            sectionOrPage: "HR Daily Reporting Policy",
            version: "1.2"
          }
        ],
        relevanceScore: 0.915,
        conflictAlert: null
      });
    }

    if (qLower.includes('security') || qLower.includes('token') || qLower.includes('key')) {
      return NextResponse.json({
        success: true,
        question,
        answer: "Based on the official **API Security & OAuth Token Management SOP** (Source: CONFLUENCE), here is your security guidance:\n\n**Step 1:** Never expose API keys, database credentials, or OAuth tokens in client-side code, git repositories, or logs.\n\n**Step 2:** Store all sensitive configuration values in .env files ignored by version control.\n\n**Step 3:** Enforce strict role-based access control (RBAC) on all protected routes prior to data retrieval.\n\n**Step 4:** Verify organization ID and user permissions before allowing RAG chunk retrieval.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Credential Secrecy: Never expose tokens in repositories.",
            prerequisites: ["Security authorization"],
            isCompleted: false
          },
          {
            stepNumber: 2,
            instruction: "Store values in .env ignored by Git.",
            prerequisites: ["Completion of Step 1"],
            isCompleted: false
          },
          {
            stepNumber: 3,
            instruction: "Enforce RBAC on all protected routes.",
            prerequisites: ["Completion of Step 2"],
            isCompleted: false
          },
          {
            stepNumber: 4,
            instruction: "Validate organization tenant permissions.",
            prerequisites: ["Completion of Step 3"],
            isCompleted: false
          }
        ],
        citations: [
          {
            sourcePlatform: "confluence",
            documentTitle: "API Security & OAuth Token Management SOP",
            sourceUrl: "https://confluence.ricoz.in/wiki/spaces/SEC/pages/api-tokens",
            sectionOrPage: "Security Compliance",
            version: "1.0"
          }
        ],
        relevanceScore: 0.887,
        conflictAlert: null
      });
    }

    // Default: Teammate allocation & engineering tech stack
    return NextResponse.json({
      success: true,
      question: question || "What is the required progress for teammates group allocation?",
      answer: "Based on the official **RicoZ Tech Stack & Engineering Standards SOP** (Source: NOTION), here is your guided step-by-step operational procedure:\n\n**Step 1:** Architecture Standard: All new full stack web development projects must use Next.js for frontend, Node.js + Express.js for backend, and MongoDB for database management.\n\n**Step 2:** Code Standards: Build reusable modular components, maintain consistent formatting with ESLint/Prettier, and implement clean layered architecture.\n\n**Step 3:** Security & Validation: Implement proper authentication, role-based authorization, input validation on every endpoint, and robust error handling.\n\n**Step 4:** Git Collaboration: Use Git and GitHub with descriptive branch names (feat/ or fix/) and peer pull-request reviews.\n\n**Step 5:** Teammate Allocation Rule: Interns and engineers must achieve at least 45% independent development progress before requesting group teammate allocation.\n\n*All steps must be executed in strict sequence according to company guidelines.*",
      steps: [
        {
          stepNumber: 1,
          instruction: "Architecture Standard: Use Next.js, Node.js + Express, and MongoDB.",
          prerequisites: ["Verify identity and document authorization"],
          isCompleted: false
        },
        {
          stepNumber: 2,
          instruction: "Code Standards: Build reusable components and clean architecture.",
          prerequisites: ["Completion of Step 1"],
          isCompleted: false
        },
        {
          stepNumber: 3,
          instruction: "Security & Validation: Implement RBAC, token hygiene, and input validation.",
          prerequisites: ["Completion of Step 2"],
          isCompleted: false
        },
        {
          stepNumber: 4,
          instruction: "Git Collaboration: Submit modular commits with clear branch tracking.",
          prerequisites: ["Completion of Step 3"],
          isCompleted: false
        },
        {
          stepNumber: 5,
          instruction: "Teammate Allocation Rule: Achieve at least 45% progress before requesting group allocation.",
          prerequisites: ["Completion of Step 4"],
          isCompleted: false
        }
      ],
      citations: [
        {
          sourcePlatform: "notion",
          documentTitle: "RicoZ Tech Stack & Engineering Standards SOP",
          sourceUrl: "https://notion.so/ricoz/engineering-standards",
          sectionOrPage: "Operational Procedure Clause",
          version: "2.0"
        }
      ],
      relevanceScore: 0.942,
      conflictAlert: null
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
