import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'

export default defineConfig(({ mode }) => {
  // Load env file based on mode - change the empty string to 'VITE_'
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    plugins: [
      react(),
      dts({
        tsconfigPath: './tsconfig.lib.json',
        rollupTypes: true,
        insertTypesEntry: true
      }),
      cssInjectedByJsPlugin(),
      // Add environment variable replacement
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || ''),
        preventAssignment: true
      })
    ],
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
        //external: ["react", "react-dom", "react/jsx-runtime", "pdfjs-dist", "jotai", "@react-hook/resize-observer", "react-toastify"], // potentially add tailwindcss this all has to be removed if building as umd and not installing react?
        external: Object.keys((pkg as any).dependencies || {}),
        // output: {
        //   globals: {
        //     'react': 'React',
        //     'react-dom': 'ReactDOM',
        //     'react/jsx-runtime': 'jsxRuntime',
        //     'pdfjs-dist': 'pdfjs',
        //     'jotai': 'jotai',
        //     '@react-hook/resize-observer': 'resizeObserver',
        //     'react-toastify': 'reactToastify',
        //   }
        // },
        // onwarn(warning, warn) {
        //   if (warning.code === 'DYNAMIC_IMPORT_ASSERTIONS') return
        //   if (warning.message.includes('dynamic import cannot be analyzed')) return
        //   warn(warning)
        // }
      },
    },
  }
})
