<script setup lang="ts">
import EditorialPage from '../../components/EditorialPage.vue'

import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Calendar } from 'lucide-vue-next'
import { renderWikiMarkdown } from '../../utils/wikiMarkdown'
import { fetchArticle, type Article } from '../../api/articles'

const route = useRoute()
const article = ref<Article | null>(null)
const parsedHtml = ref('')
const isLoading = ref(true)
const loadError = ref(false)

function stripPlainText(mdText: string): string {
  return mdText
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`>\[\]()!|-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

function getSummary(article: Article): string {
  if (article.summary) return article.summary
  return stripPlainText(article.content).slice(0, 200) + (article.content.length > 200 ? '…' : '')
}

function getDate(article: Article): string {
  const d = article.publishedAt || article.createdAt
  return new Date(d).toLocaleDateString('zh-CN')
}

async function loadArticle(id: string) {
  isLoading.value = true
  loadError.value = false
  try {
    article.value = await fetchArticle(id)
    const document = renderWikiMarkdown(article.value.content, `news-${article.value.id}`)
    parsedHtml.value = document.html
  } catch {
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

await loadArticle(route.params.id as string)

watch(
  () => route.params.id,
  (newId) => {
    if (newId) loadArticle(newId as string)
  },
)
</script>

<template>
  <EditorialPage
    :title="
      isLoading || loadError ? $t('site.newsTitle') : article?.title || $t('news.articleMissing')
    "
    eyebrow="JOURNAL / ARTICLE"
  >
    <template v-if="article && !isLoading && !loadError" #meta
      ><div class="ed-meta">
        <Calendar :size="14" aria-hidden="true" /><span
          >{{ $t('news.publishDate') }} {{ getDate(article) }}</span
        ><span>·</span><RouterLink to="/news">{{ $t('site.newsTitle') }}</RouterLink>
      </div></template
    >
    <p v-if="isLoading" class="ed-empty" role="status">{{ $t('news.loading') }}</p>
    <div v-else-if="loadError" class="ed-empty">
      <p>{{ $t('news.loadError') }}</p>
      <button type="button" class="ed-button" @click="loadArticle(route.params.id as string)">
        {{ $t('news.reload') }}
      </button>
    </div>
    <template v-else-if="article"
      ><div class="ed-abstract">
        <span>{{ $t('site.summary') }}</span
        >{{ getSummary(article) }}
      </div>
      <div class="ed-prose prose dark:prose-invert max-w-none" v-html="parsedHtml"></div>
      <div class="ed-bottom-links">
        <RouterLink to="/news" class="ed-link">← {{ $t('site.backToNews') }}</RouterLink
        ><RouterLink to="/" class="ed-link">{{ $t('news.backHome') }} →</RouterLink>
      </div></template
    >
    <div v-else class="ed-empty">
      <p>{{ $t('news.articleMissing') }}</p>
      <RouterLink to="/" class="ed-link">{{ $t('news.backHome2') }}</RouterLink>
    </div>
  </EditorialPage>
</template>
