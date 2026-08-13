<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useScrollReveal } from '../composables/useScrollReveal';
import { fetchArticles, type Article } from '../api/articles';

interface NewsItem {
  id: number
  title: string
  date: string
  summary: string
  link: string
}

const articles = ref<Article[]>([])
const newsLoading = ref(true)
const newsError = ref(false)

function stripMarkdown(md: string): string {
  return md.replace(/#{1,6}\s/g, '').replace(/[*_~`>\[\]()!|-]/g, '').replace(/\n+/g, ' ').trim()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadNews() {
  newsLoading.value = true; newsError.value = false
  try { articles.value = await fetchArticles() } catch { newsError.value = true } finally { newsLoading.value = false }
}

const newsList = computed<NewsItem[]>(() =>
  [...articles.value]
    .sort((a, b) => {
      const da = a.publishedAt || a.createdAt
      const db = b.publishedAt || b.createdAt
      return new Date(db).getTime() - new Date(da).getTime()
    })
    .map(item => ({
      id: item.id, title: item.title, date: formatDate(item.publishedAt || item.createdAt),
      summary: item.summary || (stripMarkdown(item.content).slice(0, 100) + (item.content.length > 100 ? '…' : '')),
      link: `/news/${item.id}`
    }))
)

const recentNews = computed(() => newsList.value.slice(0, 3))
const latestNewsId = computed(() => newsList.value[0]?.id)

useScrollReveal()

onMounted(() => {
  loadNews()
})
</script>

<template>
  <div>
    <section class="transition-colors duration-300 bg-[color:var(--color-bg-alt)] border-b border-b-[var(--color-border)] bg-[image:linear-gradient(to_right,rgba(16,52,95,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,52,95,0.05)_1px,transparent_1px)] bg-[size:44px_44px]">
      <div class="max-w-[1160px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <img src="/logo.jpg" alt="数智技术协会会徽" class="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mx-auto mb-7">
        <h1 class="font-display leading-tight m-0 text-[var(--color-text-heading)]">
          <span class="block text-[2em] md:text-[2.6em] tracking-[0.04em]">{{ $t('home.title1') }}</span>
          <span class="block text-[1.3em] md:text-[1.7em] mt-2 tracking-[0.12em]">{{ $t('home.title2') }}</span>
        </h1>
        <p class="mt-6 mb-0 text-[1.02em] text-[var(--color-text-secondary)]">{{ $t('home.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-[1160px] mx-auto px-4 md:px-6 py-12 md:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-14">

        <div class="min-w-0">

          <section id="news" class="mb-12 bg-[var(--color-bg-dark)]">
            <div class="p-6 md:p-8">
              <div class="flex items-baseline justify-between gap-4 mb-6">
                <h2 class="font-display text-[1.4em] m-0 text-[var(--color-text-dark)]">
                  {{ $t('home.recentNews') }}
                </h2>
                <RouterLink
                  v-if="latestNewsId"
                  to="/news"
                  class="text-[0.9em] no-underline hover:no-underline transition-colors text-[var(--color-text-dark-muted)]"
                >全部新闻</RouterLink>
              </div>

              <p v-if="newsLoading" class="py-4 m-0 text-[0.92em] text-[var(--color-text-dark-muted)]">加载中…</p>
              <p v-else-if="newsError" class="py-4 m-0 text-[0.92em] text-[var(--color-text-dark-muted)]">暂无法加载公告</p>
              <p v-else-if="recentNews.length === 0" class="py-4 m-0 text-[0.92em] text-[var(--color-text-dark-muted)]">暂无公告</p>

              <ul v-else class="list-none p-0 m-0">
                <li v-for="news in recentNews" :key="news.id" class="border-t border-t-[var(--color-line-dark)]">
                  <RouterLink :to="news.link" class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 md:py-4 no-underline hover:no-underline transition-colors">
                    <span class="shrink-0 text-[0.85em] tabular-nums text-[var(--color-text-dark-muted)]">{{ news.date }}</span>
                    <span class="flex-1 min-w-0 truncate text-[1em] text-[var(--color-text-dark)]">{{ news.title }}</span>
                    <span class="text-[0.85em] text-[var(--color-text-dark-muted)]">→</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </section>

          <section class="fade-in-on-scroll bg-[var(--color-bg-alt)]">
            <div class="p-6 md:p-8">
              <div class="grid md:grid-cols-[1fr_1.6fr] gap-x-10 gap-y-6">
                <div>
                  <div class="font-display text-[2em] leading-none text-[var(--color-primary)]">01</div>
                  <div class="mt-3 w-10 border-t-2 border-t-[var(--color-primary)]"></div>
                  <div class="mt-3 text-[0.8em] tracking-[0.08em] uppercase text-[var(--color-text-muted)]">About Us</div>
                  <h3 class="font-display text-[1.5em] mt-5 mb-0 text-[var(--color-text-heading)]">{{ $t('home.aboutUs') }}</h3>
                </div>
                <div>
                  <p class="mt-0 mb-4 leading-relaxed text-[var(--color-text-secondary)]">
                    {{ $t('details.aboutIntro') }}
                  </p>
                  <p class="mb-0 leading-relaxed text-[var(--color-text-secondary)]">
                    {{ $t('footer.tagline1') }}{{ $t('footer.tagline2') }}
                  </p>
                  <RouterLink to="/details" class="inline-block mt-5 font-medium no-underline hover:no-underline transition-colors text-[var(--color-primary)]">
                    {{ $t('home.more') }}
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="min-w-0 fade-in-on-scroll">

          <div class="mb-12">
            <h2 class="font-display text-[1.25em] m-0 pb-3 text-[var(--color-text-heading)] border-b border-b-[var(--color-border)]">
              {{ $t('details.departmentSetup') }}
            </h2>
            <ul class="list-none p-0 m-0">
              <li v-for="(dept, i) in [
                { name: $t('details.publicDept'), desc: $t('details.publicDeptDesc') },
                { name: $t('details.orgDept'), desc: $t('details.orgDeptDesc') },
                { name: $t('details.studyDept'), desc: $t('details.studyDeptDesc') },
              ]" :key="i" class="border-t border-t-[var(--color-border-light)]">
                <RouterLink to="/details" class="flex items-center gap-4 py-3.5 no-underline hover:no-underline transition-colors">
                  <span class="font-display w-7 shrink-0 text-[0.95em] text-[var(--color-text-muted)]">0{{ i + 1 }}</span>
                  <span class="flex-1 min-w-0">
                    <span class="block text-[0.95em] text-[var(--color-text)]">{{ dept.name }}</span>
                    <span class="block text-[0.8em] truncate text-[var(--color-text-muted)]">{{ dept.desc }}</span>
                  </span>
                  <span class="shrink-0 text-[0.85em] text-[var(--color-text-muted)]">→</span>
                </RouterLink>
              </li>
            </ul>
          </div>

          <RouterLink to="/welcome" class="block no-underline hover:no-underline p-6 transition-colors bg-[var(--color-bg-dark)]">
            <span class="block font-display text-[1.2em] text-[var(--color-text-dark)]">{{ $t('nav.joinUs') }}</span>
            <span class="block mt-2 text-[0.88em] leading-relaxed text-[var(--color-text-dark-muted)]">{{ $t('welcome.text2') }}</span>
          </RouterLink>
        </aside>
      </div>
    </div>
  </div>
</template>
