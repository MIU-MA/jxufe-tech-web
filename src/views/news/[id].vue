<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { newsData } from '../../data/newsData';

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
      parsedHtml.value = marked.parse(module.default || module);
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
  <main class="min-h-screen bg-gray-50 pt-50 pb-12 px-4 sm:px-6">

    <div v-if="article" class="article-wrapper max-w-4xl mx-auto bg-white p-8 shadow-sm rounded-2xl">
      <header class="mb-8 border-b border-gray-100 pb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ article.title }}</h1>
        <div class="flex items-center text-gray-500 text-sm">
          <i class="far fa-calendar-alt mr-2"></i>
          <span>发布日期: {{ article.date }}</span>
        </div>
      </header>

      <div v-if="article.cover" class="mb-8">
        <img :src="article.cover" :alt="article.title" class="w-full h-auto rounded-xl shadow-md mx-auto">
      </div>

      <blockquote class="border-l-4 border-blue-500 bg-blue-50 p-4 mb-8 text-gray-700 italic">
        {{ article.intro }}
      </blockquote>

      <div
          v-if="!isLoading && !loadError"
          class="prose prose-blue max-w-none prose-img:rounded-xl prose-headings:text-slate-900"
          v-html="parsedHtml"
      ></div>

      <div v-if="isLoading" class="py-20 text-center text-gray-400">正在努力加载中...</div>

      <div v-if="loadError" class="py-20 text-center">
        <p class="text-red-500 mb-4">文章加载失败，请稍后重试。</p>
        <button @click="loadArticle" class="text-blue-600 hover:text-blue-800 underline">重新加载</button>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-100">
        <RouterLink to="/" class="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span class="mr-2">«</span> 返回首页
        </RouterLink>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <h2 class="text-2xl font-semibold text-gray-600">文章不见了</h2>
      <RouterLink to="/" class="text-blue-500 mt-4 inline-block">回到首页</RouterLink>
    </div>
  </main>
</template>
