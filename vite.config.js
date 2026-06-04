
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  envDir: '.',
  plugins: [react()],
  resolve: {
    dedupe: ['three'],
  },
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
