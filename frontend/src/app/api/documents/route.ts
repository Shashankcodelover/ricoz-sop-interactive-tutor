import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { verifyToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/securityGuard';

const CreateDocumentSchema = z.object({
  title: z.string().min(3, 'Document title must be at least 3 characters').max(150),
  category: z.string().min(2, 'Category is required').max(50),
  department: z.string().min(2, 'Department is required').max(50),
  sourcePlatform: z.enum(['notion', 'google_drive', 'confluence', 'custom_upload']).default('custom_upload'),
  sourceUrl: z.string().url('A valid URL or document reference link is required'),
  version: z.string().default('1.0'),
  effectiveDate: z.string().default(new Date().toISOString().split('T')[0]),
  tags: z.array(z.string()).default([]),
  content: z.string().min(20, 'Document must contain at least 20 characters of operational text and procedure clauses')
});

// GET /api/documents - Returns all live organizational documents
export async function GET() {
  const documents = dataStore.getAllDocuments();
  return NextResponse.json({
    success: true,
    count: documents.length,
    documents
  });
}

// POST /api/documents - User enters their own real enterprise document
export async function POST(request: Request) {
  try {
    // 1. Verify user authentication
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const userSession = verifyToken(token);

    if (!userSession) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required. Please sign in to add custom organizational documents.'
      }, { status: 401 });
    }

    // 2. Parse & Validate Document Payload
    const rawBody = await request.json();
    const parsed = CreateDocumentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid document payload'
      }, { status: 400 });
    }

    const { title, category, department, sourcePlatform, sourceUrl, version, effectiveDate, tags, content } = parsed.data;

    // 3. Sanitize Content
    const cleanTitle = sanitizeInput(title);
    const cleanContent = sanitizeInput(content);
    const cleanCategory = sanitizeInput(category);
    const cleanDepartment = sanitizeInput(department);
    const cleanVersion = sanitizeInput(version);

    // 4. Ingest into dataStore
    const newDoc = dataStore.addDocument({
      title: cleanTitle,
      category: cleanCategory,
      department: cleanDepartment,
      sourcePlatform,
      sourceUrl,
      version: cleanVersion,
      effectiveDate,
      author: `${userSession.name} (${cleanDepartment})`,
      tags: tags.length > 0 ? tags.map(t => sanitizeInput(t)) : [cleanCategory, cleanDepartment, sourcePlatform],
      content: cleanContent,
      createdByUserId: userSession.id
    });

    return NextResponse.json({
      success: true,
      message: 'Operational SOP document successfully ingested and indexed for RAG retrieval.',
      document: newDoc
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to ingest document';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
