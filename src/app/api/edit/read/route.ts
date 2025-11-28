import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering (required for API routes in development)
export const dynamic = 'force-dynamic';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET(request: NextRequest) {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
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

    // Verify file exists and is within content directory
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify it's actually within content directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedContentDir = path.resolve(CONTENT_DIR);
    if (!resolvedPath.startsWith(resolvedContentDir)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

