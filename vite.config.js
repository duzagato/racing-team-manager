import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process
        entry: 'src/main/main.js',
        vite: {
          build: {
            outDir: 'dist/main',
            lib: {
              entry: 'src/main/main.js',
              formats: ['es'],
              fileName: () => 'main.js'
            },
            rollupOptions: {
              external: ['electron', 'better-sqlite3']
            }
          }
        }
      },
      {
        // Preload script
        entry: 'src/preload/preload.js',
        vite: {
          build: {
            outDir: 'dist/preload',
            lib: {
              entry: 'src/preload/preload.js',
              formats: ['cjs'],
              fileName: () => 'preload.js'
            },
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/index.html')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: ''
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
