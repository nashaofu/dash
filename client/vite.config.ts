import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

const ROOT_DIR = fileURLToPath(dirname(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': join(ROOT_DIR, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:8080',
      '/files': 'http://127.0.0.1:8080'
    }
  },
  plugins: [react(), legacy()]
})
