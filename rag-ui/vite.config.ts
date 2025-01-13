import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'


// config to allow non-latin characters and standard fonts in pdf
// import path from 'node:path';
// import { createRequire } from 'node:module';
// import { defineConfig, normalizePath } from 'vite';
// import { viteStaticCopy } from 'vite-plugin-static-copy';
//
// const require = createRequire(import.meta.url);
// const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
// const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));
// const standardFontsDir = normalizePath(path.join(pdfjsDistPath, 'standard_fonts'));

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
    }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: cMapsDir,
    //       dest: '',
    //     },
    //   ],
    // }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: standardFontsDir,
    //       dest: '',
    //     },
    //   ],
    // })
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
      //external: ["react", "react-dom", "react/jsx-runtime", "pdfjs-dist", "jotai", "@react-hook/resize-observer", "react-toastify"], // potentially add tailwindcss this all has to be removed if building as umd and not installing react?
      external: Object.keys((pkg as any).dependencies || {}),
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
