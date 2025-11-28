import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering (required for API routes in development)
export const dynamic = 'force-dynamic';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function POST(request: NextRequest) {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { path: filePath, content } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    const fullPath = path.join(CONTENT_DIR, normalizedPath);

    // Verify it's actually within content directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedContentDir = path.resolve(CONTENT_DIR);
    if (!resolvedPath.startsWith(resolvedContentDir)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Verify file exists (we only allow editing existing files)
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Write file
    fs.writeFileSync(fullPath, content, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}

