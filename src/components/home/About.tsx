'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface AboutProps {
    content: string;
    title?: string;
}

export default function About({ content, title = 'About' }: AboutProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">{title}</h2>
            <div className="prose prose-lg text-neutral-700 leading-relaxed">
                <ReactMarkdown
                    components={{
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                            />
                        ),
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </motion.section>
    );
}
