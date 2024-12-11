import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.lib.json',
      rollupTypes: true,
      insertTypesEntry: true
    }),
    cssInjectedByJsPlugin(),
    process.env.NODE_ENV === 'production' && replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    })
  ],
  build: {
    copyPublicDir: false,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'], // add umd if we want to export web components!
      name: 'rag-ui',
      fileName: (format) => `rag-ui.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"], // potentially add tailwindcss this all has to be removed if building as umd and not installing react?
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    },
  },
})
