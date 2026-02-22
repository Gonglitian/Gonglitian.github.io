import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';

// Force dynamic rendering (required for API routes in development)
export const dynamic = 'force-dynamic';

const CONTENT_DIR = path.join(process.cwd(), 'content');

interface Section {
  id: string;
  title: string;
  filePath: string;
  icon?: string;
}

export async function GET() {
  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Load config to get navigation items
    const configPath = path.join(CONTENT_DIR, 'config.toml');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    interface Config {
      navigation?: Array<{
        type?: string;
        target?: string;
        title?: string;
      }>;
    }
    const config = parse(configContent) as Config;

    const sections: Section[] = [];
    const fileMap = new Map<string, string>();
    const idSet = new Set<string>();
    const navigationOrder: string[] = []; // Track navigation order

    // Map navigation items to files (preserve order)
    if (config.navigation && Array.isArray(config.navigation)) {
      config.navigation.forEach((nav) => {
        if (nav.type === 'page' && nav.target) {
          // Special handling for 'about' - show config.toml instead
          if (nav.target === 'about') {
            const configPath = path.join(CONTENT_DIR, 'config.toml');
            if (fs.existsSync(configPath) && !idSet.has('about')) {
              sections.push({
                id: 'about',
                title: 'About',
                filePath: 'config.toml',
              });
              fileMap.set('config.toml', 'about');
              idSet.add('about');
              navigationOrder.push('about');
            }
          } else if (nav.target === 'publications') {
            // Use bib/publications.bib instead of pages/publications.toml
            const filePath = 'bib/publications.bib';
            const fullPath = path.join(CONTENT_DIR, filePath);
            if (fs.existsSync(fullPath) && !idSet.has(nav.target)) {
              sections.push({
                id: nav.target,
                title: nav.title || nav.target,
                filePath: filePath,
              });
              fileMap.set(filePath, nav.target);
              idSet.add(nav.target);
              navigationOrder.push(nav.target);
            }
          } else if (nav.target !== 'cv') {
            // Skip CV, but include other pages
            const filePath = `pages/${nav.target}.toml`;
            const fullPath = path.join(CONTENT_DIR, filePath);
            if (fs.existsSync(fullPath) && !idSet.has(nav.target)) {
              sections.push({
                id: nav.target,
                title: nav.title || nav.target,
                filePath: filePath,
              });
              fileMap.set(filePath, nav.target);
              idSet.add(nav.target);
              navigationOrder.push(nav.target);
            }
          }
        }
      });
    }

    // Don't add about.toml sections separately - they're already handled by navigation
    // This prevents duplicate sections

    // Add other common files that might not be in navigation
    const commonFiles = [
      { file: 'markdown/bio.md', title: 'Bio', id: 'bio' },
      { file: 'pages/news.toml', title: 'News', id: 'news' },
      { file: 'markdown/cv.md', title: 'CV Content', id: 'cv-content' },
    ];

    commonFiles.forEach(({ file, title, id }) => {
      const fullPath = path.join(CONTENT_DIR, file);
      if (fs.existsSync(fullPath) && !fileMap.has(file) && !idSet.has(id)) {
        sections.push({
          id: id,
          title: title,
          filePath: file,
        });
        fileMap.set(file, id);
        idSet.add(id);
      }
    });

    // Sort sections: maintain navigation order, bio right after about, then other files
    sections.sort((a, b) => {
      // Get sort order: navigation items use their index, bio uses 0.5 (after about), others use 999
      const getOrder = (section: Section): number => {
        if (section.id === 'bio') return 0.5; // Right after about (index 0)
        const navIndex = navigationOrder.indexOf(section.id);
        if (navIndex !== -1) return navIndex;
        return 999; // Other files come last
      };
      
      const aOrder = getOrder(a);
      const bOrder = getOrder(b);
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // If same order (both are 999), sort alphabetically
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error loading sections:', error);
    return NextResponse.json(
      { error: 'Failed to load sections' },
      { status: 500 }
    );
  }
}

