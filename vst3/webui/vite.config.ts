import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// The UI is compiled into the plug-in (cmake/EmbedFiles.cmake) and served from memory, so it is one small set of
// files with relative paths: one script, one style sheet, no lazy chunks.
export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    minify: true,
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app[extname]'
      }
    }
  },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts']
  }
})
