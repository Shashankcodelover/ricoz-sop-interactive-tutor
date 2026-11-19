import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { verifyToken } from '@/lib/auth';

// Helper to check org_admin or department_lead permissions
function checkAdminAccess(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = token ? verifyToken(token) : null;
  
  if (!session) {
    return { authorized: false, session: null, error: 'Authentication required' };
  }
  
  // Allow org_admin or department_lead
  if (session.role !== 'org_admin' && session.role !== 'department_lead') {
    return { authorized: false, session, error: 'Access forbidden: Insufficient administrative privileges' };
  }
  
  return { authorized: true, session, error: null };
}

// GET /api/admin - Return full administrative control state
export async function GET(request: Request) {
  try {
    const authCheck = checkAdminAccess(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const users = dataStore.getAllUsers();
    const documents = dataStore.getAllDocuments();
    const connectors = dataStore.getConnectors();
    const auditLogs = dataStore.getAuditLogs();
    const settings = dataStore.getSettings(authCheck.session?.id);

    // Compute key administrative health telemetry
    const stats = {
      totalDocuments: documents.length,
      activeDocuments: documents.filter(d => (d.status || 'active') === 'active').length,
      deprecatedDocuments: documents.filter(d => d.status === 'deprecated').length,
      totalUsers: users.length,
      totalAdmins: users.filter(u => u.role === 'org_admin' || u.role === 'department_lead').length,
      totalChunksIndexed: documents.reduce((acc, d) => acc + (d.chunksCount || 5), 0),
      connectedSourcesCount: connectors.filter(c => c.connected).length,
      lastSyncTimestamp: connectors.map(c => c.lastSync).sort().reverse()[0] || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      stats,
      users,
      documents,
      connectors,
      auditLogs,
      settings: {
        ...settings,
        apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 5)}...` : '',
        hasCustomKey: Boolean(settings.apiKey)
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve admin telemetry';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/admin - Administrative mutations (Sync trigger, User role change, Document status update, Delete document)
const AdminActionSchema = z.object({
  action: z.enum(['sync_connector', 'update_user_role', 'update_doc_status', 'delete_document']),
  platform: z.string().optional(),
  targetEmail: z.string().email().optional(),
  targetRole: z.enum(['employee', 'department_lead', 'org_admin']).optional(),
  documentId: z.string().optional(),
  documentStatus: z.enum(['active', 'deprecated', 'in_review']).optional()
});

export async function POST(request: Request) {
  try {
    const authCheck = checkAdminAccess(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const rawBody = await request.json();
    const parsed = AdminActionSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid administrative command payload',
        issues: parsed.error.issues
      }, { status: 400 });
    }

    const { action, platform, targetEmail, targetRole, documentId, documentStatus } = parsed.data;

    if (action === 'sync_connector' && platform) {
      const updatedConn = dataStore.syncConnector(platform);
      if (!updatedConn) {
        return NextResponse.json({ success: false, error: 'Platform connector not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${updatedConn.name}`,
        connector: updatedConn
      });
    }

    if (action === 'update_user_role' && targetEmail && targetRole) {
      const updatedUser = dataStore.updateUserRole(targetEmail, targetRole);
      if (!updatedUser) {
        return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Updated permissions for ${targetEmail} to ${targetRole}`,
        user: updatedUser
      });
    }

    if (action === 'update_doc_status' && documentId && documentStatus) {
      const updatedDoc = dataStore.updateDocumentStatus(documentId, documentStatus);
      if (!updatedDoc) {
        return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Document status changed to ${documentStatus}`,
        document: updatedDoc
      });
    }

    if (action === 'delete_document' && documentId) {
      const success = dataStore.deleteDocument(documentId);
      if (!success) {
        return NextResponse.json({ success: false, error: 'Document not found or already deleted' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Document ${documentId} deleted successfully`
      });
    }

    return NextResponse.json({ success: false, error: 'Unhandled action' }, { status: 400 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Admin action failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
