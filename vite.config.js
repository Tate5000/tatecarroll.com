import { resolve } from 'path';
import { defineConfig } from 'vite';

// Multi-page build so the professional "/serious" page is emitted
// alongside the main experience.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        serious: resolve(__dirname, 'serious.html'),
      },
    },
  },
});
