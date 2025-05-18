import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Enable SPA history mode for development
    proxy: {
      // Fallback for client-side routing
      '*': {
        target: 'https://krosh.vercel.app/',
        bypass: (req) => {
          // Return the same URL to serve the HTML file for all routes
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        },
      },
    },
  },
  build: {
    // Ensure the _redirects file is copied to the build output
    // This is a backup in case vercel.json doesn't work
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    copyPublicDir: true, // This will copy the _redirects file
  },
});
