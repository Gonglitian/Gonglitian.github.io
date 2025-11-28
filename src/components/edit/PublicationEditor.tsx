'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { parseBibTeX } from '@/lib/bibtexParser';
import { Publication } from '@/types/publication';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bibtexParse = require('bibtex-parse-js');

interface PublicationEditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName: string;
}

// Convert publication back to BibTeX format
function publicationToBibTeX(pub: Publication, originalEntryType: string): string {
  // Determine entry type based on publication type
  const typeMapping: Record<string, string> = {
    journal: 'article',
    conference: 'inproceedings',
    workshop: 'inproceedings',
    'book-chapter': 'incollection',
    book: 'book',
    thesis: 'phdthesis',
    preprint: 'unpublished',
    patent: 'misc',
    'technical-report': 'techreport',
  };
  
  const entryType = originalEntryType || typeMapping[pub.type] || 'article';
  const citationKey = pub.id || `pub-${Date.now()}`;
  
  const fields: Array<[string, string]> = [];
  
  // Required fields
  if (pub.title) fields.push(['title', pub.title]);
  
  // Authors
  if (pub.authors && pub.authors.length > 0) {
    const authorsStr = pub.authors.map(a => {
      let name = a.name;
      if (a.isCoFirst) name += ' *';
      if (a.isCorresponding) name += ' †';
      if (a.isCoAuthor) name += ' #';
      return name;
    }).join(' and ');
    fields.push(['author', authorsStr]);
  }
  
  if (pub.year) fields.push(['year', String(pub.year)]);
  if (pub.month) fields.push(['month', pub.month]);
  
  // Type-specific fields
  if (pub.journal) fields.push(['journal', pub.journal]);
  if (pub.conference || pub.venue) {
    if (pub.type === 'journal') {
      // For journals, use journal field
      if (!pub.journal) fields.push(['journal', pub.conference || pub.venue || '']);
    } else {
      // For conferences, use booktitle
      fields.push(['booktitle', pub.conference || pub.venue || '']);
    }
  }
  if (pub.volume) fields.push(['volume', pub.volume]);
  if (pub.issue) fields.push(['number', pub.issue]);
  if (pub.pages) fields.push(['pages', pub.pages]);
  
  // Links and identifiers
  if (pub.doi) fields.push(['doi', pub.doi]);
  if (pub.arxivId) fields.push(['eprint', pub.arxivId]);
  if (pub.url) fields.push(['url', pub.url]);
  
  // Custom fields
  if (pub.code) fields.push(['code', pub.code]);
  if (pub.project) fields.push(['project', pub.project]);
  if (pub.abstract) fields.push(['abstract', pub.abstract]);
  if (pub.description) fields.push(['description', pub.description]);
  if (pub.keywords && pub.keywords.length > 0) {
    fields.push(['keywords', pub.keywords.join(', ')]);
  }
  if (pub.selected !== undefined) fields.push(['selected', pub.selected ? 'true' : 'false']);
  if (pub.preview) fields.push(['preview', pub.preview]);
  
  // Build BibTeX string
  let bibtex = `@${entryType}{${citationKey},\n`;
  fields.forEach(([key, value]) => {
    bibtex += `  ${key} = {${value}},\n`;
  });
  // Remove trailing comma and newline
  if (fields.length > 0) {
    bibtex = bibtex.slice(0, -2) + '\n';
  }
  bibtex += '}';
  
  return bibtex;
}

export default function PublicationEditor({ content, onChange }: PublicationEditorProps) {
  const [publications, setPublications] = useState<Array<Publication & { originalEntryType?: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const parsed = parseBibTeX(content);
      // Store original entry types
      const entries = bibtexParse.toJSON(content);
      const pubsWithTypes = parsed.map((pub, index) => ({
        ...pub,
        originalEntryType: entries[index]?.entryType || 'article'
      }));
      setPublications(pubsWithTypes);
      setError(null);
      // Auto-expand all publications
      pubsWithTypes.forEach(pub => {
        setExpandedPublications(prev => new Set(prev).add(pub.id));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse BibTeX');
    }
  }, [content]);

  const togglePublication = (id: string) => {
    setExpandedPublications(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updatePublication = (id: string, field: keyof Publication, value: unknown) => {
    const updated = publications.map(pub => {
      if (pub.id === id) {
        return { ...pub, [field]: value };
      }
      return pub;
    });
    setPublications(updated);
    updateBibTeX(updated);
  };

  const updateAuthor = (pubId: string, authorIndex: number, field: keyof Publication['authors'][0], value: unknown) => {
    const updated = publications.map(pub => {
      if (pub.id === pubId && pub.authors[authorIndex]) {
        const authors = [...pub.authors];
        authors[authorIndex] = { ...authors[authorIndex], [field]: value };
        return { ...pub, authors };
      }
      return pub;
    });
    setPublications(updated);
    updateBibTeX(updated);
  };

  const addAuthor = (pubId: string) => {
    const updated = publications.map(pub => {
      if (pub.id === pubId) {
        return { ...pub, authors: [...pub.authors, { name: '' }] };
      }
      return pub;
    });
    setPublications(updated);
    updateBibTeX(updated);
  };

  const removeAuthor = (pubId: string, authorIndex: number) => {
    const updated = publications.map(pub => {
      if (pub.id === pubId) {
        return { ...pub, authors: pub.authors.filter((_, i) => i !== authorIndex) };
      }
      return pub;
    });
    setPublications(updated);
    updateBibTeX(updated);
  };

  const addPublication = () => {
    const newPub: Publication & { originalEntryType?: string } = {
      id: `pub-${Date.now()}`,
      title: '',
      authors: [{ name: '' }],
      year: new Date().getFullYear(),
      type: 'journal',
      status: 'published',
      tags: [],
      keywords: [],
      researchArea: 'machine-learning',
      originalEntryType: 'article'
    };
    const updated = [...publications, newPub];
    setPublications(updated);
    setExpandedPublications(prev => new Set(prev).add(newPub.id));
    updateBibTeX(updated);
  };

  const removePublication = (id: string) => {
    const updated = publications.filter(pub => pub.id !== id);
    setPublications(updated);
    updateBibTeX(updated);
  };

  const updateBibTeX = (pubs: Array<Publication & { originalEntryType?: string }>) => {
    const bibtexEntries = pubs.map(pub => 
      publicationToBibTeX(pub, pub.originalEntryType || 'article')
    );
    onChange(bibtexEntries.join('\n\n'));
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
        <p className="font-semibold mb-2">Parse Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">
          Publications ({publications.length})
        </h3>
        <button
          onClick={addPublication}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Add Publication
        </button>
      </div>

      {publications.map((pub, index) => {
        const isExpanded = expandedPublications.has(pub.id);
        
        return (
          <div key={pub.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => togglePublication(pub.id)}
                className="flex-1 flex items-center gap-2 font-semibold text-primary py-2 -mx-2 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
                <span>
                  {pub.title || `Publication ${index + 1}`}
                  {pub.year && ` (${pub.year})`}
                </span>
              </button>
              <button
                onClick={() => removePublication(pub.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={pub.title || ''}
                        onChange={(e) => updatePublication(pub.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="Publication title"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={pub.year || ''}
                        onChange={(e) => updatePublication(pub.id, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="2024"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Month
                      </label>
                      <input
                        type="text"
                        value={pub.month || ''}
                        onChange={(e) => updatePublication(pub.id, 'month', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="jan, feb, mar, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Type
                      </label>
                      <select
                        value={pub.type || 'journal'}
                        onChange={(e) => updatePublication(pub.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                      >
                        <option value="journal">Journal</option>
                        <option value="conference">Conference</option>
                        <option value="workshop">Workshop</option>
                        <option value="book-chapter">Book Chapter</option>
                        <option value="book">Book</option>
                        <option value="thesis">Thesis</option>
                        <option value="preprint">Preprint</option>
                        <option value="patent">Patent</option>
                        <option value="technical-report">Technical Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Status
                      </label>
                      <select
                        value={pub.status || 'published'}
                        onChange={(e) => updatePublication(pub.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                      >
                        <option value="published">Published</option>
                        <option value="accepted">Accepted</option>
                        <option value="under-review">Under Review</option>
                        <option value="submitted">Submitted</option>
                        <option value="in-preparation">In Preparation</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Authors */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Authors *
                      </label>
                      <button
                        onClick={() => addAuthor(pub.id)}
                        className="flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add Author
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pub.authors.map((author, authorIndex) => (
                        <div key={authorIndex} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={author.name || ''}
                            onChange={(e) => updateAuthor(pub.id, authorIndex, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                            placeholder="Author name"
                          />
                          <div className="flex gap-1">
                            <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                              <input
                                type="checkbox"
                                checked={author.isHighlighted || false}
                                onChange={(e) => updateAuthor(pub.id, authorIndex, 'isHighlighted', e.target.checked)}
                                className="rounded"
                              />
                              Highlight
                            </label>
                            <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                              <input
                                type="checkbox"
                                checked={author.isCorresponding || false}
                                onChange={(e) => updateAuthor(pub.id, authorIndex, 'isCorresponding', e.target.checked)}
                                className="rounded"
                              />
                              Corresponding
                            </label>
                            <label className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                              <input
                                type="checkbox"
                                checked={author.isCoFirst || false}
                                onChange={(e) => updateAuthor(pub.id, authorIndex, 'isCoFirst', e.target.checked)}
                                className="rounded"
                              />
                              Co-first
                            </label>
                          </div>
                          <button
                            onClick={() => removeAuthor(pub.id, authorIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Venue Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Journal / Conference
                      </label>
                      <input
                        type="text"
                        value={pub.journal || pub.conference || pub.venue || ''}
                        onChange={(e) => {
                          if (pub.type === 'journal') {
                            updatePublication(pub.id, 'journal', e.target.value);
                          } else {
                            updatePublication(pub.id, 'conference', e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="Journal or conference name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Volume
                      </label>
                      <input
                        type="text"
                        value={pub.volume || ''}
                        onChange={(e) => updatePublication(pub.id, 'volume', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="Volume number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Issue / Number
                      </label>
                      <input
                        type="text"
                        value={pub.issue || ''}
                        onChange={(e) => updatePublication(pub.id, 'issue', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="Issue number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Pages
                      </label>
                      <input
                        type="text"
                        value={pub.pages || ''}
                        onChange={(e) => updatePublication(pub.id, 'pages', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="1-10"
                      />
                    </div>
                  </div>

                  {/* Links and Identifiers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        DOI
                      </label>
                      <input
                        type="text"
                        value={pub.doi || ''}
                        onChange={(e) => updatePublication(pub.id, 'doi', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="10.1000/xyz123"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        arXiv ID
                      </label>
                      <input
                        type="text"
                        value={pub.arxivId || ''}
                        onChange={(e) => updatePublication(pub.id, 'arxivId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="2301.12345"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        value={pub.url || ''}
                        onChange={(e) => updatePublication(pub.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        value={pub.code || ''}
                        onChange={(e) => updatePublication(pub.id, 'code', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Project
                      </label>
                      <input
                        type="text"
                        value={pub.project || ''}
                        onChange={(e) => updatePublication(pub.id, 'project', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Abstract and Description */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Abstract
                    </label>
                    <textarea
                      value={pub.abstract || ''}
                      onChange={(e) => updatePublication(pub.id, 'abstract', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 resize-y"
                      placeholder="Abstract text..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Description / Note
                    </label>
                    <textarea
                      value={pub.description || ''}
                      onChange={(e) => updatePublication(pub.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 resize-y"
                      placeholder="Additional notes..."
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={pub.keywords?.join(', ') || ''}
                      onChange={(e) => {
                        const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                        updatePublication(pub.id, 'keywords', keywords);
                      }}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  {/* Flags */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <input
                        type="checkbox"
                        checked={pub.selected || false}
                        onChange={(e) => updatePublication(pub.id, 'selected', e.target.checked)}
                        className="rounded"
                      />
                      Selected (show in featured)
                    </label>
                    {pub.preview && (
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                          Preview Image
                        </label>
                        <input
                          type="text"
                          value={pub.preview || ''}
                          onChange={(e) => updatePublication(pub.id, 'preview', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                          placeholder="/papers/image.png"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {publications.length === 0 && (
        <div className="text-center py-8 text-neutral-500 text-sm">
          No publications yet, click the &ldquo;Add Publication&rdquo; button to create the first one
        </div>
      )}
    </div>
  );
}

