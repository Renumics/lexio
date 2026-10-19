import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['lib/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['lib/**/*.{ts,tsx}'],
      exclude: ['lib/**/*.test.{ts,tsx}', 'lib/**/*.d.ts']
    }
  },
});
