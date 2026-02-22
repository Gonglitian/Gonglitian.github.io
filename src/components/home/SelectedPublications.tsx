'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    DocumentTextIcon,
    CodeBracketIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { normalizeUrl } from '@/lib/utils';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title = 'Selected Publications', enableOnePageMode = false }: SelectedPublicationsProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{title}</h2>
                <Link
                    href={enableOnePageMode ? "/publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    View All →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            {pub.preview && (
                                <div className="w-full sm:w-32 sm:flex-shrink-0 relative z-0">
                                    <div className="aspect-square relative rounded-lg overflow-visible dark:bg-neutral-700 group cursor-pointer">
                                        <Image
                                            src={`/papers/${pub.preview}`}
                                            alt={pub.title}
                                            fill
                                            className="object-contain p-2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:z-[100] group-hover:shadow-2xl rounded-lg"
                                            sizes="128px"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="font-semibold text-primary mb-2 leading-snug">
                                    {pub.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-1">
                                    {pub.authors.map((author, idx) => {
                                        const nameContent = author.url ? (
                                            <a
                                                href={author.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`hover:underline cursor-pointer ${author.isHighlighted ? 'font-semibold text-accent' : 'hover:text-accent transition-colors'}`}
                                            >
                                                {author.name}
                                            </a>
                                        ) : (
                                            <span className={author.isHighlighted ? 'font-semibold text-accent' : ''}>
                                                {author.name}
                                            </span>
                                        );
                                        return (
                                            <span key={idx}>
                                                {nameContent}
                                                {author.isCoFirst && (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>*</sup>
                                                )}
                                                {author.isCorresponding && (
                                                    <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>†</sup>
                                                )}
                                                {idx < pub.authors.length - 1 && ', '}
                                            </span>
                                        );
                                    })}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {(pub.journal || pub.conference || pub.venue || pub.arxivId) && pub.year && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                                            {pub.journal || pub.conference || pub.venue || 'arXiv'} {pub.year}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {pub.url && (
                                        <a
                                            href={normalizeUrl(pub.url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                            Paper
                                        </a>
                                    )}
                                    {pub.project && (
                                        <a
                                            href={normalizeUrl(pub.project)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <GlobeAltIcon className="h-3 w-3 mr-1.5" />
                                            Project
                                        </a>
                                    )}
                                    {pub.code && (
                                        <a
                                            href={normalizeUrl(pub.code)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            <CodeBracketIcon className="h-3 w-3 mr-1.5" />
                                            Code
                                        </a>
                                    )}
                                    {pub.doi && (
                                        <a
                                            href={`https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            DOI
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
