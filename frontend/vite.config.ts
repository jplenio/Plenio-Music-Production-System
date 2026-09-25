import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// ComfyUI imports every *.js file below web/ as an extension module, so only the
// entry is emitted as .js; lazily loaded chunks use .mjs and are fetched on demand.
// The ComfyUI app shim stays external: from /extensions/<pack>/js/plenio.js the
// relative path ../../../scripts/app.js resolves to /scripts/app.js.
const COMFY_APP = '../../../scripts/app.js'
const COMFY_API = '../../../scripts/api.js'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  build: {
    outDir: fileURLToPath(new URL('../web/js', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
    minify: true,
    sourcemap: false,
    lib: {
      entry: fileURLToPath(new URL('./src/extension/main.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'plenio.js'
    },
    rollupOptions: {
      external: [COMFY_APP, COMFY_API],
      output: {
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts']
  }
})
