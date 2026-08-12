import { ViteSSG } from 'vite-ssg'
import { createI18n } from 'vue-i18n'
import type { RouteLocationNormalized } from 'vue-router'
import App from './App.vue'
import routes from '~pages'

import zh from './i18n/locales/zh.json'
import en from './i18n/locales/en.json'
import { getInitialLocale } from './composables/useLocale'
import { fetchArticles } from './api/articles'

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

export async function includedRoutes(paths: string[], routes: any[]): Promise<string[]> {
  const staticPaths = paths.filter((p) => !p.includes(':'))

  const base = import.meta.env.VITE_SSG_API_BASE as string | undefined
  if (!base) {
    console.warn('[SSG] 未配置 VITE_SSG_API_BASE，新闻详情页不会预渲染（客户端运行时抓取）')
    return staticPaths
  }

  let articles: { id: number }[] = []
  try {
    articles = await fetchArticles()
  } catch (err) {
    console.error('[SSG] 抓取文章列表失败，终止构建', err)
    throw err
  }

  return staticPaths.concat(articles.map((a) => `/news/${a.id}`))
}
