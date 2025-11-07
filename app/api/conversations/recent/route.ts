import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get recent conversations (last 10 PRDs with their latest messages)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent PRDs with their latest conversation
    const recentChats = await sql`
      SELECT DISTINCT ON (c.prd_id)
        p.id as prd_id,
        p.title,
        p.created_at,
        p.updated_at,
        c.content as last_message,
        c.role as last_message_role,
        c.timestamp as last_message_time
      FROM conversations c
      INNER JOIN prds p ON c.prd_id = p.id
      ORDER BY c.prd_id, c.timestamp DESC
      LIMIT ${limit}
    `.then(r => Array.from(r));

    return NextResponse.json({
      success: true,
      data: recentChats,
    });
  } catch (error) {
    console.error('[CONVERSATIONS API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load recent chats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

