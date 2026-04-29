import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const clientRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(clientRoot, '..')

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
})
