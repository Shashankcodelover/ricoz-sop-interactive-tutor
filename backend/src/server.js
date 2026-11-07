const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const SOPHierarchicalChunker = require('./services/rag/sopHierarchicalChunker');
const InteractiveSOPTutorOrchestrator = require('./services/rag/tutorOrchestrator');
const { NotionAdapter, GoogleDriveAdapter, ConfluenceAdapter } = require('./services/connectors/adapters');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Global Knowledge State
const globalKnowledgeState = {
  documents: [],
  parentChunks: [],
  childChunks: [],
  sessions: []
};

// Seed Canonical Ricoz Knowledge Base & Master Playbook Standards
const seedMasterKnowledgeBase = () => {
  const masterDocs = [
    {
      sourcePlatform: 'notion',
      externalId: 'notion_sop_tech_001',
      title: 'RicoZ Tech Stack & Engineering Standards SOP',
      sourceUrl: 'https://notion.so/ricoz/engineering-standards',
      category: 'Engineering Standards',
      department: 'Engineering',
      version: '2.0',
      effectiveDate: new Date('2026-11-01'),
      content: `## Standard Operating Procedure: Full Stack Web Development
1. Architecture Standard: All new full stack web development projects must use Next.js for frontend, Node.js + Express.js for backend, and MongoDB for database management.
2. Code Standards: Build reusable modular components, maintain consistent formatting with ESLint/Prettier, and implement clean layered architecture.
3. Security & Validation: Implement proper authentication, role-based authorization, input validation on every endpoint, and robust error handling.
4. Git Collaboration: Use Git and GitHub with descriptive branch names (feat/ or fix/) and peer pull-request reviews.
5. Teammate Allocation Rule: Interns and engineers must achieve at least 45% independent development progress before requesting group teammate allocation.`
    },
    {
      sourcePlatform: 'google_drive',
      externalId: 'gdrive_hr_attendance_002',
      title: 'Employee Attendance & Daily Standup Policy',
      sourceUrl: 'https://drive.google.com/file/d/ricoz-attendance-sop',
      category: 'HR Policies',
      department: 'HR',
      version: '1.2',
      effectiveDate: new Date('2026-10-15'),
      content: `## HR Standard Operating Procedure: Daily Attendance & Reporting
1. Morning Attendance Check-In: Navigate to the portal Attendance Center and click Check In at the beginning of each working shift.
2. Task Creation & Tracking: Create and maintain daily tasks in the My Work / Tasks section with appropriate priorities (P1 Urgent or P2 High).
3. Evening Check-Out: Click Check Out in the Attendance Center at the conclusion of daily working hours.
4. Daily Standup: Post a concise standup update in First Chat summarizing completed items, active blockers, and next session targets.`
    },
    {
      sourcePlatform: 'confluence',
      externalId: 'confluence_sec_tokens_003',
      title: 'API Security & OAuth Token Management SOP',
      sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/SEC/pages/api-tokens',
      category: 'Security & Compliance',
      department: 'Engineering',
      version: '1.0',
      effectiveDate: new Date('2026-09-01'),
      content: `## Security SOP: API Key and Credential Hygiene
1. Credential Secrecy: Never expose API keys, database credentials, or OAuth tokens in client-side code, git repositories, or terminal logs.
2. Environment Configuration: Store all sensitive configuration values in .env files ignored by version control.
3. Access Control Validation: Enforce strict role-based access control (RBAC) on all protected routes prior to data retrieval.
4. Ingestion Permissions: Verify organization ID and user permissions before allowing RAG chunk retrieval.`
    },
    {
      sourcePlatform: 'notion',
      externalId: 'notion_playbook_gate_004',
      title: '30-Day Product Execution & GTM Playbook (v2.0)',
      sourceUrl: 'https://notion.so/ricoz/30-day-gtm-playbook',
      category: 'Product Governance',
      department: 'Product & Technology',
      version: '2.0',
      effectiveDate: new Date('2026-11-05'),
      content: `## Executive Operating Playbook: 30-Day Lifecycle & Gate Governance
1. Phase 1 Discovery: Days 1 to 5 cover ideation, technical feasibility, and exit at Gate G1.
2. Phase 2 Scope & Plan: Days 6 to 10 finalize detailed component design, task decomposition, and exit at Gate G2.
3. Phase 3 MVP Build: Days 11 to 17 activate core engineering, frontend integration, and exit at Gate G3 Feature-Complete sign-off.
4. Phase 4 Testing: Days 18 to 22 execute integration testing, performance optimization, and exit at Gate G4.
5. Phase 5 GTM Launch: Days 23 to 25 conduct Go/No-Go Gate G5 review and official GTM Launch at Day 25 Gate G6.
6. Evidence Standard: Principle 3 requires that no task can be marked complete without attached evidence (code, PR, or test logs).`
    }
  ];

  masterDocs.forEach(doc => {
    globalKnowledgeState.documents.push(doc);
    const hierarchy = SOPHierarchicalChunker.processSOP(doc.content, {
      sourcePlatform: doc.sourcePlatform,
      documentTitle: doc.title,
      sourceUrl: doc.sourceUrl,
      version: doc.version,
      department: doc.department,
      effectiveDate: doc.effectiveDate
    });

    hierarchy.forEach(item => {
      globalKnowledgeState.parentChunks.push(item.parent);
      item.children.forEach(child => {
        globalKnowledgeState.childChunks.push(child);
      });
    });
  });

  console.log(`[RicoZ Knowledge Init] Ingested ${globalKnowledgeState.documents.length} Master SOPs | Parents: ${globalKnowledgeState.parentChunks.length} | Children: ${globalKnowledgeState.childChunks.length}`);
};

seedMasterKnowledgeBase();

// --- REST API ROUTES ---

// Health & Indexing Metrics
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RicoZ Internal Knowledge & SOP Interactive Tutor API',
    leadArchitect: 'Shashank J (Head of Technology)',
    version: '2.0.0',
    metrics: {
      indexedDocuments: globalKnowledgeState.documents.length,
      parentContextChunks: globalKnowledgeState.parentChunks.length,
      childActionChunks: globalKnowledgeState.childChunks.length,
      vectorEmbeddingDimensions: 384
    },
    timestamp: new Date().toISOString()
  });
});

// List all indexed SOP documents
app.get('/api/documents', (req, res) => {
  res.json({
    success: true,
    total: globalKnowledgeState.documents.length,
    documents: globalKnowledgeState.documents.map(d => ({
      title: d.title,
      sourcePlatform: d.sourcePlatform,
      sourceUrl: d.sourceUrl,
      category: d.category,
      department: d.department,
      version: d.version,
      effectiveDate: d.effectiveDate
    }))
  });
});

// Enterprise Interactive SOP Tutor Query Endpoint
app.post('/api/tutor/query', (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'A valid question string is required.' });
  }

  // Execute full RAG & Tutoring pipeline
  const tutorResponse = InteractiveSOPTutorOrchestrator.processQuery(
    question,
    globalKnowledgeState.childChunks,
    globalKnowledgeState.parentChunks
  );

  const sessionId = `sess_${Date.now()}`;
  globalKnowledgeState.sessions.push({
    sessionId,
    question,
    response: tutorResponse,
    timestamp: new Date()
  });

  res.json({
    ...tutorResponse,
    sessionId
  });
});

// Multi-Source Document Ingestion Endpoint (Notion, Drive, Confluence)
app.post('/api/ingest', (req, res) => {
  const { platform, rawData } = req.body;
  if (!platform || !rawData) {
    return res.status(400).json({ error: 'Both platform and rawData are required.' });
  }

  let normalizedDoc;
  if (platform === 'notion') normalizedDoc = NotionAdapter.parsePage(rawData);
  else if (platform === 'google_drive') normalizedDoc = GoogleDriveAdapter.parseDoc(rawData);
  else if (platform === 'confluence') normalizedDoc = ConfluenceAdapter.parsePage(rawData);
  else {
    return res.status(400).json({ error: 'Unsupported platform. Supported: notion, google_drive, confluence.' });
  }

  globalKnowledgeState.documents.push(normalizedDoc);

  const hierarchy = SOPHierarchicalChunker.processSOP(normalizedDoc.content, {
    sourcePlatform: normalizedDoc.sourcePlatform,
    documentTitle: normalizedDoc.title,
    sourceUrl: normalizedDoc.sourceUrl,
    version: normalizedDoc.version,
    department: normalizedDoc.department,
    effectiveDate: normalizedDoc.effectiveDate
  });

  let parentsAdded = 0;
  let childrenAdded = 0;

  hierarchy.forEach(item => {
    globalKnowledgeState.parentChunks.push(item.parent);
    parentsAdded++;
    item.children.forEach(child => {
      globalKnowledgeState.childChunks.push(child);
      childrenAdded++;
    });
  });

  res.json({
    success: true,
    message: `Successfully ingested document from ${platform.toUpperCase()}`,
    document: {
      title: normalizedDoc.title,
      version: normalizedDoc.version,
      newParents: parentsAdded,
      newChildren: childrenAdded
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[RicoZ SOP Tutor API v2.0] Listening on port ${PORT}`);
});
