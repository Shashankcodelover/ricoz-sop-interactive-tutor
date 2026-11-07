# Internal Knowledge & SOP Interactive Tutor

> **Project Catalog ID:** 86. Internal Knowledge & SOP Interactive Tutor  
> **Organization:** FIRSTRICOZ PRIVATE LIMITED (RicoZ Innovation)  
> **Role:** Full Stack Development Internship  
> **Tech Stack:** Next.js (App Router), Node.js, Express.js, MongoDB, Retrieval-Augmented Generation (RAG)

---

## 📌 Overview

The **Internal Knowledge & SOP Interactive Tutor** is an enterprise-grade AI assistant that transforms static internal documents (Notion, Google Drive, Confluence) into an interactive operational tutor. 

Unlike conventional chatbots that simply return paragraphs of text, this system breaks down Standard Operating Procedures (SOPs) into **sequential, verifiable steps**, identifies **conflicting or outdated policies**, and provides **citations** to authoritative source documents.

---

## 🚀 Key Features

* **Hierarchical Parent-Child Chunking:** Solves procedural fragmentation by linking granular child action steps to full parent context.
* **Policy Contradiction & Freshness Detector:** Pre-generation analysis catches conflicting rules and version mismatches.
* **Interactive Step-by-Step Guidance:** Converts complex policies into actionable execution steps with prerequisite verification.
* **Multi-Source Connectors:** Ingestion adapters for Notion, Google Drive, and Confluence.
* **Enterprise Multi-Tenancy & RBAC:** Data isolation across organizations with role-based document access.

---

## 🛠️ Architecture

```
recoz/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & environmental configuration
│   │   ├── models/             # Mongoose schemas (Org, User, Doc, Chunk, Session)
│   │   ├── services/
│   │   │   ├── connectors/     # Notion, Drive, Confluence ingestion adapters
│   │   │   ├── rag/            # Hierarchical chunker & hybrid vector retrieval
│   │   │   └── tutor/          # Interactive step generator & conflict detector
│   │   └── server.js           # REST API entrypoint
│   └── package.json
└── frontend/                   # Next.js App Router client
```

---

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. API Endpoints
* `GET /api/health` - Service health & index metrics
* `GET /api/documents` - List all indexed organizational SOPs
* `POST /api/tutor/query` - Interactive tutor conversational endpoint with citations
* `POST /api/ingest` - Ingest documents from Notion, Google Drive, or Confluence
