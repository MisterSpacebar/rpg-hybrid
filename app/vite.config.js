import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The rulebooks live outside app/, so the dev server must be allowed to read the repo root.
export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
})
