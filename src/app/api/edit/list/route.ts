import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering (required for API routes in development)
export const dynamic = 'force-dynamic';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET() {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const files: Array<{ name: string; path: string; type: 'file' | 'directory' }> = [];
    
    const readDir = (dir: string, basePath: string = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          readDir(fullPath, relativePath);
        } else if (entry.isFile()) {
          // Only include .toml, .md, .bib files
          const ext = path.extname(entry.name).toLowerCase();
          if (['.toml', '.md', '.bib'].includes(ext)) {
            files.push({
              name: entry.name,
              path: relativePath,
              type: 'file',
            });
          }
        }
      }
    };

    readDir(CONTENT_DIR);
    
    // Sort files by name
    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

