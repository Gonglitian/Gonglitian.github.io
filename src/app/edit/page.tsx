'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  FolderIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  AcademicCapIcon,
  TrophyIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  Cog6ToothIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import CardEditor from '@/components/edit/CardEditor';

interface Section {
  id: string;
  title: string;
  filePath: string;
  icon?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionIcons: Record<string, React.ComponentType<any>> = {
  about: UserIcon,
  bio: UserIcon,
  publications: AcademicCapIcon,
  awards: TrophyIcon,
  services: BriefcaseIcon,
  project: DocumentTextIcon,
  projects: DocumentTextIcon,
  cv: DocumentCheckIcon,
  'cv-content': DocumentCheckIcon,
  config: Cog6ToothIcon,
  news: NewspaperIcon,
};

export default function EditPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load sections list - must be called before conditional return
  useEffect(() => {
    loadSections();
  }, []);

  // Check if in development mode - redirect if not
  useEffect(() => {
    // In production build, this page won't exist, but add check anyway
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  // Don't render anything if not in development (server-side)
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/edit/sections');
      if (!response.ok) throw new Error('Failed to load sections');
      const data = await response.json();
      setSections(data.sections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const loadSectionContent = async (section: Section) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/edit/read?path=${encodeURIComponent(section.filePath)}`);
      if (!response.ok) throw new Error('Failed to load file');
      const data = await response.json();
      setContent(data.content || '');
      setOriginalContent(data.content || '');
      setSelectedSection(section);
      setSaveStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedSection) return;
    
    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/edit/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: selectedSection.filePath,
          content: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save file');
      }

      setOriginalContent(content);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = content !== originalContent;
  const isMarkdown = selectedSection?.filePath.endsWith('.md');
  const isToml = selectedSection?.filePath.endsWith('.toml');
  const isBib = selectedSection?.filePath.endsWith('.bib');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Content Editor</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Edit files in the content directory. Changes will automatically update via Next.js hot reload.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <FolderIcon className="h-5 w-5" />
                Sections
              </h2>
              <button
                onClick={loadSections}
                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Refresh list"
              >
                <ArrowPathIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
            
            {loading && !selectedSection ? (
              <div className="text-sm text-neutral-500">Loading...</div>
            ) : (
              <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {sections.map((section, index) => {
                  const Icon = sectionIcons[section.id] || DocumentTextIcon;
                  // Use filePath as key to ensure uniqueness (filePath is always unique)
                  return (
                    <button
                      key={`${section.id}-${section.filePath}-${index}`}
                      onClick={() => loadSectionContent(section)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2',
                        selectedSection?.id === section.id && selectedSection?.filePath === section.filePath
                          ? 'bg-accent/10 text-primary font-medium'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
            {selectedSection ? (
              <>
                <div className="border-b border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = sectionIcons[selectedSection.id] || DocumentTextIcon;
                      return <Icon className="h-5 w-5 text-neutral-500" />;
                    })()}
                    <span className="font-medium text-primary">{selectedSection.title}</span>
                    {hasChanges && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        Unsaved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircleIcon className="h-4 w-4" />
                        Saved
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        Save Failed
                      </div>
                    )}
                    <button
                      onClick={saveFile}
                      disabled={!hasChanges || saving}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        hasChanges && !saving
                          ? 'bg-accent text-white hover:bg-accent/90'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
                      )}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {isToml ? (
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      <CardEditor
                        content={content}
                        onChange={setContent}
                        fileName={selectedSection.filePath}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={cn(
                        'w-full h-[calc(100vh-300px)] p-4 font-mono text-sm',
                        'bg-neutral-50 dark:bg-neutral-950',
                        'border border-neutral-200 dark:border-neutral-800 rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                        'resize-none'
                      )}
                      placeholder="文件内容..."
                      spellCheck={false}
                    />
                  )}
                  <div className="mt-2 text-xs text-neutral-500">
                    {isMarkdown && 'Markdown File - Text Editor'}
                    {isToml && 'TOML File - Card Editor'}
                    {isBib && 'BibTeX File - Text Editor'}
                    {!isMarkdown && !isToml && !isBib && 'Text File'}
                    {' · '}
                    {content.length} characters
                    {hasChanges && ` · ${content.length - originalContent.length > 0 ? '+' : ''}${content.length - originalContent.length} changes`}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-neutral-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                <p>Select a section from the left to start editing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

