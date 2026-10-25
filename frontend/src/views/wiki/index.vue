<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRight, Search } from 'lucide-vue-next'
import { filterWikiArticles, type WikiArticle } from '../../utils/wikiArticles'

const { t, tm, locale } = useI18n()
const query = ref('')
const category = ref('')
function resetFilters() {
  query.value = ''
  category.value = ''
}
watch(locale, () => { category.value = '' })
const articles = computed(() => tm('knowledge.articles') as WikiArticle[])
const categories = computed(() => [...new Set([
  ...(tm('knowledge.categoryNames') as string[]),
  ...articles.value.map(article => article.category),
])])
const visible = computed(() => filterWikiArticles(articles.value, query.value, category.value))
const filtering = computed(() => !!query.value.trim() || !!category.value)
</script>

<template>
  <main class="mx-auto min-h-[60vh] w-full max-w-[1160px] px-4 pt-6 pb-16 md:px-6 md:pt-8">
    <nav class="mb-7 flex items-center gap-2 text-xs text-text-muted" :aria-label="t('knowledge.breadcrumb')">
      <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
      <ChevronRight :size="12" aria-hidden="true" />
      <span aria-current="page">{{ t('knowledge.title') }}</span>
    </nav>
    <header class="border-b border-border pb-6">
      <h1 class="m-0 font-display text-[28px] font-semibold text-text-heading">{{ t('knowledge.title') }}</h1>
      <p class="mt-2 mb-0 text-sm text-text-secondary">{{ t('knowledge.description') }}</p>
    </header>
    <section class="pt-6" :aria-label="t('knowledge.browse')">
      <form class="flex max-w-xl items-center gap-3 rounded border border-border px-3 py-2.5 text-text-muted focus-within:border-primary" role="search" @submit.prevent>
        <Search :size="17" class="shrink-0" aria-hidden="true" />
        <input v-model="query" type="search" class="min-w-0 flex-1 border-0 bg-transparent text-sm text-text outline-none!" :aria-label="t('knowledge.search')" :placeholder="t('knowledge.search')" />
      </form>
      <div class="mt-6 flex flex-wrap gap-x-6 border-b border-border-light text-[13px]" :aria-label="t('knowledge.categories')">
        <button type="button" class="cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-0 py-3 text-text-secondary aria-pressed:border-primary aria-pressed:text-primary hover:text-primary" :aria-pressed="category === ''" @click="category = ''">{{ t('knowledge.all') }}</button>
        <button v-for="item in categories" :key="item" type="button" class="cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-0 py-3 text-text-secondary aria-pressed:border-primary aria-pressed:text-primary hover:text-primary" :aria-pressed="category === item" @click="category = item">{{ item }}</button>
      </div>
      <ul v-if="visible.length" class="m-0 list-none divide-y divide-border-light p-0">
        <li v-for="article in visible" :key="article.slug">
          <RouterLink :to="`/wiki/${article.slug}`" class="group block py-5 no-underline hover:no-underline">
            <span class="text-xs text-text-muted">{{ article.category }}</span>
            <h2 class="mt-1 mb-2 text-lg font-medium text-text-heading group-hover:text-primary">{{ article.title }}</h2>
            <p class="m-0 text-sm leading-relaxed text-text-secondary">{{ article.summary }}</p>
          </RouterLink>
        </li>
      </ul>
      <div v-else class="py-12 text-sm text-text-muted" role="status">
        <p class="m-0">{{ t(filtering ? 'knowledge.empty' : 'knowledge.noArticles') }}</p>
        <button v-if="filtering" type="button" class="mt-3 cursor-pointer border-0 bg-transparent p-0 text-primary hover:underline" @click="resetFilters">{{ t('knowledge.reset') }}</button>
      </div>
    </section>
  </main>
</template>
