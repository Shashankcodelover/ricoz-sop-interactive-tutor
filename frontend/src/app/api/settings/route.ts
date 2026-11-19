import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dataStore, UserAppSettings } from '@/lib/dataStore';
import { verifyToken } from '@/lib/auth';
import { redactSecrets } from '@/lib/securityGuard';

const UpdateSettingsSchema = z.object({
  llmProvider: z.enum(['local-rag', 'gemini-1.5', 'openai-gpt4o', 'anthropic-claude', 'groq-llama3']).optional(),
  apiKey: z.string().max(200).optional(),
  modelName: z.string().max(100).optional(),
  temperature: z.number().min(0).max(1).optional(),
  ragTopK: z.number().int().min(1).max(20).optional(),
  strictPrerequisites: z.boolean().optional(),
  enableHallucinationGuard: z.boolean().optional(),
  themePreference: z.enum(['system', 'light', 'dark']).optional()
});

// GET /api/settings - Fetch current user or global settings
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const session = token ? verifyToken(token) : null;

    const settings = dataStore.getSettings(session?.id);
    
    // Mask API Key for safe client delivery unless empty
    const maskedSettings = {
      ...settings,
      apiKey: settings.apiKey ? `${settings.apiKey.substring(0, 6)}...${settings.apiKey.substring(settings.apiKey.length - 4)}` : '',
      hasCustomKey: Boolean(settings.apiKey && settings.apiKey.length > 5)
    };

    return NextResponse.json({
      success: true,
      settings: maskedSettings
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/settings - Update LLM / RAG / Engine Configuration
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const session = token ? verifyToken(token) : null;

    const rawBody = await request.json();
    const parsed = UpdateSettingsSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid configuration parameters',
        issues: parsed.error.issues
      }, { status: 400 });
    }

    // If apiKey is masked or untouched, do not overwrite existing real key
    const currentSettings = dataStore.getSettings(session?.id);
    const newConfig = { ...parsed.data };
    if (newConfig.apiKey && newConfig.apiKey.includes('...')) {
      delete newConfig.apiKey;
    }

    const updated = dataStore.updateSettings(newConfig, session?.id);

    const safeResponse = {
      ...updated,
      apiKey: updated.apiKey ? `${updated.apiKey.substring(0, 6)}...${updated.apiKey.substring(updated.apiKey.length - 4)}` : '',
      hasCustomKey: Boolean(updated.apiKey && updated.apiKey.length > 5)
    };

    return NextResponse.json({
      success: true,
      message: 'Enterprise tutor settings saved successfully',
      settings: safeResponse
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
