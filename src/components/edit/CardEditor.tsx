'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Github, Linkedin, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';
import { parse } from 'smol-toml';

interface CardEditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName: string;
}

// Custom ORCID icon component
const OrcidIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
  </svg>
);

// Custom ResearchGate icon component
const ResearchGateIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.34 13.13c-.83 0-1.53-.64-1.53-1.43s.7-1.43 1.53-1.43 1.53.64 1.53 1.43-.7 1.43-1.53 1.43zm-5.15-3.29c-1.1 0-2.01-.86-2.01-1.92 0-1.06.91-1.92 2.01-1.92s2.01.86 2.01 1.92c0 1.06-.91 1.92-2.01 1.92zm8.49-3.7c0-.72-.59-1.3-1.32-1.3-.73 0-1.32.58-1.32 1.3 0 .72.59 1.3 1.32 1.3.73 0 1.32-.58 1.32-1.3zm-5.7 0c0-.72-.59-1.3-1.32-1.3-.73 0-1.32.58-1.32 1.3 0 .72.59 1.3 1.32 1.3.73 0 1.32-.58 1.32-1.3zm-5.7 0c0-.72-.59-1.3-1.32-1.3-.73 0-1.32.58-1.32 1.3 0 .72.59 1.3 1.32 1.3.73 0 1.32-.58 1.32-1.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

// Helper function to capitalize first letter
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get icon for social field
const getSocialIcon = (fieldName: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconMap: Record<string, React.ComponentType<any>> = {
    email: EnvelopeIcon,
    location: MapPinIcon,
    location_url: MapPinIcon,
    location_details: MapPinIcon,
    website: GlobeAltIcon,
    google_scholar: AcademicCapIcon,
    orcid: OrcidIcon,
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube,
    instagram: Instagram,
    facebook: Facebook,
    researchgate: ResearchGateIcon,
  };
  return iconMap[fieldName] || null;
};

type TomlValue = string | number | boolean | string[] | TomlObject | null;
type TomlObject = { [key: string]: TomlValue };
type TomlData = TomlObject;

export default function CardEditor({ content, onChange, fileName }: CardEditorProps) {
  const [data, setData] = useState<TomlData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const parsed = parse(content) as TomlData;
      setData(parsed);
      setError(null);
      // Auto-expand all array sections
      Object.keys(parsed).forEach(key => {
        if (Array.isArray(parsed[key])) {
          setExpandedSections(prev => new Set(prev).add(key));
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse TOML');
    }
  }, [content]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updateValue = (path: string[], value: TomlValue) => {
    if (!data) return;
    
    const newData = { ...data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setData(newData);
    onChange(serializeToml(newData));
  };

  const addArrayItem = (arrayKey: string, template: Record<string, unknown> = {}) => {
    if (!data || !Array.isArray(data[arrayKey])) return;
    
    const newData = { ...data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const array = [...(newData[arrayKey] as any[])];
    array.push({ ...template });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newData[arrayKey] = array as any;
    setData(newData);
    onChange(serializeToml(newData));
  };

  const removeArrayItem = (arrayKey: string, index: number) => {
    if (!data || !Array.isArray(data[arrayKey])) return;
    
    const newData = { ...data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const array = [...(newData[arrayKey] as any[])];
    array.splice(index, 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newData[arrayKey] = array as any;
    setData(newData);
    onChange(serializeToml(newData));
  };

  const updateArrayItem = (arrayKey: string, index: number, field: string, value: string) => {
    if (!data || !Array.isArray(data[arrayKey])) return;
    
    const newData = { ...data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const array = [...(newData[arrayKey] as any[])];
    array[index] = { ...array[index], [field]: value };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newData[arrayKey] = array as any;
    setData(newData);
    onChange(serializeToml(newData));
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
        <p className="font-semibold mb-2">Parse Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8 text-neutral-500">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Simple key-value pairs */}
      {Object.entries(data).map(([key, value]) => {
        // Skip array sections - they're handled separately
        if (Array.isArray(value)) return null;
        
        // Hide title, type, description for card files (awards, services, projects, cv)
        // Also hide type and title for about.toml
        // Hide navigation and features for config.toml (both simple values and objects)
        const isCardFile = fileName.includes('awards') || fileName.includes('services') || 
                          fileName.includes('project') || fileName.includes('cv.toml');
        const isAboutFile = fileName.includes('about.toml');
        const isConfigFile = fileName.toLowerCase().includes('config.toml') || fileName === 'config.toml';
        const hiddenFields = ['title', 'type', 'description'];
        const configHiddenFields = ['navigation', 'features'];
        
        // Hide navigation and features for config.toml (check before processing object, case-insensitive)
        if (isConfigFile && configHiddenFields.includes(key.toLowerCase())) return null;
        
        if ((isCardFile || isAboutFile) && hiddenFields.includes(key)) return null;
        
        // Skip object sections - they're handled separately
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Double check: Hide navigation and features sections entirely for config.toml (case-insensitive)
          if (isConfigFile && configHiddenFields.includes(key.toLowerCase())) return null;
          
          return (
            <div key={key} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between mb-2 font-semibold text-primary py-2 -mx-2 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <span>{capitalize(key.replace(/_/g, ' '))}</span>
                {expandedSections.has(key) ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
              {expandedSections.has(key) && (
                <div className="space-y-3 mt-3">
                  {Object.entries(value as TomlObject).map(([subKey, subValue]) => {
                    
                    const Icon = key === 'social' ? getSocialIcon(subKey) : null;
                    
                    return (
                      <div key={subKey}>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          {capitalize(subKey.replace(/_/g, ' '))}
                        </label>
                        {Array.isArray(subValue) ? (
                          <div className="space-y-2">
                            {subValue.map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newArray = [...subValue];
                                    newArray[idx] = e.target.value;
                                    updateValue([key, subKey], newArray);
                                  }}
                                  className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                                />
                                <button
                                  onClick={() => {
                                    const newArray = subValue.filter((_, i) => i !== idx);
                                    updateValue([key, subKey], newArray);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => updateValue([key, subKey], [...subValue, ''])}
                              className="flex items-center gap-1 text-sm text-accent hover:underline"
                            >
                              <PlusIcon className="h-4 w-4" />
                              Add Item
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={String(subValue ?? '')}
                            onChange={(e) => updateValue([key, subKey], e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // Simple string/number/boolean values
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {capitalize(key.replace(/_/g, ' '))}
            </label>
            <input
              type="text"
              value={String(value ?? '')}
              onChange={(e) => updateValue([key], e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
            />
          </div>
        );
      })}

      {/* Array sections */}
      {Object.entries(data).map(([key, value]) => {
        if (!Array.isArray(value)) return null;

        // Hide navigation and features arrays for config.toml
        const isConfigFile = fileName.toLowerCase().includes('config.toml') || fileName === 'config.toml';
        const configHiddenArrays = ['navigation', 'features'];
        if (isConfigFile && configHiddenArrays.includes(key.toLowerCase())) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arrayItems = value as any[];
        const isExpanded = expandedSections.has(key);

        // Determine fields based on all items (union of all keys)
        const fieldsSet = new Set<string>();
        arrayItems.forEach(item => {
          Object.keys(item).forEach(key => fieldsSet.add(key));
        });
        
        // Define field order for common types
        const getFieldOrder = (arrayKey: string): string[] => {
          if (arrayKey === 'news') {
            return ['date', 'content'];
          } else if (arrayKey === 'items') {
            return ['title', 'subtitle', 'date', 'content', 'link', 'code', 'demo', 'paper', 'image', 'tags'];
          } else if (arrayKey === 'sections') {
            return ['id', 'type', 'title', 'source', 'filter', 'limit'];
          }
          return [];
        };
        
        const orderedFields = getFieldOrder(key);
        const fields = orderedFields.filter(f => fieldsSet.has(f))
          .concat(Array.from(fieldsSet).filter(f => !orderedFields.includes(f)));
        
        // For empty arrays, use default fields
        if (fields.length === 0) {
          if (key === 'news') {
            fields.push('date', 'content');
          } else if (key === 'items') {
            fields.push('title', 'subtitle', 'date', 'content');
          } else if (key === 'sections') {
            fields.push('id', 'type', 'title', 'source');
          }
        }
        const template = fields.reduce((acc, field) => ({ ...acc, [field]: '' }), {});

        return (
          <div key={key} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => toggleSection(key)}
                className="flex-1 flex items-center gap-2 font-semibold text-primary py-2 -mx-2 px-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
                <span>{capitalize(key.replace(/_/g, ' '))} ({arrayItems.length})</span>
              </button>
              {isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addArrayItem(key, template);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90 text-sm ml-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add
                </button>
              )}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {arrayItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Item {index + 1}
                        </span>
                        <button
                          onClick={() => removeArrayItem(key, index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fields.map((field) => {
                          const isLongText = field === 'content' || field === 'description' || field === 'abstract';
                          const fieldValue = String(item[field] ?? '');
                          
                          return (
                            <div key={field} className={isLongText ? 'md:col-span-2' : ''}>
                              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                                {capitalize(field.replace(/_/g, ' '))}
                              </label>
                              {isLongText ? (
                                <textarea
                                  value={fieldValue}
                                  onChange={(e) => updateArrayItem(key, index, field, e.target.value)}
                                  rows={4}
                                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 resize-y"
                                  placeholder={field}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={fieldValue}
                                  onChange={(e) => updateArrayItem(key, index, field, e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900"
                                  placeholder={field}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                  {arrayItems.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 text-sm">
                      暂无项目，点击&ldquo;添加&rdquo;按钮创建第一个项目
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// TOML serializer
function serializeToml(data: TomlData): string {
  const lines: string[] = [];
  
  const escapeString = (str: string): string => {
    if (str.includes('\n') || str.includes('"') || str.includes('\\')) {
      // Use triple quotes for multi-line strings
      return `"""${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"""`;
    }
    // Simple string
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  };
  
  const serializeValue = (value: TomlValue): string => {
    if (value === null || value === undefined) return '""';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      return escapeString(value);
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      // Check if array of strings
      if (value.every(v => typeof v === 'string')) {
        return `[${value.map(v => escapeString(v as string)).join(', ')}]`;
      }
      // Array of other types
      return `[${value.map(v => serializeValue(v)).join(', ')}]`;
    }
    return String(value);
  };

  // Separate simple key-values, tables, and array of tables
  const simpleKeys: Array<[string, TomlValue]> = [];
  const tables: Array<[string, TomlObject]> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arrayTables: Array<[string, any[]]> = [];

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      arrayTables.push([key, value]);
    } else if (typeof value === 'object' && value !== null) {
      tables.push([key, value as TomlObject]);
    } else {
      simpleKeys.push([key, value]);
    }
  });

  // Write simple key-values first
  simpleKeys.forEach(([key, value]) => {
    lines.push(`${key} = ${serializeValue(value)}`);
  });

  if (simpleKeys.length > 0 && (tables.length > 0 || arrayTables.length > 0)) {
    lines.push('');
  }

  // Write tables
  tables.forEach(([key, value], index) => {
    lines.push(`[${key}]`);
    Object.entries(value).forEach(([subKey, subValue]) => {
      lines.push(`${subKey} = ${serializeValue(subValue)}`);
    });
    if (index < tables.length - 1 || arrayTables.length > 0) {
      lines.push('');
    }
  });

  // Write array of tables
  arrayTables.forEach(([key, items], arrIndex) => {
    items.forEach((item, itemIndex) => {
      lines.push(`[[${key}]]`);
      Object.entries(item).forEach(([itemKey, itemValue]) => {
        lines.push(`${itemKey} = ${serializeValue(itemValue as TomlValue)}`);
      });
      // Add blank line between items, but not after the last item of the last array
      if (itemIndex < items.length - 1 || arrIndex < arrayTables.length - 1) {
        lines.push('');
      }
    });
    if (arrIndex < arrayTables.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\n');
}

