import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@pochak/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@pochak/domain-types': path.resolve(__dirname, '../../packages/domain-types/src'),
    },
  },
})
