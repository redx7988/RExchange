import { NextRequest, NextResponse } from 'next/server';
import { searchTeamsWithGemini, searchTeammatesWithGemini } from '@/lib/gemini';
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
    const { mode } = body;

    if (mode === 'join_team') {
      const { skills, comment, candidate, projects } = body;
      if (!candidate || !projects || !Array.isArray(projects)) {
        return NextResponse.json({ success: false, error: 'Invalid payload for team search.' }, { status: 400 });
      }
      const results = await searchTeamsWithGemini(skills || [], comment || '', candidate, projects);
      return NextResponse.json({ success: true, results });
    } else if (mode === 'find_teammates') {
      const { searchPrompt, targetSkills, project, candidatePool } = body;
      if (!project || !candidatePool || !Array.isArray(candidatePool)) {
        return NextResponse.json({ success: false, error: 'Invalid payload for teammate search.' }, { status: 400 });
      }
      const results = await searchTeammatesWithGemini(searchPrompt || '', targetSkills || [], project, candidatePool);
      return NextResponse.json({ success: true, results });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid mode.' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
