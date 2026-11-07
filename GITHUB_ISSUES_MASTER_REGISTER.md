# 📋 GitHub Issues Master Register & Role Distribution
## Project: Internal Knowledge & SOP Interactive Tutor (#86)
### Standard: Ricoz Innovation 30-Day Product Execution & GTM Playbook (v2.0)

This document contains the exact technical specification for all GitHub Issues to be distributed across the engineering team. Each issue is formulated with mandatory **Playbook Task IDs**, **Objectives**, **Detailed Technical Requirements**, **Acceptance Criteria**, and **Evidence Standards**.

---

## Issue #1: [TRACK 1 - AI/RAG] Hierarchical Parent-Child Chunking & Advanced Vector Search Pipeline
* **Playbook Task ID:** `TEC-D11-AI` (Phase 3 Core Architecture)
* **Primary Assignee:** `@Shashankcodelover` (Head of Technology / AI & RAG Lead)
* **Reviewer:** Technology Lead (`Shashank J`)
* **Priority:** `Critical / P1`
* **Labels:** `track:ai-rag`, `architecture`, `priority:critical`

### 🎯 Objective
Implement an enterprise-grade hierarchical vector retrieval pipeline to eliminate procedural fragmentation where sequential SOP clauses are split across arbitrary token boundaries.

### 🛠️ Scope of Work
1. **Parent-Child Chunking Engine:**
   * Build a recursive document parser that identifies markdown headings, sections, and procedural boundaries.
   * Generate **Parent Chunks (~1500–2000 tokens)** preserving complete SOP section context, prerequisite conditions, and warning notes.
   * Generate granular **Child Chunks (~150–250 tokens)** representing individual steps or clauses.
2. **Normalized Vector Embeddings:**
   * Implement vector embedding generator with unit normalization ($L_2$ norm).
   * Integrate dense vector cosine similarity with sparse BM25/keyword regex scoring (60% dense + 40% sparse).
3. **Atlas Vector Search Schema:**
   * Define vector index configuration for MongoDB Atlas collections (`vector_index_sop`).

### ✅ Acceptance Criteria
* [ ] Child chunks link directly to their parent chunk via `parentChunkId`.
* [ ] Multi-turn query retriever retrieves top-k child chunks and automatically passes parent chunk context to the synthesis prompt.
* [ ] Benchmark cosine similarity precision demonstrates zero procedural step severance on 5 sample multi-step SOPs.

### 📎 Required Evidence
Unit test execution logs showing parent-child chunk mapping and cosine score distributions.

---

## Issue #2: [TRACK 1 - AI/RAG] SOP Policy Contradiction & Freshness Detection Engine
* **Playbook Task ID:** `TEC-D12-AI` (Phase 3 Core AI Engine)
* **Primary Assignee:** `@Shashankcodelover` (Head of Technology / AI & RAG Lead)
* **Reviewer:** Technology Lead (`Shashank J`)
* **Priority:** `Critical / P1`
* **Labels:** `track:ai-rag`, `compliance`, `priority:critical`

### 🎯 Objective
Build a pre-generation contradiction detection layer to prevent the LLM from synthesizing outdated or diverging company policies when older and newer versions of an SOP are retrieved.

### 🛠️ Scope of Work
1. **Context Validation Layer:**
   * Analyze retrieved candidate chunks prior to LLM generation.
   * Group retrieved chunks by category, title, and target entity.
2. **Version & Effective Date Matrix:**
   * Compare document metadata (`effectiveDate`, `version`, `status`).
   * Flag mutually exclusive clauses (e.g., conflicting travel limits, differing notice periods).
3. **Conflict Guardrail & Refusal Protocol:**
   * If a contradiction is detected, generate an explicit warning banner:
     > *"Policy Discrepancy Detected: [Document A v1.0] conflicts with [Document B v2.0]. Please verify with the policy owner."*
   * Refuse to hallucinate an arbitrary compromise between conflicting rules.

### ✅ Acceptance Criteria
* [ ] Detects conflicting thresholds across 2 divergent sample policies with 100% accuracy.
* [ ] Emits structured `conflictAlert` in the JSON response payload.
* [ ] Never produces an ungrounded or invented answer when evidence is contradictory.

### 📎 Required Evidence
Test logs showing contradiction detection trigger and structured conflict alert output.

---

## Issue #3: [TRACK 2 - BACKEND] Multi-Tenant Express REST APIs & Role-Based Access Control (RBAC)
* **Playbook Task ID:** `TEC-D12-BE` (Data Layer & API Infrastructure)
* **Primary Assignee:** `Teammate: Backend Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `Critical / P1`
* **Labels:** `track:backend`, `database`, `security`

### 🎯 Objective
Establish robust, secure multi-tenant REST APIs in Express.js with strict Mongoose schemas and organization-level data isolation.

### 🛠️ Scope of Work
1. **Mongoose Schema Hardening:**
   * Connect and validate schemas: `Organization`, `User`, `Document`, `Chunk`, and `SOPSession`.
   * Enforce tenant isolation: Every query MUST include `organizationId` filter.
2. **RBAC Middleware:**
   * Implement role validation middleware supporting: `employee`, `hr`, `operations_manager`, `department_manager`, `knowledge_admin`, and `org_admin`.
   * Ensure employees can only query documents tagged with permitted roles and categories.
3. **Session & History Endpoints:**
   * `POST /api/sessions/start` - Initialize interactive SOP session.
   * `PUT /api/sessions/:id/step` - Mark individual procedure step as completed.
   * `GET /api/sessions/:id/history` - Retrieve execution audit trail.

### ✅ Acceptance Criteria
* [ ] Tenant data leakage test passes: A user from Org A cannot retrieve documents or chunks belonging to Org B.
* [ ] Unauthorized role requests receive `403 Forbidden` with structured error messages.
* [ ] Full CRUD operations for document management functional and tested via Postman / curl.

### 📎 Required Evidence
Postman collection export or terminal curl execution traces demonstrating RBAC boundary enforcement.

---

## Issue #4: [TRACK 2 - BACKEND] Multi-Source Ingestion Connectors (Notion, Drive, Confluence)
* **Playbook Task ID:** `TEC-D13-BE` (Ingestion & Integration Layer)
* **Primary Assignee:** `Teammate: Backend Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `High / P2`
* **Labels:** `track:backend`, `integration`, `connectors`

### 🎯 Objective
Build automated ingestion adapters to pull, normalize, and extract text and metadata from Notion, Google Drive, and Confluence repositories.

### 🛠️ Scope of Work
1. **Notion Ingestion Adapter:**
   * Ingest page trees and databases recursively using Notion API blocks.
   * Clean rich text, extract block children, and preserve heading hierarchies.
2. **Google Drive & Docs Adapter:**
   * Parse Google Docs and PDF uploads. Extract document title, owner, modified date, and clean text.
3. **Confluence Cloud Adapter:**
   * Parse Atlassian storage-format XHTML. Convert macro containers and tables into clean markdown.
4. **Metadata Extraction:**
   * Attach `externalId`, `sourceUrl`, `version`, `department`, and `effectiveDate` to every ingested entity.

### ✅ Acceptance Criteria
* [ ] Ingestion endpoint `POST /api/ingest` accepts raw payload and returns normalized document object.
* [ ] Ingested text is stripped of noisy markup while preserving bullet points and numbered procedures.
* [ ] Failed or malformed documents trigger logged retries without crashing the server.

### 📎 Required Evidence
Sample ingestion output showing converted markdown from Notion and Confluence storage formats.

---

## Issue #5: [TRACK 3 - FRONTEND] Next.js Interactive SOP Stepper & Streaming Chat Interface
* **Playbook Task ID:** `TEC-D13-FE` (Frontend Implementation & UX)
* **Primary Assignee:** `Teammate: Frontend & UX Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `Critical / P1`
* **Labels:** `track:frontend`, `ui/ux`, `priority:critical`

### 🎯 Objective
Develop a modern, highly responsive Next.js 14 App Router user interface featuring an interactive procedure stepper and grounded conversational chat.

### 🛠️ Scope of Work
1. **Conversational Tutor Chat:**
   * Implement dynamic chat view with auto-scrolling, loading skeleton indicators, and Markdown rendering.
   * Add preset operational prompt pills ("Tech stack guidelines", "Attendance policy", "Token security").
2. **Interactive SOP Stepper Widget:**
   * Display procedural steps in sequential order (`Step 1 ➔ Step 2 ➔ Step 3`).
   * Allow users to click and toggle step completion with optimistic UI updates.
   * Display prerequisite badges and celebratory validation state upon 100% completion.
3. **Citation & Source Badges:**
   * Render clickable source badges displaying platform icon (Notion, Drive, Confluence), document title, and version.
   * Open document drawer/modal with source excerpts on badge click.

### ✅ Acceptance Criteria
* [ ] Mobile-responsive layout (fully functional across 320px mobile to 4K desktop).
* [ ] Zero client-side hydration errors in React 18/19.
* [ ] Accessible UI: Keyboard navigable with proper ARIA attributes.

### 📎 Required Evidence
Screenshots/video walkthrough showing live step toggling and citation modal interaction.

---

## Issue #6: [TRACK 3 - FRONTEND] Document Ingestion Dashboard & Organization Settings UI
* **Playbook Task ID:** `TEC-D15-FE` (Knowledge Management UI)
* **Primary Assignee:** `Teammate: Frontend & UX Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `High / P2`
* **Labels:** `track:frontend`, `admin`, `ui/ux`

### 🎯 Objective
Build the administrative interface for Knowledge Admins to monitor connected platforms, review ingestion indexing status, and inspect indexed SOP documents.

### 🛠️ Scope of Work
1. **Knowledge Source Management Page:**
   * Display connection status cards for Notion, Google Drive, and Confluence.
   * Provide sync trigger button with last-synced timestamp.
2. **Indexed SOP Document Table:**
   * Paginated table showing: Document Title, Platform, Version, Department, Chunks Count, and Status (Active/Deprecated).
   * Search and filter by category and department.
3. **Policy Discrepancy Alert Center:**
   * Admin notification panel displaying detected conflicting policies requiring manual review.

### ✅ Acceptance Criteria
* [ ] Real-time status indicators (Connected, Syncing, Error).
* [ ] Search and filter operates with sub-100ms UI latency.
* [ ] Follows TailwindCSS design system consistent with the main Tutor interface.

### 📎 Required Evidence
Clean Next.js route build output and screen recordings of the Knowledge Dashboard.

---

## Issue #7: [TRACK 4 - QA & DEVOPS] Automated Test Suite, End-to-End Testing & Jest Coverage
* **Playbook Task ID:** `TEC-D18-QA` (QA Validation & Test Automation)
* **Primary Assignee:** `Teammate: QA & SecOps Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `Critical / P1`
* **Labels:** `track:qa-devops`, `testing`, `priority:critical`

### 🎯 Objective
Establish continuous quality validation by developing unit, integration, and end-to-end test suites across the backend and frontend.

### 🛠️ Scope of Work
1. **Backend Integration Tests (Jest & Supertest):**
   * Write test suites for `/api/health`, `/api/documents`, `/api/tutor/query`, and `/api/ingest`.
   * Validate status codes, error payloads, and response schema contracts.
2. **RAG Retrieval Accuracy Benchmark:**
   * Benchmark test evaluating retrieval precision on sample SOP queries.
   * Validate that citation source URLs strictly match ingested document records.
3. **Frontend E2E / Component Testing:**
   * React Testing Library or Playwright tests verifying question submission and stepper state changes.

### ✅ Acceptance Criteria
* [ ] All tests execute via `npm test` with zero failures.
* [ ] Minimum 75% code coverage achieved on core backend business logic.
* [ ] Test execution completes in under 60 seconds in local and CI environments.

### 📎 Required Evidence
Jest test execution summary report showing passing assertions and coverage table.

---

## Issue #8: [TRACK 4 - QA & DEVOPS] Production CI/CD Pipeline, Secret Hygiene & Vercel Stabilization
* **Playbook Task ID:** `TEC-D16-DEVOPS` (Deployment & Security Hardening)
* **Primary Assignee:** `Teammate: QA & SecOps Engineer`
* **Accountable Reviewer:** Technology Lead (`@Shashankcodelover`)
* **Priority:** `Critical / P1`
* **Labels:** `track:qa-devops`, `deployment`, `security`

### 🎯 Objective
Harden production release infrastructure with automated GitHub Actions CI/CD, credential hygiene audits, and Vercel edge performance optimization.

### 🛠️ Scope of Work
1. **GitHub Actions CI/CD Pipeline:**
   * Create `.github/workflows/ci.yml` running linting, TypeScript check, and Jest test suite on every PR.
   * Block merges to `main` if the test suite or build fails.
2. **Secret Hygiene & Security Audit:**
   * Configure Git hooks / automated checks preventing `.env` or API key commits.
   * Audit headers: Ensure CORS, CSP, and HSTS headers are active on production endpoints.
3. **Vercel Production Monitoring:**
   * Monitor edge function response times (target: sub-800ms cold start, sub-250ms warm).
   * Configure environment variables securely on Vercel project settings.

### ✅ Acceptance Criteria
* [ ] GitHub Actions workflow passes green on PR branches.
* [ ] Zero security vulnerabilities reported by `npm audit`.
* [ ] Production deployment on Vercel maintains 99.9% uptime with zero runtime 500 errors.

### 📎 Required Evidence
Passing GitHub Actions workflow badge and Vercel production deployment log.
