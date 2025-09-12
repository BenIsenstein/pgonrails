import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), UnoCSS(), tsconfigPaths()],
  // base: '/site',
  server: {
    host: process.env.VITE_HOST || '::',              // Accept connections from all interfaces
    port: parseInt(process.env.VITE_PORT || '5173'),  // Look for VITE_PORT in startup environment
    strictPort: true,                                 // Fail if port is taken
    watch: {
      usePolling: true                                // Helps with Docker volume file sync
    }
  }
})
