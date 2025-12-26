import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { cloudflare } from '@cloudflare/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [cloudflare(), nodePolyfills(), react()],
  resolve: {
    alias: {
      '@': '/src',
      buffer: 'buffer',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
