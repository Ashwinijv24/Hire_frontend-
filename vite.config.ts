import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
      '/accounts': 'http://localhost:8000',
      '/applications': 'http://localhost:8000',
      '/jobs': 'http://localhost:8000',
      '/notifications': 'http://localhost:8000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
