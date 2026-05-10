import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Pages from 'vite-plugin-pages'
import { newsData } from './src/data/newsData'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Pages({
      dirs: 'src/views',
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  ssgOptions: {
    includedRoutes(paths) {
      const dynamicRoutes = newsData.map(item => `/news/${item.id}`)
      return paths.filter(p => !p.includes(':id')).concat(dynamicRoutes)
    }
  }
})
