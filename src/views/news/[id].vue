<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownIt from 'markdown-it';
import { newsData } from '../../data/newsData';

const md = new MarkdownIt();

const route = useRoute();
const newsId = route.params.id;

const article = computed(() => newsData.find(item => item.id === newsId));

const parsedHtml = ref('');
const isLoading = ref(true);
const loadError = ref(false);

const markdownModules = import.meta.glob('../../articles/*.md', { query: '?raw', eager: true });

async function loadArticle() {
  if (!article.value) {
    isLoading.value = false;
    return;
  }

  try {
    const key = `../../articles/${newsId}.md`;
    const module = markdownModules[key];

    if (module) {
      const raw = (module as { default?: string }).default ?? (module as string);
      parsedHtml.value = md.render(raw);
    } else {
      loadError.value = true;
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
}

loadArticle();
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-slate-900 pt-50 pb-12 px-4 sm:px-6 transition-colors">

    <div v-if="article" class="article-wrapper max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 shadow-sm rounded-2xl transition-colors">
      <header class="mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">{{ article.title }}</h1>
        <div class="flex items-center text-gray-500 dark:text-slate-400 text-sm">
          <i class="far fa-calendar-alt mr-2"></i>
          <span>{{ $t('news.publishDate') }} {{ article.date }}</span>
        </div>
      </header>

      <div v-if="article.cover" class="mb-8">
        <img :src="article.cover" :alt="article.title" class="w-full h-auto rounded-xl shadow-md mx-auto">
      </div>

      <blockquote class="border-l-4 border-blue-500 bg-blue-50 dark:bg-slate-700 dark:border-blue-400 p-4 mb-8 text-gray-700 dark:text-slate-300 italic">
        {{ article.intro }}
      </blockquote>

      <div
          v-if="!isLoading && !loadError"
          class="prose prose-blue dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:text-slate-900 dark:prose-headings:text-slate-100"
          v-html="parsedHtml"
      ></div>

      <div v-if="isLoading" class="py-20 text-center text-gray-400">{{ $t('news.loading') }}</div>

      <div v-if="loadError" class="py-20 text-center">
        <p class="text-red-500 mb-4">{{ $t('news.loadError') }}</p>
        <button @click="loadArticle" class="text-blue-600 hover:text-blue-800 underline">{{ $t('news.reload') }}</button>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700">
        <RouterLink to="/" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
          <span class="mr-2">«</span> {{ $t('news.backHome') }}
        </RouterLink>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-semibold text-gray-600 dark:text-slate-400">{{ $t('news.articleMissing') }}</h2>
      <RouterLink to="/" class="text-blue-500 mt-4 inline-block">{{ $t('news.backHome2') }}</RouterLink>
    </div>
  </main>
</template>
