import { ViteSSG } from 'vite-ssg'
import { createI18n } from 'vue-i18n'
import type { RouteLocationNormalized } from 'vue-router'
import App from './App.vue'
import routes from '~pages'

import zh from './i18n/locales/zh.json'
import en from './i18n/locales/en.json'
import { getInitialLocale } from './composables/useLocale'

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
  ({ app, isClient }) => {
    const i18n = createI18n({
      legacy: false,
      locale: isClient ? getInitialLocale() : 'zh',
      fallbackLocale: 'zh',
      messages: { zh, en }
    })
    app.use(i18n)
  }
)
