import { hashPassword } from './auth';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'employee' | 'department_lead' | 'org_admin';
  department: string;
  status?: 'active' | 'suspended' | 'invited';
  createdAt: string;
}

export interface StoredSOPDocument {
  id: string;
  sourcePlatform: 'notion' | 'google_drive' | 'confluence' | 'custom_upload';
  title: string;
  sourceUrl: string;
  category: string;
  department: string;
  version: string;
  effectiveDate: string;
  author: string;
  tags: string[];
  content: string;
  status?: 'active' | 'deprecated' | 'in_review';
  chunksCount?: number;
  lastSyncedAt?: string;
  createdByUserId?: string;
  createdAt: string;
}

export interface UserAppSettings {
  id: string;
  userId?: string;
  llmProvider: 'local-rag' | 'gemini-1.5' | 'openai-gpt4o' | 'anthropic-claude' | 'groq-llama3';
  apiKey: string;
  modelName: string;
  temperature: number;
  ragTopK: number;
  strictPrerequisites: boolean;
  enableHallucinationGuard: boolean;
  themePreference: 'system' | 'light' | 'dark';
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  action: 'USER_LOGIN' | 'DOC_INGESTED' | 'DOC_DELETED' | 'SETTINGS_CHANGED' | 'SYNC_TRIGGERED' | 'POLICY_FLAGGED';
  details: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface ConnectorStatus {
  platform: 'notion' | 'google_drive' | 'confluence' | 'custom_upload';
  name: string;
  connected: boolean;
  docCount: number;
  lastSync: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

// In-Memory Global Store with Serverless Fallback
class GlobalDataStore {
  private users: Map<string, StoredUser> = new Map();
  private documents: Map<string, StoredSOPDocument> = new Map();
  private settings: Map<string, UserAppSettings> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private connectors: Map<string, ConnectorStatus> = new Map();

  constructor() {
    this.seedDefaultAdmin();
    this.seedCoreDocuments();
    this.seedDefaultSettings();
    this.seedConnectorsAndLogs();
  }

  private seedDefaultAdmin() {
    const adminEmail = 'shashank.j8426@gmail.com';
    this.users.set(adminEmail, {
      id: 'usr_lead_001',
      name: 'Shashank J',
      email: adminEmail,
      passwordHash: hashPassword('RicozTech2026!'),
      role: 'org_admin',
      department: 'Technology',
      status: 'active',
      createdAt: new Date().toISOString()
    });

    // Seed sample team members
    const staff = [
      { id: 'usr_staff_002', name: 'Aarav Patel', email: 'aarav.patel@ricoz.enterprise.io', role: 'department_lead' as const, department: 'DevOps & SRE', status: 'active' as const },
      { id: 'usr_staff_003', name: 'Priya Sharma', email: 'priya.sharma@ricoz.enterprise.io', role: 'employee' as const, department: 'Human Resources', status: 'active' as const },
      { id: 'usr_staff_004', name: 'Rohan Verma', email: 'rohan.verma@ricoz.enterprise.io', role: 'employee' as const, department: 'Finance', status: 'active' as const },
      { id: 'usr_staff_005', name: 'Ananya Rao', email: 'ananya.rao@ricoz.enterprise.io', role: 'department_lead' as const, department: 'Operations', status: 'active' as const },
    ];

    staff.forEach(s => {
      this.users.set(s.email, {
        ...s,
        passwordHash: hashPassword('StaffAccess2026!'),
        createdAt: '2026-10-15T09:00:00Z'
      });
    });
  }

  private seedDefaultSettings() {
    const defaultSettings: UserAppSettings = {
      id: 'global_default_settings',
      llmProvider: 'local-rag',
      apiKey: '',
      modelName: 'ricoz-hybrid-rag-384',
      temperature: 0.2,
      ragTopK: 5,
      strictPrerequisites: true,
      enableHallucinationGuard: true,
      themePreference: 'system',
      updatedAt: new Date().toISOString()
    };
    this.settings.set('global', defaultSettings);
  }

  private seedConnectorsAndLogs() {
    this.connectors.set('notion', {
      platform: 'notion',
      name: 'Notion Enterprise Workspace',
      connected: true,
      docCount: 2,
      lastSync: new Date(Date.now() - 3600000 * 2).toISOString(),
      syncStatus: 'synced'
    });
    this.connectors.set('google_drive', {
      platform: 'google_drive',
      name: 'Google Drive Shared Drives',
      connected: true,
      docCount: 2,
      lastSync: new Date(Date.now() - 3600000 * 4).toISOString(),
      syncStatus: 'synced'
    });
    this.connectors.set('confluence', {
      platform: 'confluence',
      name: 'Atlassian Confluence Space',
      connected: true,
      docCount: 2,
      lastSync: new Date(Date.now() - 3600000 * 5).toISOString(),
      syncStatus: 'synced'
    });
    this.connectors.set('custom_upload', {
      platform: 'custom_upload',
      name: 'Direct Operational Ingestion',
      connected: true,
      docCount: 1,
      lastSync: new Date().toISOString(),
      syncStatus: 'idle'
    });

    this.auditLogs = [
      {
        id: 'log_001',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        userName: 'Shashank J',
        action: 'USER_LOGIN',
        details: 'Admin authenticated via PBKDF2/HMAC security session',
        severity: 'info'
      },
      {
        id: 'log_002',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        userName: 'System Synchronizer',
        action: 'SYNC_TRIGGERED',
        details: 'Automated delta synchronization completed for Notion and Confluence',
        severity: 'info'
      },
      {
        id: 'log_003',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        userName: 'Policy Sentinel',
        action: 'POLICY_FLAGGED',
        details: 'PostgreSQL vs MongoDB stack contradiction detected and flagged for review',
        severity: 'warn'
      }
    ];
  }

  private seedCoreDocuments() {
    const defaultDocs: StoredSOPDocument[] = [
      {
        id: 'doc_tech_stack_001',
        sourcePlatform: 'notion',
        title: 'RicoZ Tech Stack & Engineering Standards SOP',
        sourceUrl: 'https://notion.so/ricoz/tech-stack-sop-v2',
        category: 'Engineering Standards',
        department: 'Technology',
        version: '2.0',
        effectiveDate: '2026-10-01',
        author: 'Technology Operations',
        tags: ['Engineering Standards', 'Technology', 'notion'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-10-01T00:00:00Z',
        createdAt: '2026-10-01T00:00:00Z',
        content: `Standard Operating Procedure: Full-Stack Web Development Architecture
1. Mandatory Technology Stack: All new full stack web development projects must use Next.js for frontend, Node.js + Express.js for backend, and MongoDB for database management.
2. Architecture Cleanliness: Build reusable modular components, maintain consistent formatting with ESLint/Prettier, and implement clean layered architecture.
3. Security & Validation: Implement proper authentication, role-based authorization, input validation on every endpoint, and robust error handling.
4. Git Collaboration: Use Git and GitHub with descriptive branch names (feat/ or fix/) and peer pull-request reviews.
5. Independent Progress Milestone: Interns and engineers must achieve at least 45% independent development progress before requesting group teammate allocation.`
      },
      {
        id: 'doc_leave_pto_005',
        sourcePlatform: 'google_drive',
        title: 'Leave, PTO & Emergency Absence SOP',
        sourceUrl: 'https://drive.google.com/file/d/1LeavePolicyRicoZ2026/view',
        category: 'Human Resources',
        department: 'People & HR',
        version: '2.1',
        effectiveDate: '2026-09-01',
        author: 'People & Culture',
        tags: ['Human Resources', 'People & HR', 'google_drive'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-09-01T00:00:00Z',
        createdAt: '2026-09-01T00:00:00Z',
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
        author: 'Finance Department',
        tags: ['Finance & Operations', 'Finance', 'notion'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-10-01T00:00:00Z',
        createdAt: '2026-10-01T00:00:00Z',
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
        author: 'Operations Team',
        tags: ['Customer Operations', 'Operations', 'confluence'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-09-15T00:00:00Z',
        createdAt: '2026-09-15T00:00:00Z',
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
        title: 'P1 Production Incident & Bug Escalation SOP',
        sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/TECH/pages/incident-response',
        category: 'Engineering & DevOps',
        department: 'Technology',
        version: '3.0',
        effectiveDate: '2026-10-15',
        author: 'SRE & Platform Team',
        tags: ['Engineering & DevOps', 'Technology', 'confluence'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-10-15T00:00:00Z',
        createdAt: '2026-10-15T00:00:00Z',
        content: `Engineering SOP: Production Outage and Bug Escalation Response
1. Severity Assessment: Classify severity within 5 minutes: P1 Critical (total service outage), P2 High (major degradation), or P3 Normal.
2. War Room Activation: For P1/P2 incidents, immediately create a dedicated Slack war room channel (#incident-YYYYMMDD) and summon on-call engineers.
3. Mitigation & Rollback First: Prioritize customer uptime over root-cause investigation: trigger automated container rollback or DNS failover immediately.
4. Stakeholder Communication: Send hourly status updates to internal leadership and update the public status page within 15 minutes of confirmation.
5. Post-Mortem & Remediation: Publish a comprehensive Blameless Post-Mortem within 48 hours with prevention action items logged in Jira.`
      },
      {
        id: 'doc_onboarding_009',
        sourcePlatform: 'google_drive',
        title: 'New Employee 7-Day Technical Onboarding SOP',
        sourceUrl: 'https://drive.google.com/file/d/1OnboardingGuide2026/view',
        category: 'People & Culture',
        department: 'People & HR',
        version: '1.5',
        effectiveDate: '2026-09-01',
        author: 'People & HR Operations',
        tags: ['People & Culture', 'People & HR', 'google_drive'],
        status: 'active',
        chunksCount: 5,
        lastSyncedAt: '2026-09-01T00:00:00Z',
        createdAt: '2026-09-01T00:00:00Z',
        content: `Onboarding SOP: 7-Day Technical Onboarding Journey
1. Day 1 System & Workspace Setup: Complete company email setup, join First Chat, configure 2FA, and verify RicoZ dashboard access.
2. Day 2 Development Environment: Clone assigned project repositories, install standardized Next.js/Node.js tooling, and verify local build passes.
3. Day 3 Architecture & Standards Review: Review the 30-Day Master Playbook, Git branch naming rules, and RACI matrices with your mentor.
4. Day 4 First PR Submission: Claim an introductory good-first-issue, open a descriptive pull request, and complete peer code review.
5. Day 5–7 Operational Independence: Achieve check-in compliance, participate in daily standups, and progress toward the 45% independent milestone.`
      }
    ];

    defaultDocs.forEach(d => this.documents.set(d.id, d));
  }

  // User Operations
  public findUserByEmail(email: string): StoredUser | null {
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  public getAllUsers(): StoredUser[] {
    return Array.from(this.users.values()).map(u => ({
      ...u,
      passwordHash: '[PROTECTED_HASH]'
    }));
  }

  public createUser(user: Omit<StoredUser, 'id' | 'createdAt'>): StoredUser {
    const normalizedEmail = user.email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error('User already exists with this email address.');
    }
    const newUser: StoredUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      status: user.status || 'active',
      createdAt: new Date().toISOString()
    };
    this.users.set(normalizedEmail, newUser);
    this.addAuditLog('USER_LOGIN', `New user registered: ${newUser.name} (${newUser.email}) - Role: ${newUser.role}`);
    return newUser;
  }

  public updateUserRole(email: string, role: 'employee' | 'department_lead' | 'org_admin'): StoredUser | null {
    const user = this.users.get(email.toLowerCase().trim());
    if (!user) return null;
    user.role = role;
    this.users.set(email.toLowerCase().trim(), user);
    this.addAuditLog('SETTINGS_CHANGED', `User role updated for ${user.name} to ${role}`);
    return user;
  }

  // Document Operations
  public getAllDocuments(): StoredSOPDocument[] {
    return Array.from(this.documents.values());
  }

  public addDocument(doc: Omit<StoredSOPDocument, 'id' | 'createdAt'>): StoredSOPDocument {
    const newDoc: StoredSOPDocument = {
      ...doc,
      id: `doc_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: doc.status || 'active',
      chunksCount: doc.chunksCount || Math.max(1, doc.content.split('\n').filter(l => l.trim().match(/^[0-9]+[.:\-)]/)).length),
      lastSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.documents.set(newDoc.id, newDoc);
    this.addAuditLog('DOC_INGESTED', `Document ingested: ${newDoc.title} (v${newDoc.version}) - Source: ${newDoc.sourcePlatform}`);
    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    const deleted = this.documents.delete(id);
    if (deleted && doc) {
      this.addAuditLog('DOC_DELETED', `Document archived: ${doc.title}`, 'warn');
    }
    return deleted;
  }

  public updateDocumentStatus(id: string, status: 'active' | 'deprecated' | 'in_review'): StoredSOPDocument | null {
    const doc = this.documents.get(id);
    if (!doc) return null;
    doc.status = status;
    this.documents.set(id, doc);
    this.addAuditLog('SETTINGS_CHANGED', `Document status updated: ${doc.title} -> ${status}`);
    return doc;
  }

  // Settings & Real API Configuration Operations
  public getSettings(userId?: string): UserAppSettings {
    if (userId && this.settings.has(userId)) {
      return this.settings.get(userId)!;
    }
    return this.settings.get('global')!;
  }

  public updateSettings(settings: Partial<UserAppSettings>, userId?: string): UserAppSettings {
    const current = this.getSettings(userId);
    const updated: UserAppSettings = {
      ...current,
      ...settings,
      userId: userId || current.userId,
      updatedAt: new Date().toISOString()
    };
    const key = userId || 'global';
    this.settings.set(key, updated);
    this.addAuditLog('SETTINGS_CHANGED', `AI Engine configuration updated (Provider: ${updated.llmProvider})`);
    return updated;
  }

  // Connectors & Audit Logs
  public getConnectors(): ConnectorStatus[] {
    return Array.from(this.connectors.values());
  }

  public syncConnector(platform: string): ConnectorStatus | null {
    const conn = this.connectors.get(platform);
    if (!conn) return null;
    conn.lastSync = new Date().toISOString();
    conn.syncStatus = 'synced';
    const docsForPlatform = Array.from(this.documents.values()).filter(d => d.sourcePlatform === platform);
    conn.docCount = docsForPlatform.length;
    this.connectors.set(platform, conn);
    this.addAuditLog('SYNC_TRIGGERED', `Manual sync triggered for ${conn.name}`);
    return conn;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(action: AuditLogEntry['action'], details: string, severity: AuditLogEntry['severity'] = 'info', userName: string = 'System Admin') {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userName,
      action,
      details,
      severity
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
  }
}

// Global Singleton Instance
declare global {
  // eslint-disable-next-line no-var
  var __RICOZ_STORE__: GlobalDataStore | undefined;
}

export const dataStore: GlobalDataStore = globalThis.__RICOZ_STORE__ || (globalThis.__RICOZ_STORE__ = new GlobalDataStore());
