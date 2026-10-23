<script setup lang="ts">
import EditorialPage from '../../components/EditorialPage.vue'

import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticles } from '../../composables/useArticles'
import { formatArticleDate as formatDate } from '../../utils/dateTime'

interface NewsItem {
  id: number
  title: string
  date: string
  summary: string
}

const { articles, loading, error, load } = useArticles()

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`>\[\]()!|-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

const list = computed<NewsItem[]>(() =>
  [...articles.value]
    .sort((a, b) => {
      const da = a.publishedAt || a.createdAt
      const db = b.publishedAt || b.createdAt
      return new Date(db).getTime() - new Date(da).getTime()
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: formatDate(item.publishedAt || item.createdAt),
      summary:
        item.summary ||
        stripMarkdown(item.content).slice(0, 120) + (item.content.length > 120 ? '…' : ''),
    })),
)
</script>

<template>
  <EditorialPage
    :title="$t('site.newsTitle')"
    eyebrow="JOURNAL / NEWS"
    :description="$t('site.newsDesc')"
  >
    <section class="ed-section" aria-labelledby="news-archive">
      <div class="ed-section-title">
        <span>01</span>
        <h2 id="news-archive">{{ $t('site.allNews') }}</h2>
      </div>
      <p v-if="loading" class="ed-empty" role="status">{{ $t('news.loading') }}</p>
      <div v-else-if="error" class="ed-empty">
        <p>{{ $t('news.loadError') }}</p>
        <button type="button" class="ed-button" @click="load">{{ $t('news.reload') }}</button>
      </div>
      <p v-else-if="!list.length" class="ed-empty">{{ $t('site.noNews') }}</p>
      <ul v-else class="ed-news-list">
        <li v-for="item in list" :key="item.id">
          <RouterLink :to="`/news/${item.id}`" class="ed-news-link"
            ><time>{{ item.date }}</time>
            <div>
              <h2>{{ item.title }}</h2>
              <p>{{ item.summary }}</p>
            </div>
            <span aria-hidden="true">↗</span></RouterLink
          >
        </li>
      </ul>
    </section>
    <div class="ed-bottom-links">
      <RouterLink to="/" class="ed-link">← {{ $t('news.backHome') }}</RouterLink>
    </div>
  </EditorialPage>
</template>
