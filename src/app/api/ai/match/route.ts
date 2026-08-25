import { NextRequest, NextResponse } from 'next/server';
import { analyzeMatchWithGemini } from '@/lib/gemini';
import { UserProfile, Project, ProjectRole } from '@/lib/types';
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
    const { candidate, project, targetRole } = body as {
      candidate: UserProfile;
      project: Project;
      targetRole?: ProjectRole;
    };

    if (!candidate || !project) {
      return NextResponse.json(
        { success: false, error: 'Missing candidate or project payload.' },
        { status: 400 }
      );
    }

    const match = await analyzeMatchWithGemini(candidate, project, targetRole);
    return NextResponse.json({ success: true, match });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
