import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to prevent ENOENT cache errors
  // Use stable Webpack for development
  
  // Improve development stability
  onDemandEntries: {
    // Keep pages in memory longer to avoid rebuild issues
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Disable experimental features that can cause cache issues
  experimental: {
    // Only enable stable features
  },
};

export default nextConfig;
