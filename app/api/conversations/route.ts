import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  question?: {
    text: string;
    options: string[];
  };
}

// GET - Load conversations for a PRD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prdId = searchParams.get('prd_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!prdId) {
      return NextResponse.json(
        { success: false, error: 'prd_id is required' },
        { status: 400 }
      );
    }

    const conversations = await sql`
      SELECT id, role, content, timestamp, metadata
      FROM conversations
      WHERE prd_id = ${prdId}
      ORDER BY timestamp ASC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('[CONVERSATIONS API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load conversations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Save a conversation message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prd_id, role, content, metadata } = body;

    if (!prd_id || !role || !content) {
      return NextResponse.json(
        { success: false, error: 'prd_id, role, and content are required' },
        { status: 400 }
      );
    }

    const [conversation] = await sql`
      INSERT INTO conversations (prd_id, role, content, metadata)
      VALUES (${prd_id}, ${role}, ${content}, ${metadata ? JSON.stringify(metadata) : null})
      RETURNING id, role, content, timestamp, metadata
    `;

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('[CONVERSATIONS API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

