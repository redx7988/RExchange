import { NextRequest, NextResponse } from 'next/server';
import { suggestRolesAndSkillsWithGemini } from '@/lib/gemini';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    if (adminAuth) {
      const token = authHeader.split('Bearer ')[1];
      try {
        await adminAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
    } else {
      console.warn('Firebase Admin is not configured. Skipping auth check for development.');
    }

    const body = await req.json();
    const { title, description, projectType } = body as {
      title: string;
      description: string;
      projectType: string;
    };

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing title or description.' },
        { status: 400 }
      );
    }

    const suggestions = await suggestRolesAndSkillsWithGemini(title, description, projectType);
    return NextResponse.json({ success: true, suggestions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
