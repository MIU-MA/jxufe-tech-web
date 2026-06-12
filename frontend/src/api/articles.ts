export interface Article {
  id: number
  title: string
  content: string
  summary: string | null
  publishedAt: string | null
  createdAt: string
}

const BASE = import.meta.env.SSR ? 'http://localhost:3003' : ''

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${BASE}/api/articles`)
  if (!res.ok) throw new Error(`获取文章列表失败: ${res.status}`)
  return res.json()
}

export async function fetchArticle(id: string | number): Promise<Article> {
  const res = await fetch(`${BASE}/api/articles/${id}`)
  if (!res.ok) throw new Error(`获取文章失败: ${res.status}`)
  return res.json()
}
