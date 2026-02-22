'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    GlobeAltIcon,
    CodeBracketIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CardPageConfig } from '@/types/page';
import { normalizeUrl } from '@/lib/utils';

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {(config.items && config.items.length > 0) ? (
                <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                    {config.items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className={`bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer`}
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {item.image && (
                                <div className={`${embedded ? "w-full md:w-32" : "w-full md:w-48"} flex-shrink-0 relative z-0`}>
                                    <div className="aspect-square relative rounded-lg overflow-visible dark:bg-neutral-700 group cursor-pointer">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-contain p-2 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:z-[100] group-hover:shadow-2xl rounded-lg"
                                            sizes={embedded ? "128px" : "192px"}
                                            unoptimized={item.image.endsWith('.gif')}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary`}>{item.title}</h3>
                                    {item.date && (
                                        <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                {item.subtitle && (
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                                )}
                                {item.content && (
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed mb-3`}>
                                        {item.content}
                                    </p>
                                )}
                                {(item.link || item.demo || item.code || item.paper) && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.demo && (
                                            <a
                                                href={normalizeUrl(item.demo)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                                            >
                                                <GlobeAltIcon className="h-3 w-3 mr-1.5" />
                                                Demo
                                            </a>
                                        )}
                                        {item.link && !item.demo && (
                                            <a
                                                href={normalizeUrl(item.link)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                                            >
                                                <GlobeAltIcon className="h-3 w-3 mr-1.5" />
                                                Link
                                            </a>
                                        )}
                                        {item.code && (
                                            <a
                                                href={normalizeUrl(item.code)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                                            >
                                                <CodeBracketIcon className="h-3 w-3 mr-1.5" />
                                                Code
                                            </a>
                                        )}
                                        {item.paper && (
                                            <a
                                                href={normalizeUrl(item.paper)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                                            >
                                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                Paper
                                            </a>
                                        )}
                                    </div>
                                )}
                                {item.tags && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    <p className="text-lg">No items to display.</p>
                    <p className="text-sm mt-2">Add items to the configuration file to see them here.</p>
                </div>
            )}
        </motion.div>
    );
}
