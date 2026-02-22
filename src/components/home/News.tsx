'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { normalizeUrl } from '@/lib/utils';

export interface NewsItem {
    date: string;
    content: string;
    link?: string;
}

interface NewsProps {
    items: NewsItem[];
    title?: string;
}

// Helper function to parse markdown-style links in content
function parseContentWithLinks(content: string) {
    const parts: (string | { text: string; href: string })[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }
        // Add the link
        parts.push({ text: match[1], href: match[2] });
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
}

export default function News({ items, title = 'News' }: NewsProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">{title}</h2>
            <div className="space-y-3">
                {items.map((item, index) => {
                    const contentParts = parseContentWithLinks(item.content);
                    return (
                        <div key={index} className="flex items-start space-x-3">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 w-16 flex-shrink-0">{item.date}</span>
                            <div className="flex-1">
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {contentParts.map((part, i) => {
                                        if (typeof part === 'string') {
                                            return <span key={i}>{part}</span>;
                                        } else {
                                            return (
                                                <Link
                                                    key={i}
                                                    href={normalizeUrl(part.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-accent hover:text-accent-dark underline focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                                                >
                                                    {part.text}
                                                </Link>
                                            );
                                        }
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.section>
    );
}
