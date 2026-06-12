<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import CodeCard from '../components/CodeCard.vue';
import BackgroundIcons from '../components/BackgroundIcons.vue';
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

const floatingCodes = [
  { title: 'style.css',  content: `.dsa-box {\n  display: grid;\n  gap: 2rem;\n  backdrop-filter: blur(10px);\n  animation: pulse 2s;\n}`, style: { top: '5%',  left: '2%',  animationDelay: '0s' } },
  { title: 'index.html', content: `<section id=\"about\">\n  <div class=\"glass-card\">\n    <h1>数智技术</h1>\n    <p>AI与数据的结合<\/p>\n  </div>\n<\/section>`, style: { bottom: '10%', left: '5%',  animationDelay: '2s' } },
  { title: 'main.js',    content: `export function initAI() {\n  console.log('AI Engine ready...');\n  return new NeuralNetwork();\n}`, style: { top: '15%', right: '2%',  animationDelay: '4s' } },
  { title: 'data.py',    content: `import pandas as pd\n\ndf = pd.read_csv('jxufe.csv')\nprint(df.groupby('dept').mean())\n# 数据驱动决策`, style: { bottom: '5%',  right: '8%',  animationDelay: '1s' } },
  { title: 'query.sql',  content: `SELECT name, role FROM members\nWHERE status = 'active'\nORDER BY contribution DESC;\n-- 检索核心成员`, style: { top: '45%', left: '10%', animationDelay: '3s' } },
  { title: 'algo.cpp',   content: `void dfs(int u) {\n  vis[u] = true;\n  for(int v : adj[u])\n    if(!vis[v]) dfs(v);\n}\n// 算法探索`, style: { bottom: '40%', right: '5%',  animationDelay: '5s' } },
]

useScrollReveal()

onMounted(() => {
  loadNews()
  const typeWriter = (elementId: string, text: string, speed: number) => {
    let i = 0
    const el = document.getElementById(elementId)
    if (!el) return
    el.textContent = ''
    function type() {
      if (!el) return
      if (i < text.length) { el.textContent += text.charAt(i); i++; setTimeout(type, speed) }
      else { el.style.borderRight = 'none' }
    }
    el.style.borderRight = '0.15em solid #ff6f00'; el.style.animation = 'blink-caret .75s step-end infinite'; type()
  }
  if (document.getElementById('typing-text-1')) {
    typeWriter('typing-text-1', "江西财经大学", 100)
    setTimeout(() => {
      const el1 = document.getElementById('typing-text-1')
      if (el1) el1.style.borderRight = 'none'
      typeWriter('typing-text-2', "数智技术协会", 100)
    }, "江西财经大学".length * 100 + 500)
  }
})
console.log('MIUMA')
</script>

<template>
  <div>
    <!-- 侧边导航点 -->
    <nav class="fixed right-[30px] top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-5">
      <a href="#hero" class="nav-dot" :title="$t('nav.home')"></a>
      <a href="#about-us-hero" class="nav-dot" :title="$t('home.aboutUs')"></a>
      <a href="#news-hero" class="nav-dot" :title="$t('home.recentNews')"></a>
    </nav>

    <!-- ===== Hero ===== -->
    <section
      id="hero"
      class="relative flex flex-col justify-center items-center w-full box-border h-[calc(100vh-60px)] bg-[length:400%_400%]"
      :style="{ background: 'var(--hero-gradient)', animation: 'gradientFlow 15s ease infinite' }"
    >
      <BackgroundIcons />

      <div class="relative z-[5] w-full flex flex-col items-center justify-center text-center">
        <img
          src="/logo.jpg" alt="Logo"
          class="block w-[180px] h-[180px] lg:w-[250px] lg:h-[250px] rounded-full object-cover mb-[25px] shadow-[0_0_0_10px_rgba(255,255,255,0.5),0_10px_20px_rgba(0,0,0,0.1)]"
        >
        <h1 class="flex flex-col items-center my-2.5 font-bold" :style="{ color: 'var(--color-text-heading)' }">
          <span id="typing-text-1" class="hero-line text-[2.5em] lg:text-[3em] mb-[5px] tracking-[0.05em]"></span>
          <span id="typing-text-2" class="hero-line text-[1.8em] tracking-[0.1em]" :style="{ color: 'var(--color-text-heading)' }"></span>
        </h1>
        <p class="text-[1.2em] mb-10 font-medium" :style="{ color: 'var(--color-accent)' }">{{ $t('home.subtitle') }}</p>
      </div>

      <a href="#about-us-hero" class="absolute bottom-[30px] text-[2em] z-10 cursor-pointer" :style="{ color: 'var(--color-text-heading)', animation: 'bounce 2s infinite' }">&#8659;</a>
    </section>

    <!-- ===== Main Content ===== -->
    <main class="max-w-6xl mx-auto px-5 pt-20 pb-10 min-h-[calc(100vh-350px)]">

      <!-- ===== About Us ===== -->
      <section
        id="about-us-hero"
        class="relative flex flex-col justify-center items-center w-full box-border min-h-[80vh] py-[60px] px-5 transition-colors duration-300"
        :style="{ backgroundColor: 'var(--color-bg-alt)' }"
      >
        <BackgroundIcons />

        <!-- 浮动代码卡片 -->
        <div class="floating-code-container hidden lg:block absolute inset-0 pointer-events-none z-[4]">
          <div
            v-for="(item, index) in floatingCodes"
            :key="index"
            class="floating-card-wrapper absolute pointer-events-auto"
            :style="{
              ...item.style,
              animation: 'floatCard 8s ease-in-out infinite',
              opacity: 0.7,
              transform: 'scale(0.65)',
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
            }"
            :class="{ 'hidden 2xl:block': index >= 4 }"
          >
            <CodeCard :title="item.title" :code="item.content" />
          </div>
        </div>

        <div class="fade-in-on-scroll relative z-[5] max-w-[800px] rounded-[20px] p-[50px] shadow-md transition-colors duration-300" :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 10px 40px var(--color-shadow)' }">
          <h2 class="text-center text-[2.2em] mb-5" :style="{ color: 'var(--color-accent)' }">{{ $t('home.aboutUs') }}</h2>
          <h3 class="text-center text-[1.5em] mb-4" :style="{ color: 'var(--color-text-heading)' }">{{ $t('home.aboutCollege') }}</h3>
          <p><strong>{{ $t('footer.brandName') }}</strong>{{ $t('home.aboutDesc') }}</p>
          <ul>
            <li><strong>{{ $t('home.dept1Name') }}</strong> {{ $t('home.dept1Desc') }}</li>
            <li><strong>{{ $t('home.dept2Name') }}</strong> {{ $t('home.dept2Desc') }}</li>
            <li><strong>{{ $t('home.dept3Name') }}</strong> {{ $t('home.dept3Desc') }}</li>
          </ul>
          <RouterLink to="/details" class="block text-center mt-5 font-bold" :style="{ color: 'var(--color-accent)' }">{{ $t('home.more') }}</RouterLink>
        </div>
      </section>

      <!-- ===== News ===== -->
      <section
        id="news-hero"
        class="relative flex flex-col justify-center items-center w-full box-border min-h-[80vh] py-20 px-5 transition-colors duration-300"
        :style="{ backgroundColor: 'var(--color-bg)' }"
      >
        <BackgroundIcons />
        <div class="fade-in-on-scroll relative z-[5]">
          <h2 class="text-center text-[2em] mb-10" :style="{ color: 'var(--color-text-heading)' }">{{ $t('home.recentNews') }}</h2>

          <p v-if="newsLoading" class="text-center py-10" :style="{ color: 'var(--color-text-muted)' }">加载中…</p>
          <p v-else-if="newsError" class="text-center py-10" :style="{ color: 'var(--color-text-muted)' }">暂无法加载新闻</p>
          <p v-else-if="newsList.length === 0" class="text-center py-10" :style="{ color: 'var(--color-text-muted)' }">暂无新闻</p>

          <div v-else class="flex flex-wrap justify-center gap-[30px] mt-5">
            <div v-for="news in newsList" :key="news.id" class="news-card w-[300px] h-[260px] mx-auto bg-transparent">
              <div class="news-card-inner relative w-full h-full text-center">
                <!-- 卡片正面 -->
                <div
                  class="news-card-front absolute inset-0 rounded-[15px] flex items-center justify-center transition-colors duration-300"
                  :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 5px 15px var(--color-shadow-card)' }"
                >
                  <div>
                    <h3 class="text-lg font-bold" :style="{ color: 'var(--color-text-heading)' }">{{ news.title }}</h3>
                    <p class="text-sm mt-2">{{ news.date }}</p>
                  </div>
                </div>
                <!-- 卡片背面 -->
                <div
                  class="news-card-back absolute inset-0 rounded-[15px] text-white flex flex-col justify-center items-center p-[25px]"
                  :style="{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', boxShadow: '0 5px 15px var(--color-shadow-card)' }"
                >
                  <h4 class="text-lg font-bold mb-3">{{ $t('home.eventDetails') }}</h4>
                  <p class="text-sm mb-3">{{ news.summary }}</p>
                  <a :href="news.link" class="news-card-link mt-4 py-2 px-5 border-2 border-white rounded-[25px] text-white font-bold transition-all duration-300 hover:bg-white hover:text-[#003a7a]">
                    {{ $t('home.viewDetails') }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
/* ===== 3D 翻转新闻卡片 ===== */
.news-card { perspective: 1000px; }
.news-card-inner {
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.news-card:hover .news-card-inner { transform: rotateY(180deg); }
.news-card-front,
.news-card-back { backface-visibility: hidden; }
.news-card-back { transform: rotateY(180deg); }

/* ===== 浮动代码卡片 ===== */
.floating-card-wrapper { transition: all 0.5s ease; }
.floating-card-wrapper:hover {
  opacity: 1 !important;
  transform: scale(1) !important;
  z-index: 20;
  filter: drop-shadow(0 20px 40px rgba(0, 58, 122, 0.4));
}

/* ===== 侧边导航点 ===== */
.nav-dot {
  display: block;
  width: 12px; height: 12px;
  border-radius: 50%;
  background-color: var(--color-border);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}
.nav-dot:hover {
  background-color: var(--color-accent);
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(255, 111, 0, 0.5);
}
.nav-dot:hover::before {
  content: attr(title);
  position: absolute; right: 25px; top: 50%;
  transform: translateY(-50%);
  background: var(--color-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
</style>
