import { hashPassword } from './auth';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'employee' | 'department_lead' | 'org_admin';
  department: string;
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
  createdByUserId?: string;
  createdAt: string;
}

// In-Memory Global Store with Serverless Fallback
class GlobalDataStore {
  private users: Map<string, StoredUser> = new Map();
  private documents: Map<string, StoredSOPDocument> = new Map();

  constructor() {
    this.seedDefaultAdmin();
    this.seedCoreDocuments();
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
      createdAt: new Date().toISOString()
    });
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
        effectiveDate: '2026-10-15',
        author: 'People & HR Operations',
        tags: ['Human Resources', 'People & HR', 'google_drive'],
        createdAt: '2026-10-15T00:00:00Z',
        content: `HR Standard Operating Procedure: Time Off and Emergency Leave
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
        author: 'Finance Operations',
        tags: ['Finance & Operations', 'Finance', 'notion'],
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
        author: 'Operations',
        tags: ['Customer Operations', 'Operations', 'confluence'],
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
        title: 'Technical Incident Management & Bug Escalation SOP',
        sourceUrl: 'https://confluence.ricoz.in/wiki/spaces/TECH/pages/incident-sop',
        category: 'Incident Response',
        department: 'Engineering',
        version: '3.0',
        effectiveDate: '2026-10-10',
        author: 'Engineering Operations',
        tags: ['Incident Response', 'Engineering', 'confluence'],
        createdAt: '2026-10-10T00:00:00Z',
        content: `Technical SOP: Production Incident Management
1. Severity Classification: Classify outages immediately as P1 Critical (platform down), P2 Major (core service impaired), P3 Moderate, or P4 Low.
2. Incident War Room Activation: For P1 incidents, page the on-call Incident Commander within 15 minutes and open an active debugging bridge.
3. Status Communication: Dispatch stakeholder communication to internal channels and external status pages within 30 minutes of incident declaration.
4. Hotfix & Rollback Protocol: Deploy targeted hotfix or rollback to last verified stable commit upon technical lead authorization.
5. Blameless Post-Mortem: Conduct a root-cause analysis (RCA) within 24 hours of incident resolution and link corrective action tickets.`
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

  public createUser(user: Omit<StoredUser, 'id' | 'createdAt'>): StoredUser {
    const normalizedEmail = user.email.toLowerCase().trim();
    if (this.users.has(normalizedEmail)) {
      throw new Error('User already exists with this email address.');
    }
    const newUser: StoredUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      createdAt: new Date().toISOString()
    };
    this.users.set(normalizedEmail, newUser);
    return newUser;
  }

  // Document Operations
  public getAllDocuments(): StoredSOPDocument[] {
    return Array.from(this.documents.values());
  }

  public addDocument(doc: Omit<StoredSOPDocument, 'id' | 'createdAt'>): StoredSOPDocument {
    const newDoc: StoredSOPDocument = {
      ...doc,
      id: `doc_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    this.documents.set(newDoc.id, newDoc);
    return newDoc;
  }

  public deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }
}

// Global Singleton Instance
declare global {
  // eslint-disable-next-line no-var
  var __RICOZ_STORE__: GlobalDataStore | undefined;
}

export const dataStore: GlobalDataStore = globalThis.__RICOZ_STORE__ || (globalThis.__RICOZ_STORE__ = new GlobalDataStore());
