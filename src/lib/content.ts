import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Helper function to find file in content directory (supports subdirectories)
function findContentFile(filename: string): string | null {
    // If filename already contains a path, use it directly and don't try other locations
    if (filename.includes('/')) {
        const filePath = path.join(CONTENT_DIR, filename);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
        // If path is specified but file doesn't exist, return null (don't try other locations)
        return null;
    }
    
    // Try common locations for files without path
    const possiblePaths = [
        path.join(CONTENT_DIR, filename), // Root
        path.join(CONTENT_DIR, 'pages', filename), // Pages
        path.join(CONTENT_DIR, 'data', filename), // Data
        path.join(CONTENT_DIR, 'markdown', filename), // Markdown
        path.join(CONTENT_DIR, 'bib', filename), // BibTeX
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    
    return null;
}

export function getMarkdownContent(filename: string): string {
    try {
        const filePath = findContentFile(filename);
        if (!filePath) {
            console.error(`Markdown file not found: ${filename}`);
            return '';
        }
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Error loading markdown file ${filename}:`, error);
        return '';
    }
}

export function getBibtexContent(filename: string): string {
    try {
        const filePath = findContentFile(filename);
        if (!filePath) {
            console.error(`BibTeX file not found: ${filename}`);
            return '';
        }
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Error loading bibtex file ${filename}:`, error);
        return '';
    }
}

export function getTomlContent<T>(filename: string): T | null {
    try {
        const filePath = findContentFile(filename);
        if (!filePath) {
            console.error(`TOML file not found: ${filename}`);
            return null;
        }
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return parse(fileContent) as unknown as T;
    } catch (error) {
        console.error(`Error loading TOML file ${filename}:`, error);
        return null;
    }
}

export function getPageConfig<T = unknown>(pageName: string): T | null {
    // If pageName already contains a path (e.g., "data/awards" or "pages/cv"), use it directly
    if (pageName.includes('/')) {
        // If it doesn't end with .toml, add it
        const filename = pageName.endsWith('.toml') ? pageName : `${pageName}.toml`;
        return getTomlContent<T>(filename);
    }
    
    // Otherwise, try common locations
    return getTomlContent<T>(`pages/${pageName}.toml`) 
        || getTomlContent<T>(`data/${pageName}.toml`)
        || getTomlContent<T>(`${pageName}.toml`);
}
