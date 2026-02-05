import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'

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
  base: "",
  build: {
    copyPublicDir: false,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'], // add umd if we want to export web components!
      name: 'lexio',
      fileName: (format) => `lexio.${format}.js`
    },
    rollupOptions: {
      // Externalize deps and peerDeps so the host app supplies React (avoids "useMemo F.current is null" from duplicate React).
      external: [
        ...Object.keys((pkg as any).dependencies || {}),
        ...Object.keys((pkg as any).peerDependencies || {}),
        'react/jsx-runtime',
      ],
      // output: {
        // globals: {
        //   'react': 'React',
        //   'react-dom': 'ReactDOM',
        //   'react/jsx-runtime': 'jsxRuntime',
        //   'pdfjs-dist': 'pdfjs',
        //   'jotai': 'jotai',
        //   '@react-hook/resize-observer': 'resizeObserver',
        //   'react-toastify': 'reactToastify',
        // }
      // },
      // onwarn(warning, warn) {
      //   if (warning.code === 'DYNAMIC_IMPORT_ASSERTIONS') return
      //   if (warning.message.includes('dynamic import cannot be analyzed')) return
      //   warn(warning)
      // }
    },
  },
})
