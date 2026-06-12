export interface Article {
  id: number
  title: string
  content: string
  summary: string | null
  publishedAt: string | null
  createdAt: string
}

const BASE = '/api'

export async function fetchArticles(): Promise<Article[]> {
  // SSR 构建时不发起请求，返回空数组 → 客户端 hydration 后重新拉取
  if (import.meta.env.SSR) return []
  const res = await fetch(`${BASE}/articles`)
  if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`)
  return res.json()
}

export async function fetchArticle(id: string | number): Promise<Article> {
  if (import.meta.env.SSR) throw new Error('SSR 不支持获取单篇文章')
  const res = await fetch(`${BASE}/articles/${id}`)
  if (!res.ok) throw new Error(`获取文章失败: ${res.status}`)
  return res.json()
}
