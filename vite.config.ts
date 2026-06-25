import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Base '/' suits both Vercel and the Traefik/nginx root deploy.
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Two pages: the game (index.html) and the marketing landing (herald.html).
      input: {
        main: 'index.html',
        herald: 'herald.html',
      },
    },
  },
  plugins: [
    VitePWA({
      // Keep the prototype's hand-written service worker, but let the plugin
      // inject the hashed-asset precache list into it (true offline support).
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: null, // the engine registers the SW itself (registerSW)
      manifest: false, // keep the existing public/manifest.json + its <link>
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
      },
      devOptions: { enabled: false },
    }),
  ],
});
