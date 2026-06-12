import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Pages({
      dirs: 'src/views',
      exclude: [
        '**/admin/AdminLogin.vue',
        '**/admin/DeleteModal.vue',
        '**/admin/articles/**',
        '**/admin/images/**',
      ],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
})
