import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improve development stability
  onDemandEntries: {
    // Keep pages in memory longer to avoid rebuild issues
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Transpile packages that use CommonJS and need to work in Edge Runtime
  // Note: These packages will be transpiled to ESM for Edge Runtime compatibility
  transpilePackages: [
    'libphonenumber-js',
    'react-phone-number-input',
    '@supabase/supabase-js', // Required for middleware Edge Runtime compatibility
    '@supabase/ssr', // Ensure SSR package is also transpiled
    'cookie', // Dependency of @supabase/ssr, may be CommonJS
  ],

  // Explicitly use webpack (Next.js 16 defaults to Turbopack)
  // This ensures our custom webpack config works
  webpack: (config, { isServer, dev, webpack, nextRuntime }) => {
    // For Edge Runtime (middleware), ensure CommonJS is properly handled
    // In Next.js 16, middleware runs in Edge Runtime which doesn't support CommonJS
    const isMiddleware = nextRuntime === 'edge' || 
      (config.entry && typeof config.entry === 'object' && 'middleware' in config.entry) ||
      (config.name && config.name.includes('middleware'));
    
    if (isMiddleware && isServer) {
      // Disable chunk splitting for middleware to avoid CommonJS issues
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        minimize: false, // Disable minification to avoid CommonJS issues
      };
      
      // Ensure all CommonJS modules are properly handled
      config.output = {
        ...config.output,
        module: true, // Output ESM format for Edge Runtime
      };
    }
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

    // Fix for CommonJS/ESM compatibility in Edge Runtime (middleware)
    // Ensure middleware bundles are properly handled
    if (isServer) {
      // For server-side bundles (including middleware), ensure CommonJS is handled
      config.resolve = {
        ...config.resolve,
        extensionAlias: {
          '.js': ['.js', '.ts', '.tsx'],
        },
      };
      
      // For middleware specifically, add fallbacks for Node.js modules
      if (isMiddleware) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          // Don't polyfill Node.js modules in Edge Runtime
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        };
      }
    }

    return config;
  },

  // Externalize packages that shouldn't be bundled in Server Components
  // Note: Don't include packages that are in transpilePackages (they conflict)
  serverExternalPackages: [
    // Add packages here that should be externalized (not bundled)
    // Exclude libphonenumber-js and react-phone-number-input as they're in transpilePackages
  ],

  // Next.js 16 defaults to Turbopack, but we're using webpack
  // Adding empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
