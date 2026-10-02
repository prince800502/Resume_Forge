import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        // Externalize all core-js modules
        if (id.startsWith('core-js/modules/')) return true
        return false
      },
    },
  },
  optimizeDeps: {
    exclude: ['canvg'],
    include: ['core-js'],
  },
})