export interface Article {
  id: number
  title: string
  content: string
  summary: string | null
  publishedAt: string | null
  createdAt: string
}

const ORIGIN = import.meta.env.SSR
  ? (import.meta.env.VITE_SSG_API_BASE as string) || ''
  : ''
const BASE = import.meta.env.SSR ? `${ORIGIN}/api` : '/api'

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${BASE}/articles`)
  if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`)
  return res.json()
}

export async function fetchArticle(id: string | number): Promise<Article> {
  const res = await fetch(`${BASE}/articles/${id}`)
  if (!res.ok) throw new Error(`获取文章失败: ${res.status}`)
  return res.json()
}
