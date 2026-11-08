import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every path relative, so dist/ works on any host or sub-folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: { input: { main: 'index.html', register: 'register.html' } },
  },
});
