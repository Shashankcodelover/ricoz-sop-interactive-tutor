const mongoose = require('mongoose');

// Organization Schema (Strict multi-tenant isolation)
const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, default: 'enterprise_division' },
  activeIntegrations: [{ type: String, enum: ['notion', 'google_drive', 'confluence'] }],
  createdAt: { type: Date, default: Date.now }
});

// User Schema (Role-Based Access Control)
const UserSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['employee', 'hr', 'operations_manager', 'department_manager', 'knowledge_admin', 'org_admin'], 
    default: 'employee' 
  },
  department: { type: String, default: 'Engineering' },
  allowedCategories: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Document Schema (Source Metadata, Versioning, and Compliance)
const DocumentSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  sourcePlatform: { type: String, enum: ['notion', 'google_drive', 'confluence', 'manual_upload'], required: true },
  externalId: { type: String, required: true },
  title: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  category: { type: String, default: 'General SOP' },
  department: { type: String, default: 'All' },
  version: { type: String, default: '1.0' },
  effectiveDate: { type: Date, default: Date.now },
  lastModifiedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'deprecated', 'under_review', 'conflicted'], default: 'active' },
  allowedRoles: [{ type: String, default: ['employee'] }],
  rawContent: { type: String }
});

// Chunk Schema (Hierarchical Parent-Child Architecture)
const ChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  chunkType: { type: String, enum: ['parent', 'child'], required: true },
  parentChunkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chunk', default: null },
  content: { type: String, required: true },
  sectionTitle: { type: String, default: '' },
  stepNumber: { type: Number, default: null },
  embedding: { type: [Number], default: [] }, // Vector embedding array
  metadata: {
    sourcePlatform: String,
    documentTitle: String,
    sourceUrl: String,
    effectiveDate: Date,
    version: String,
    department: String
  }
});

// SOP Interactive Session Schema (Stateful Step-by-Step execution)
const SOPSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  sopTitle: { type: String, required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'blocked', 'escalated'], default: 'in_progress' },
  currentStepIndex: { type: Number, default: 0 },
  steps: [{
    stepNumber: Number,
    instruction: String,
    prerequisites: [String],
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    notes: String
  }],
  conversationHistory: [{
    sender: { type: String, enum: ['user', 'tutor', 'system'] },
    message: String,
    citations: [{
      sourcePlatform: String,
      documentTitle: String,
      sourceUrl: String,
      sectionOrPage: String
    }],
    conflictAlert: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  Organization: mongoose.model('Organization', OrganizationSchema),
  User: mongoose.model('User', UserSchema),
  Document: mongoose.model('Document', DocumentSchema),
  Chunk: mongoose.model('Chunk', ChunkSchema),
  SOPSession: mongoose.model('SOPSession', SOPSessionSchema)
};

