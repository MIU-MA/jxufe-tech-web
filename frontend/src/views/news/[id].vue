<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownIt from 'markdown-it';
import { fetchArticle, type Article } from '../../api/articles';

const md = new MarkdownIt();

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

onMounted(() => {
  loadArticle(route.params.id as string);
});

watch(() => route.params.id, (newId) => {
  if (newId) loadArticle(newId as string);
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-slate-900 pt-50 pb-12 px-4 sm:px-6 transition-colors">

    <!-- 加载中 -->
    <div v-if="isLoading" class="article-wrapper max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 shadow-sm rounded-2xl transition-colors">
      <div class="py-20 text-center text-gray-400">{{ $t('news.loading') }}</div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="article-wrapper max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 shadow-sm rounded-2xl transition-colors">
      <div class="py-20 text-center">
        <p class="text-red-500 mb-4">{{ $t('news.loadError') }}</p>
        <button @click="loadArticle(route.params.id as string)" class="text-blue-600 hover:text-blue-800 underline">{{ $t('news.reload') }}</button>
      </div>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="article" class="article-wrapper max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 shadow-sm rounded-2xl transition-colors">
      <header class="mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">{{ article.title }}</h1>
        <div class="flex items-center text-gray-500 dark:text-slate-400 text-sm">
          <i class="far fa-calendar-alt mr-2"></i>
          <span>{{ $t('news.publishDate') }} {{ getDate(article) }}</span>
        </div>
      </header>

      <blockquote class="border-l-4 border-blue-500 bg-blue-50 dark:bg-slate-700 dark:border-blue-400 p-4 mb-8 text-gray-700 dark:text-slate-300 italic">
        {{ getSummary(article) }}
      </blockquote>

      <div
          class="prose prose-blue dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:text-slate-900 dark:prose-headings:text-slate-100"
          v-html="parsedHtml"
      ></div>

      <div class="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700">
        <RouterLink to="/" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
          <span class="mr-2">«</span> {{ $t('news.backHome') }}
        </RouterLink>
      </div>
    </div>

    <!-- 文章不存在 -->
    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-semibold text-gray-600 dark:text-slate-400">{{ $t('news.articleMissing') }}</h2>
      <RouterLink to="/" class="text-blue-500 mt-4 inline-block">{{ $t('news.backHome2') }}</RouterLink>
    </div>
  </main>
</template>
