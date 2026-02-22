# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PRISM (Portfolio & Research Interface Site Maker) — a configuration-driven personal academic website built with Next.js 15.3 (App Router + Turbopack), React 19, TypeScript 5, and Tailwind CSS 4. Produces a static export for GitHub Pages deployment. All content is managed through TOML, Markdown, and BibTeX files — no code changes needed for content updates.

## Commands

```bash
npm run dev      # Dev server with Turbopack (http://localhost:3000)
npm run build    # Production static build → out/
npm run lint     # ESLint with Next.js rules
./deploy.sh      # Full deploy: build, push source to main, push out/ to gh-pages
```

Node.js 22+ required.

## Architecture

### Content System (`content/`)

All site content lives in `content/` and is loaded at build time via `src/lib/content.ts`:

- `config.toml` — site metadata, author info, social links, navigation, feature flags
- `pages/*.toml` — page definitions (type: `text`, `card`, `publication`, `about`)
- `markdown/*.md` — markdown content referenced by page configs
- `bib/*.bib` — BibTeX publications parsed by `src/lib/bibtexParser.ts`

Content file resolution (`findContentFile`): tries the exact path first, then falls back through `pages/`, `data/`, `markdown/`, `bib/` subdirectories.

### Routing

- `/` — Homepage, renders `about.toml` (profile + configurable sections)
- `/[slug]/` — Dynamic pages generated from `config.navigation` entries via `generateStaticParams()`
- Page type determines which component renders: `PublicationsList`, `TextPage`, or `CardPage`
- Trailing slashes enabled for static export compatibility

### Static Export

Production builds use `output: 'export'` (configured conditionally in `next.config.ts`). API routes in `src/app/api/` are development-only and are excluded during deployment (moved aside by `deploy.sh`).

### Component Organization (`src/components/`)

- `home/` — Homepage sections: Profile, About, News, SelectedPublications
- `pages/` — Reusable page type renderers (TextPage, CardPage)
- `publications/` — PublicationsList with search, year/type/area filtering
- `layout/` — Navigation (scroll-spy in one-page mode), Footer
- `ui/` — ThemeProvider, ThemeToggle
- `edit/` — Dev-only content editing UI

### BibTeX Custom Fields

The parser supports these non-standard fields in `.bib` entries:
- `selected = "true"` — marks for "selected publications" display
- `preview` — short one-line description
- `description` — longer description
- `keywords` — comma-separated, used for research area detection
- `code` — link to source code
- `project` — link to project page
- Author markers: `*` (co-first), `†` (corresponding), `#` (co-author)

### Styling

- CSS variables for all colors in `src/app/globals.css` (light/dark modes)
- Dark mode via `.dark` class, managed by Zustand store with localStorage persistence
- Fonts: Inter (sans), Crimson Text (serif)
- Framer Motion for entrance animations
- `@headlessui/react` for accessible interactive components

## Key Patterns

- Server components for static content; `'use client'` only for interactive components
- Content is always loaded synchronously via `fs.readFileSync` at build time
- Navigation items with `type: 'page'` generate static routes; `type: 'link'` and `type: 'section'` do not
- One-page mode (configurable) embeds all page content on homepage with scroll-spy navigation
