# Project Onboarding & Architecture Brief: Catalog #86

**Project Title:** Internal Knowledge & SOP Interactive Tutor  
**Company:** FIRSTRICOZ PRIVATE LIMITED (RicoZ Innovation)  
**Lead / Head of Technology:** Shashank J  
**Current Milestone Status:** **95.6% Complete (Gate G3 Feature Freeze Passed)**  
**Live Production URL:** [https://frontend-pi-ten-67.vercel.app](https://frontend-pi-ten-67.vercel.app)  
**GitHub Repository:** [https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor](https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor)

---

## 1. What Are We Building?

The **Internal Knowledge & SOP Interactive Tutor** is an enterprise operational AI engine that transforms static, fragmented internal company documents across **Notion**, **Google Drive**, and **Confluence** into an **interactive, step-by-step operational tutor**.

### The Core Problems Solved
1. **The "Contradicted Claim" Vulnerability:** When companies revise policies (e.g., standardizing on MongoDB instead of PostgreSQL, or updating leave rules), older documents still linger in drives. Standard chatbots hallucinate or quote deprecated policies. Our engine features a **Policy Contradiction & Freshness Detector** that flags version discrepancies before answering.
2. **Procedural Breakdown from Naive Chunking:** Arbitrary token splitting cuts numbered operational procedures in half. We implement **Two-Tier Hierarchical Chunking** (Parent context ~1500 tokens, Child action steps ~180 tokens).
3. **Interactive Step-by-Step Execution:** Instead of passive walls of text, employees receive sequential checklists with verified prerequisite checking, execution note/blocker logging, and real-time completion rings.
4. **Real Authentication & User-Entered Documents:** Complete user account management (Sign In / Sign Up with PBKDF2/HMAC security) and custom SOP document ingestion, removing all dummy data constraints.

---

## 2. Standardized Tech Stack

As mandated by company engineering standards (RicoZ Tech Stack SOP v2.0):
* **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS, Lucide Icons.
* **Backend:** Node.js + Express.js REST API + Next.js Serverless Edge Handlers.
* **Database & Persistence:** MongoDB (Mongoose Schemas: `Organization`, `User`, `Document`, `Chunk`, `SOPSession`) + In-Memory Singleton Store with Token Session Verification.
* **RAG Retrieval Engine:** 384-dimensional dense vector embeddings with $L_2$ unit normalization + BM25 sparse keyword ranking.
* **Design System:** Editorial TechPulse luxury palette (*Warm Paper & Ink* Light Theme + *Obsidian Studio* Dark Theme) with side-by-side Mobile 375 & Desktop 1280 Board Deck views.

---

## 3. Repository Structure & Key Files

```
ricoz-sop-interactive-tutor/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Interactive Tutor UI, Stepper, Knowledge Base, Dual Board Deck, Auth & Ingest Modals
│   │   │   ├── globals.css            # TechPulse CSS tokens (--canvas, --card, --accent, --ink)
│   │   │   ├── api/auth/route.ts      # Authentication endpoints (Sign In, Sign Up, Session verification)
│   │   │   ├── api/documents/route.ts # Custom SOP document ingestion endpoint
│   │   │   └── api/tutor/route.ts     # Edge RAG retrieval route & prompt injection defense
│   │   └── lib/
│   │       ├── auth.ts                # Cryptographic PBKDF2 password hashing & HMAC tokens
│   │       ├── dataStore.ts           # Dynamic persistence store for users and custom SOPs
│   │       └── securityGuard.ts       # Cybersecurity shield (injection filter, secret masking, rate limit)
├── backend/
│   ├── src/
│   │   ├── models/                    # Mongoose multi-tenant schemas
│   │   ├── services/
│   │   │   ├── connectors/            # Notion, Google Drive, and Confluence adapters
│   │   │   └── rag/                   # Hierarchical chunker & vector retriever
│   │   └── server.js                  # Standalone Express backend
├── Master Playbook PART I & PART II.pdf
├── PROJECT_DETAILS.md
└── README.md
```

---

## 4. Workstream Role Distribution

With the platform surpassing the 45% threshold (currently at 95.6%), the following workstreams are available for collaboration:

1. **AI & RAG Engine (Head of Tech / Current Focus):** Hierarchical vector indexing, policy conflict detection, and prompt defense.
2. **Frontend UI/UX:** Expanding the Dual Board Deck, adding interactive step exception handling, and custom filter drawers.
3. **Backend & Integrations:** Live webhook sync for Notion and Confluence databases, and MongoDB Atlas Vector Search clustering.
4. **QA & Chaos Automation:** Extending the automated test suite beyond the existing 100-bot chaos vectors.
5. **Product & Marketing (GTM):** Documentation, demo video recording, and launch collateral for Gate G4/G5 readiness.

---

## 5. Quick Start for New Teammates

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor.git
   cd ricoz-sop-interactive-tutor
   ```
2. **Run the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the live app.
3. **Test the Production Build:** Visit [https://frontend-pi-ten-67.vercel.app](https://frontend-pi-ten-67.vercel.app).
