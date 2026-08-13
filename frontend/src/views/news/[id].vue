<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Calendar } from 'lucide-vue-next';
import { createSafeMarkdown } from '../../utils/markdown';
import { fetchArticle, type Article } from '../../api/articles';

const md = createSafeMarkdown();

const route = useRoute();
const article = ref<Article | null>(null);
const parsedHtml = ref('');
const isLoading = ref(true);
const loadError = ref(false);

function stripPlainText(mdText: string): string {
  return mdText
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~`>\[\]()!|-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function getSummary(article: Article): string {
  if (article.summary) return article.summary;
  return stripPlainText(article.content).slice(0, 200) + (article.content.length > 200 ? '…' : '');
}

function getDate(article: Article): string {
  const d = article.publishedAt || article.createdAt;
  return new Date(d).toLocaleDateString('zh-CN');
}

async function loadArticle(id: string) {
  isLoading.value = true;
  loadError.value = false;
  try {
    article.value = await fetchArticle(id);
    parsedHtml.value = md.render(article.value.content);
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
}

await loadArticle(route.params.id as string);

watch(() => route.params.id, (newId) => {
  if (newId) loadArticle(newId as string);
});
</script>

<template>
  <main class="min-h-[calc(100vh-60px)] transition-colors duration-300 bg-[var(--color-bg)]">

    <div v-if="isLoading" class="max-w-[760px] mx-auto px-4 md:px-6 py-28 text-center text-[var(--color-text-muted)]">
      {{ $t('news.loading') }}
    </div>

    <div v-else-if="loadError" class="max-w-[760px] mx-auto px-4 md:px-6 py-28 text-center">
      <p class="mb-4 text-[var(--color-accent)]">{{ $t('news.loadError') }}</p>
      <button
        @click="loadArticle(route.params.id as string)"
        class="cursor-pointer bg-transparent px-0 py-0.5 border-b border-b-[var(--color-primary)] text-[var(--color-primary)]"
      >{{ $t('news.reload') }}</button>
    </div>

    <article v-else-if="article" class="max-w-[760px] mx-auto px-4 md:px-6 pt-16 pb-24">
      <header class="mb-10 pb-8 border-b border-b-[var(--color-border)]">
        <h1 class="font-display text-[1.9em] md:text-[2.4em] leading-snug mb-5 m-0 text-[var(--color-text-heading)]">
          {{ article.title }}
        </h1>
        <div class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Calendar :size="15" />
          <span>{{ $t('news.publishDate') }} {{ getDate(article) }}</span>
        </div>
      </header>

      <blockquote
        class="border-l-[3px] border-l-[var(--color-accent)] px-6 py-4 mb-10 m-0 leading-relaxed bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
      >
        {{ getSummary(article) }}
      </blockquote>

      <div
        class="prose prose-sm dark:prose-invert max-w-none prose-img:rounded-md prose-headings:font-display"
        :class="[
          '[--tw-prose-body:var(--color-text)]',
          '[--tw-prose-headings:var(--color-text-heading)]',
          '[--tw-prose-links:var(--color-primary)]',
          '[--tw-prose-bold:var(--color-text)]',
          '[--tw-prose-quotes:var(--color-text-secondary)]',
          '[--tw-prose-code:var(--color-text)]',
          '[--tw-prose-bullets:var(--color-text-muted)]',
        ]"
        v-html="parsedHtml"
      ></div>

      <div class="mt-14 pt-6 border-t border-t-[var(--color-border)]">
        <RouterLink to="/" class="inline-flex items-center text-[0.95em] no-underline hover:no-underline text-[var(--color-primary)]">
          <span class="mr-2">«</span> {{ $t('news.backHome') }}
        </RouterLink>
      </div>
    </article>

    <div v-else class="max-w-[760px] mx-auto px-4 md:px-6 py-28 text-center">
      <h2 class="text-xl mb-4 text-[var(--color-text-secondary)]">{{ $t('news.articleMissing') }}</h2>
      <RouterLink to="/" class="no-underline hover:no-underline text-[var(--color-primary)]">{{ $t('news.backHome2') }}</RouterLink>
    </div>
  </main>
</template>
