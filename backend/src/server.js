const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const HierarchicalChunker = require('./services/rag/chunker');
const RAGEngine = require('./services/rag/ragEngine');
const SOPInteractiveTutor = require('./services/tutor/tutorService');
const { NotionAdapter, GoogleDriveAdapter, ConfluenceAdapter } = require('./services/connectors/adapters');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// In-Memory store for high-velocity local execution & instant demonstration
const inMemoryStore = {
  documents: [],
  chunks: [],
  sessions: []
};

// Seed foundational RicoZ SOPs so the tutor has live knowledge out-of-the-box
const seedInitialData = () => {
  const sampleDocs = [
    {
      sourcePlatform: 'notion',
      externalId: 'notion_sop_001',
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
      externalId: 'gdrive_hr_002',
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
      externalId: 'confluence_dev_003',
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
    }
  ];

  sampleDocs.forEach(rawDoc => {
    inMemoryStore.documents.push(rawDoc);
    const chunkHierarchy = HierarchicalChunker.processDocument(rawDoc.content, {
      sourcePlatform: rawDoc.sourcePlatform,
      documentTitle: rawDoc.title,
      sourceUrl: rawDoc.sourceUrl,
      version: rawDoc.version,
      department: rawDoc.department
    });

    chunkHierarchy.forEach(item => {
      // Embed and store child chunks
      item.children.forEach(child => {
        child.embedding = RAGEngine.generateEmbedding(child.content);
        inMemoryStore.chunks.push(child);
      });
      // Store parent chunk
      item.parent.embedding = RAGEngine.generateEmbedding(item.parent.content);
      inMemoryStore.chunks.push(item.parent);
    });
  });

  console.log(`[Seed] Ingested ${inMemoryStore.documents.length} official SOPs and generated ${inMemoryStore.chunks.length} vectorized chunks.`);
};

seedInitialData();

// --- REST API ENDPOINTS ---

// Health & System Information
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RicoZ Internal Knowledge & SOP Interactive Tutor API',
    version: '1.0.0',
    indexedDocuments: inMemoryStore.documents.length,
    vectorizedChunks: inMemoryStore.chunks.length,
    timestamp: new Date().toISOString()
  });
});

// List all indexed SOPs and documents
app.get('/api/documents', (req, res) => {
  res.json({
    success: true,
    total: inMemoryStore.documents.length,
    documents: inMemoryStore.documents.map(d => ({
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

// Interactive SOP Tutor Query Endpoint (Hybrid RAG + Contradiction Check)
app.post('/api/tutor/query', (req, res) => {
  const { question } = req.body;
  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question query string is required.' });
  }

  const queryVec = RAGEngine.generateEmbedding(question);

  // Hybrid search across all stored chunks
  const scoredChunks = inMemoryStore.chunks.map(chunk => ({
    chunk,
    score: RAGEngine.hybridScore(question, chunk, queryVec)
  })).sort((a, b) => b.score - a.score);

  // Top-k retrieved chunks (threshold: 0.15)
  const topK = scoredChunks.filter(sc => sc.score > 0.15).slice(0, 3);

  // Generate grounded guidance, citations, and interactive steps
  const guidance = SOPInteractiveTutor.generateTutorGuidance(question, topK);

  // Save session record
  const sessionId = `sess_${Date.now()}`;
  inMemoryStore.sessions.push({
    sessionId,
    question,
    response: guidance,
    timestamp: new Date()
  });

  res.json({
    success: true,
    sessionId,
    question,
    ...guidance,
    relevanceScore: topK.length > 0 ? parseFloat(topK[0].score.toFixed(4)) : 0
  });
});

// Document Ingestion Endpoint (Ingests Notion, Google Drive, or Confluence content)
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
    return res.status(400).json({ error: 'Unsupported source platform. Use notion, google_drive, or confluence.' });
  }

  inMemoryStore.documents.push(normalizedDoc);

  const chunkHierarchy = HierarchicalChunker.processDocument(normalizedDoc.content, {
    sourcePlatform: normalizedDoc.sourcePlatform,
    documentTitle: normalizedDoc.title,
    sourceUrl: normalizedDoc.sourceUrl,
    version: normalizedDoc.version,
    department: normalizedDoc.department
  });

  let newChunksCount = 0;
  chunkHierarchy.forEach(item => {
    item.children.forEach(child => {
      child.embedding = RAGEngine.generateEmbedding(child.content);
      inMemoryStore.chunks.push(child);
      newChunksCount++;
    });
    item.parent.embedding = RAGEngine.generateEmbedding(item.parent.content);
    inMemoryStore.chunks.push(item.parent);
    newChunksCount++;
  });

  res.json({
    success: true,
    message: `Successfully ingested document from ${platform.toUpperCase()}`,
    document: {
      title: normalizedDoc.title,
      version: normalizedDoc.version,
      newChunksIndexed: newChunksCount
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[RicoZ SOP Tutor API] Listening on port ${PORT}`);
});

