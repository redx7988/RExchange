import { NextRequest, NextResponse } from 'next/server';
import { balanceTeamWithGemini } from '@/lib/gemini';
import { Project, UserProfile } from '@/lib/types';
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
    const { project, candidatePool } = body as {
      project: Project;
      candidatePool: UserProfile[];
    };

    if (!project || !candidatePool || !Array.isArray(candidatePool)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project or candidate pool provided.' },
        { status: 400 }
      );
    }

    const recommendation = await balanceTeamWithGemini(project, candidatePool);
    return NextResponse.json({ success: true, recommendation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
