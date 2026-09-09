import { inject, onMounted, ref, type InjectionKey } from 'vue'
import { fetchArticles, type Article } from '../api/articles'

interface ArticleInitialState {
  articles?: Article[]
}

export const articleInitialStateKey: InjectionKey<ArticleInitialState> = Symbol('article-initial-state')

export function useArticles() {
  const initialState = inject(articleInitialStateKey, {})
  const articles = ref<Article[]>(initialState.articles ?? [])
  const loading = ref(initialState.articles === undefined)
  const error = ref(false)

  async function load(background = false) {
    if (!background) loading.value = true
    error.value = false
    try {
      articles.value = await fetchArticles()
    } catch {
      if (!background) error.value = true
    } finally {
      loading.value = false
    }
  }

  // 用构建数据完成 hydration，再后台更新，避免首屏退回“加载中”。
  onMounted(() => { void load(initialState.articles !== undefined) })

  return { articles, loading, error, load: () => load() }
}
