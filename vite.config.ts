import { defineConfig } from 'vite';

// Base '/' suits both Vercel and the Traefik/nginx root deploy.
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
