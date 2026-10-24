import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url === '/api.js' || req.url.startsWith('/api.js?') || req.url.startsWith('/api.jsx')) {
            return req.url;
          }
        }
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      }
    }
  }
});
