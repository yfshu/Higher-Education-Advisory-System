import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improve development stability
  onDemandEntries: {
    // Keep pages in memory longer to avoid rebuild issues
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Webpack configuration to prevent chunk errors
  webpack: (config, { isServer, dev, webpack }) => {
    // Improve chunk resolution in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        // More stable chunk splitting
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              reuseExistingChunk: true,
              enforce: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: -25,
              reuseExistingChunk: true,
            },
          },
        },
      };
      
      // Fix chunk filename to prevent loading errors
      if (!isServer) {
        config.output = {
          ...config.output,
          chunkFilename: 'static/chunks/[name]-[contenthash].js',
          filename: 'static/chunks/[name]-[contenthash].js',
        };
      }
      
      // Improve module resolution
      config.resolve = {
        ...config.resolve,
        symlinks: false,
      };

      // Better handling of dynamic imports
      config.plugins = [
        ...config.plugins,
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
        }),
      ];
    }
    return config;
  },

  // Disable experimental features that can cause cache issues
  experimental: {
    // Only enable stable features
  },
};

export default nextConfig;
