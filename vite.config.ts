import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const REPO_NAME = 'jti_contact'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          xlsx: ['xlsx'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
  publicDir: 'public',
}))
