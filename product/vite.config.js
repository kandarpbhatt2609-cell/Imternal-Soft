import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'https://six-sem-project.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})