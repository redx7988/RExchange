import { NextRequest, NextResponse } from 'next/server';
import { generateCopilotAdviceWithGemini, CopilotRequestParams } from '@/lib/gemini';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    if (adminAuth) {
      const token = authHeader.split('Bearer ')[1];
      try {
        await adminAuth.verifyIdToken(token);
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
    } else {
      console.warn('Firebase Admin is not configured. Skipping auth check for development.');
    }

    const body = await req.json();
    const { userPrompt, topic, userProfile, activeProject } = body as CopilotRequestParams;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'userPrompt string is required' },
        { status: 400 }
      );
    }

    const advice = await generateCopilotAdviceWithGemini({
      userPrompt,
      topic,
      userProfile,
      activeProject,
    });

    return NextResponse.json(advice, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/ai/copilot:', error);
    return NextResponse.json(
      { error: error.message || 'Internal AI Copilot error' },
      { status: 500 }
    );
  }
}
