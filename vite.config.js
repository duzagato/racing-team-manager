import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src/renderer',
  plugins: [
    electron([
      {
        // Main process
        entry: path.resolve(__dirname, 'src/main/main.js'),
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist/main'),
            emptyOutDir: true,
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'fs', 'path']
            }
          }
        }
      },
      {
        // Preload script
        entry: path.resolve(__dirname, 'src/preload/preload.js'),
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist/preload'),
            emptyOutDir: true,
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                entryFileNames: 'preload.cjs'
              }
            }
          }
        }
      }
    ]),
    renderer()
  ],
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
