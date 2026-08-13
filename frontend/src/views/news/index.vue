<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArticles, type Article } from '../../api/articles'

interface NewsItem {
  id: number
  title: string
  date: string
  summary: string
}

const loading = ref(true)
const error = ref(false)
const list = ref<NewsItem[]>([])

function stripMarkdown(md: string): string {
  return md.replace(/#{1,6}\s/g, '').replace(/[*_~`>\[\]()!|-]/g, '').replace(/\n+/g, ' ').trim()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function load() {
  loading.value = true; error.value = false
  try {
    const data = await fetchArticles()
    list.value = [...data]
      .sort((a, b) => {
        const da = a.publishedAt || a.createdAt
        const db = b.publishedAt || b.createdAt
        return new Date(db).getTime() - new Date(da).getTime()
      })
      .map(item => ({
        id: item.id,
        title: item.title,
        date: formatDate(item.publishedAt || item.createdAt),
        summary: item.summary || (stripMarkdown(item.content).slice(0, 120) + (item.content.length > 120 ? '…' : ''))
      }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="min-h-[calc(100vh-60px)] transition-colors duration-300 bg-[var(--color-bg)]">
    <div class="max-w-[860px] mx-auto px-4 md:px-6 pt-16 pb-24">

      <header class="mb-10 pb-6 border-b border-b-[var(--color-border)]">
        <h1 class="font-display text-[2.1em] md:text-[2.4em] leading-tight m-0 text-[var(--color-text-heading)]">
          {{ $t('home.recentNews') }}
        </h1>
      </header>

      <p v-if="loading" class="py-16 text-center text-[var(--color-text-muted)]">{{ $t('news.loading') }}</p>

      <div v-else-if="error" class="py-16 text-center">
        <p class="mb-4 text-[var(--color-accent)]">{{ $t('news.loadError') }}</p>
        <button
          @click="load"
          class="cursor-pointer bg-transparent px-0 py-0.5 border-b border-b-[var(--color-primary)] text-[var(--color-primary)]"
        >{{ $t('news.reload') }}</button>
      </div>

      <p v-else-if="list.length === 0" class="py-16 text-center text-[var(--color-text-muted)]">暂无公告</p>

      <ul v-else class="list-none p-0 m-0">
        <li v-for="item in list" :key="item.id" class="border-b border-b-[var(--color-border)]">
          <RouterLink :to="`/news/${item.id}`" class="block py-6 no-underline hover:no-underline group">
            <div class="flex items-baseline gap-3 text-[0.85em] mb-2 text-[var(--color-text-muted)]">
              <span class="tabular-nums">{{ item.date }}</span>
                <span class="border px-1.5 py-px text-[0.72em] tracking-wider border-[var(--color-border)]">新闻</span>
                </div>
            <h2 class="font-display text-[1.35em] leading-snug m-0 mb-2 text-[var(--color-text-heading)] transition-colors group-hover:text-[var(--color-primary)]">
              {{ item.title }}
            </h2>
            <p class="m-0 text-[0.92em] leading-relaxed text-[var(--color-text-secondary)] line-clamp-2">{{ item.summary }}</p>
          </RouterLink>
        </li>
      </ul>

      <div class="mt-12">
        <RouterLink to="/" class="inline-flex items-center text-[0.95em] no-underline hover:no-underline text-[var(--color-primary)]">
          <span class="mr-2">«</span> {{ $t('news.backHome') }}
        </RouterLink>
      </div>
    </div>
  </main>
</template>
