import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

// GET /api/prds/[id] - Get a specific PRD
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`SELECT * FROM prds WHERE id = ${id}`.then(r => Array.from(r));

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'PRD not found',
        },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const prd = result[0];
    if (prd.sections) {
      prd.sections = typeof prd.sections === 'string' ? JSON.parse(prd.sections) : prd.sections;
    }
    if (prd.metadata) {
      prd.metadata = typeof prd.metadata === 'string' ? JSON.parse(prd.metadata) : prd.metadata;
    }

    return NextResponse.json({
      success: true,
      data: prd,
    });
  } catch (error: any) {
    console.error('Error fetching PRD:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PRD',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/prds/[id] - Update a PRD
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      content,
      sections,
      status,
      template,
      githubRepo,
      metadata,
    } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (content !== undefined) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      values.push(content);
    }
    if (sections !== undefined) {
      paramCount++;
      updates.push(`sections = $${paramCount}`);
      values.push(JSON.stringify(sections));
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }
    if (template !== undefined) {
      paramCount++;
      updates.push(`template = $${paramCount}`);
      values.push(template);
    }
    if (githubRepo !== undefined) {
      paramCount++;
      updates.push(`github_repo = $${paramCount}`);
      values.push(githubRepo);
    }
    if (metadata !== undefined) {
      paramCount++;
      updates.push(`metadata = $${paramCount}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    // Add updated_at (no parameter needed for CURRENT_TIMESTAMP)
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add id parameter for WHERE clause
    paramCount++;
    values.push(id);

    // Build dynamic update query
    const updateStr = updates.join(', ');
    const query = `UPDATE prds SET ${updateStr} WHERE id = $${paramCount} RETURNING *`;

    console.log('[UPDATE PRD] Query:', query);
    console.log('[UPDATE PRD] Values:', values.map((v, i) => `$${i+1}: ${typeof v === 'string' ? v.substring(0, 50) : v}`));
    console.log('[UPDATE PRD] Param count:', paramCount);

    const result = await sql.unsafe(query, values).then(r => Array.from(r));

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'PRD not found',
        },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const prd = result[0];
    if (prd.sections) {
      prd.sections = typeof prd.sections === 'string' ? JSON.parse(prd.sections) : prd.sections;
    }
    if (prd.metadata) {
      prd.metadata = typeof prd.metadata === 'string' ? JSON.parse(prd.metadata) : prd.metadata;
    }

    return NextResponse.json({
      success: true,
      data: prd,
    });
  } catch (error: any) {
    console.error('Error updating PRD:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update PRD',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/prds/[id] - Delete a PRD
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sql`DELETE FROM prds WHERE id = ${id} RETURNING id`.then(r => Array.from(r));

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'PRD not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PRD deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting PRD:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete PRD',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

