import { ViteSSG } from 'vite-ssg'
import type { RouteLocationNormalized } from 'vue-router'
import App from './App.vue'
import routes from '~pages'

import './assets/main.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior(to: RouteLocationNormalized, _from: RouteLocationNormalized, savedPosition: any) {
      if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
      return { top: 0 }
    }
  },
  ({ app, router, isClient }) => {
  }
)
