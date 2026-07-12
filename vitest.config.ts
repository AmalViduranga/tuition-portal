import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    alias: {
      '@': path.resolve(__dirname, './')
    },
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['tests/e2e/**/*', 'node_modules', '.next'],
  },
})
