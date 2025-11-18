import { getConfig } from '@/lib/config';
import { getMarkdownContent, getBibtexContent, getTomlContent, getPageConfig } from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import Profile from '@/components/home/Profile';
import About from '@/components/home/About';
import SelectedPublications from '@/components/home/SelectedPublications';
import News, { NewsItem } from '@/components/home/News';

import { Publication } from '@/types/publication';

// Define types for section config
interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
}

export default function Home() {
  const config = getConfig();
  const pageConfig = getPageConfig('about');

  if (!pageConfig) {
    return <div>Error loading about page configuration</div>;
  }

  // Extract research interests from page config
  const researchInterests = (pageConfig as { profile?: { research_interests?: string[] } }).profile?.research_interests;

  // Load dynamic content based on page config
  const sections = ((pageConfig as { sections: SectionConfig[] }).sections || []).map((section: SectionConfig) => {
    switch (section.type) {
      case 'markdown':
        return {
          ...section,
          content: section.source ? getMarkdownContent(section.source) : ''
        };
      case 'publications': {
        const bibtex = getBibtexContent('publications.bib');
        const allPubs = parseBibTeX(bibtex);
        const filteredPubs = section.filter === 'selected'
          ? allPubs.filter(p => p.selected)
          : allPubs;
        return {
          ...section,
          publications: filteredPubs.slice(0, section.limit || 5)
        };
      }
      case 'list': {
        const newsData = section.source ? getTomlContent<{ news: NewsItem[] }>(section.source) : null;
        return {
          ...section,
          items: newsData?.news || []
        };
      }
      default:
        return section;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <Profile
            author={config.author}
            social={config.social}
            features={config.features}
            researchInterests={researchInterests}
          />
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-8">
          {sections.map((section: SectionConfig) => {
            switch (section.type) {
              case 'markdown':
                return (
                  <About
                    key={section.id}
                    content={section.content || ''}
                    title={section.title}
                  />
                );
              case 'publications':
                return (
                  <SelectedPublications
                    key={section.id}
                    publications={section.publications || []}
                    title={section.title}
                  />
                );
              case 'list':
                return (
                  <News
                    key={section.id}
                    items={section.items || []}
                    title={section.title}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}

