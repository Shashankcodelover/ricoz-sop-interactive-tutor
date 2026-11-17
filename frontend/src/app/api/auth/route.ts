import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore } from '@/lib/dataStore';
import { hashPassword, verifyPassword, createToken, verifyToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/securityGuard';

const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Valid work email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().default('Engineering'),
  role: z.enum(['employee', 'department_lead', 'org_admin']).default('employee')
});

const SignInSchema = z.object({
  email: z.string().email('Valid work email required'),
  password: z.string().min(1, 'Password is required')
});

// GET /api/auth/me - Verify current session
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json({ success: false, authenticated: false, error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Auth check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/auth/me - Handles Sign-Up and Sign-In actions
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const action = rawBody.action; // 'signin' | 'signup'

    if (action === 'signup') {
      const parsed = SignUpSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid registration details'
        }, { status: 400 });
      }

      const { name, email, password, department, role } = parsed.data;
      const cleanName = sanitizeInput(name);
      const cleanEmail = sanitizeInput(email).toLowerCase();

      const existingUser = dataStore.findUserByEmail(cleanEmail);
      if (existingUser) {
        return NextResponse.json({
          success: false,
          error: 'An account with this email address already exists. Please sign in.'
        }, { status: 409 });
      }

      const passwordHash = hashPassword(password);
      const newUser = dataStore.createUser({
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        department,
        role
      });

      const token = createToken({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      });

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department
        }
      }, { status: 201 });
    }

    if (action === 'signin') {
      const parsed = SignInSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({
          success: false,
          error: parsed.error.issues[0]?.message || 'Email and password required'
        }, { status: 400 });
      }

      const { email, password } = parsed.data;
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const user = dataStore.findUserByEmail(cleanEmail);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email credentials or password.'
        }, { status: 401 });
      }

      const token = createToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      });

      return NextResponse.json({
        success: true,
        message: 'Signed in successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
