import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: {
            manualChunks: {
              // Split heavy vendor deps into their own chunks
              'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
              'vendor-google': ['@google/genai'],
              // Split the codex data (large static dataset)
              'codex-data': ['./data/codexTable1.ts'],
            }
          }
        }
      }
    };
});
