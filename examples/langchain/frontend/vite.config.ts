import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
      __API_BASE_URL__: JSON.stringify('http://localhost:8000'), // Change this for different environments
  },
  plugins: [react()],
})
