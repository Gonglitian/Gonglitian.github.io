import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export in production builds
  // In development, we need API routes for the edit functionality
  ...(process.env.NODE_ENV === 'production' && { 
    output: 'export',
  }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.bib$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
