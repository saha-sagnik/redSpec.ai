import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

// GET /api/prds - List all PRDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const createdBy = searchParams.get('created_by');

    // Build query with template literal for postgres
    if (status && createdBy) {
      const result = await sql`SELECT * FROM prds WHERE status = ${status} AND created_by = ${createdBy} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`.then(r => Array.from(r));
      return NextResponse.json({
        success: true,
        data: result,
        count: result.length,
      });
    } else if (status) {
      const result = await sql`SELECT * FROM prds WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`.then(r => Array.from(r));
      return NextResponse.json({
        success: true,
        data: result,
        count: result.length,
      });
    } else if (createdBy) {
      const result = await sql`SELECT * FROM prds WHERE created_by = ${createdBy} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`.then(r => Array.from(r));
      return NextResponse.json({
        success: true,
        data: result,
        count: result.length,
      });
    } else {
      const result = await sql`SELECT * FROM prds ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`.then(r => Array.from(r));
      return NextResponse.json({
        success: true,
        data: result,
        count: result.length,
      });
    }

    } catch (error: any) {
    console.error('Error fetching PRDs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PRDs',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/prds - Create a new PRD
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      sections,
      status = 'draft',
      template = 'standard',
      githubRepo,
      createdBy,
      metadata,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required',
        },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO prds (title, content, sections, status, template, github_repo, created_by, metadata)
      VALUES (${title}, ${content}, ${sections ? JSON.stringify(sections) : null}, ${status}, ${template}, ${githubRepo || null}, ${createdBy || null}, ${metadata ? JSON.stringify(metadata) : null})
      RETURNING *
    `.then(r => Array.from(r));

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error: any) {
    console.error('Error creating PRD:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create PRD',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

