<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import CodeCard from '../components/CodeCard.vue';
import BackgroundIcons from '../components/BackgroundIcons.vue';
import { useScrollReveal } from '../composables/useScrollReveal';
import { newsData } from '../data/newsData';

const newsList = computed(() =>
  [...newsData]
    .sort((a, b) => {
      const parse = (d: { date: string }) => d.date.match(/\d+/g)!.map(Number);
      const [ay, am, ad] = parse(a);
      const [by, bm, bd] = parse(b);
      return by - ay || bm - am || bd - ad;
    })
    .map(item => ({
      ...item,
      summary: item.intro,
      link: `/news/${item.id}`
    }))
);

const floatingCodes = [
  { title: 'style.css', content: `.dsa-box {\n  display: grid;\n  gap: 2rem;\n  backdrop-filter: blur(10px);\n  animation: pulse 2s;\n}`, style: { top: '5%', left: '2%', animationDelay: '0s' } },
  { title: 'index.html', content: `<section id=\"about\">\n  <div class=\"glass-card\">\n    <h1>数智技术</h1>\n    <p>AI与数据的结合<\/p>\n  </div>\n<\/section>`, style: { bottom: '10%', left: '5%', animationDelay: '2s' } },
  { title: 'main.js', content: `export function initAI() {\n  console.log('AI Engine ready...');\n  return new NeuralNetwork();\n}`, style: { top: '15%', right: '2%', animationDelay: '4s' } },
  { title: 'data.py', content: `import pandas as pd\n\ndf = pd.read_csv('jxufe.csv')\nprint(df.groupby('dept').mean())\n# 数据驱动决策`, style: { bottom: '5%', right: '8%', animationDelay: '1s' } },
  { title: 'query.sql', content: `SELECT name, role FROM members\nWHERE status = 'active'\nORDER BY contribution DESC;\n-- 检索核心成员`, style: { top: '45%', left: '10%', animationDelay: '3s' } },
  { title: 'algo.cpp', content: `void dfs(int u) {\n  vis[u] = true;\n  for(int v : adj[u])\n    if(!vis[v]) dfs(v);\n}\n// 算法探索`, style: { bottom: '40%', right: '5%', animationDelay: '5s' } }
];

useScrollReveal();

onMounted(() => {
  const typeWriter = (elementId: string, text: string, speed: number) => {
    let i = 0;
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = '';
    function type() {
      if (!element) return;
      if (i < text.length) { element.textContent += text.charAt(i); i++; setTimeout(type, speed); }
      else { element.style.borderRight = 'none'; }
    }
    element.style.borderRight = '0.15em solid #ff6f00'; element.style.animation = 'blink-caret .75s step-end infinite'; type();
  };
  if (document.getElementById('typing-text-1')) {
    typeWriter('typing-text-1', "江西财经大学", 100);
    setTimeout(() => {
      const el1 = document.getElementById('typing-text-1');
      if (el1) el1.style.borderRight = 'none';
      typeWriter('typing-text-2', "数智技术协会", 100);
    }, "江西财经大学".length * 100 + 500);
  }
});
console.log('MIUMA');
</script>

<template>
  <div>
    <nav class="side-nav">
      <a href="#hero" class="nav-dot" title="首页"></a>
      <a href="#about-us-hero" class="nav-dot" title="关于我们"></a>
      <a href="#news-hero" class="nav-dot" title="最新动态"></a>
    </nav>

    <section id="hero">
        <BackgroundIcons />

        <div class="z-index-content">
            <img src="/logo.jpg" alt="Logo" class="hero-logo-large">
            <h1 class="hero-title">
                <span id="typing-text-1" class="hero-line-1"></span>
                <span id="typing-text-2" class="hero-line-2"></span>
            </h1>
            <p class="hero-subtitle">探索人工智能的奥秘，从这里开始你的技术之旅。</p>
        </div>
        <a href="#about-us-hero" class="scroll-down z-index-content">&#8659;</a>
    </section>

    <main class="page-container">

      <section id="about-us-hero">
          <BackgroundIcons />

          <div class="floating-code-container pc-only">
             <div v-for="(item, index) in floatingCodes" :key="index" class="floating-card-wrapper" :style="item.style">
                <CodeCard :title="item.title" :code="item.content" />
             </div>
          </div>

          <div class="about-us-card fade-in-on-scroll">
              <h2>关于我们</h2>
              <h3>江西财经大学信息管理与数学学院</h3>
              <p><strong>数智技术协会</strong>专注于数据科学、人工智能和项目开发实践。</p>
              <ul>
                  <li><strong>宣传部</strong> 负责社团形象的塑造与推广。</li>
                  <li><strong>组织部</strong> 策划并执行社团的各项精彩活动。</li>
                  <li><strong>学习部</strong> 深入研究前沿技术并组织技术分享。</li>
              </ul>
              <RouterLink to="/details" class="join-link">更多»</RouterLink>
          </div>
      </section>

      <section id="news-hero">
          <BackgroundIcons />
          <div class="news-hero-content fade-in-on-scroll">
              <h2>近期动态</h2>
              <div class="news-grid">
                  <div v-for="news in newsList" :key="news.id" class="news-card">
                      <div class="news-card-inner">
                          <div class="news-card-front">
                              <div class="card-content">
                                  <h3>{{ news.title }}</h3>
                                  <p class="news-date">{{ news.date }}</p>
                              </div>
                          </div>
                          <div class="news-card-back">
                              <h4>活动详情</h4>
                              <p>{{ news.summary }}</p>
                              <a :href="news.link">了解详情 &rarr;</a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ==================== 1. 布局结构 ==================== */
#hero, #about-us-hero, #news-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

#hero {
    height: calc(100vh - 60px);
    background: var(--hero-gradient);
    background-size: 400% 400%;
    animation: gradientFlow 15s ease infinite;
}

#about-us-hero { min-height: 80vh; background-color: var(--color-bg-alt); padding: 60px 20px; transition: background-color 0.3s ease; }
#news-hero { min-height: 80vh; background-color: var(--color-bg); padding: 80px 20px; transition: background-color 0.3s ease; }

/* ==================== 2. 核心内容层级与居中 ==================== */
.z-index-content {
    position: relative; z-index: 5; width: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
}
.about-us-card, .news-hero-content { position: relative; z-index: 5; }

/* ==================== 3. 悬浮装饰 (代码卡片) ==================== */
.floating-code-container {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 4;
}
.floating-card-wrapper {
    position: absolute; pointer-events: auto; opacity: 0.7; transform: scale(0.65);
    animation: floatCard 8s ease-in-out infinite; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); transition: all 0.5s ease;
}
.floating-card-wrapper:hover {
    opacity: 1; transform: scale(1) !important; z-index: 20; filter: drop-shadow(0 20px 40px rgba(0, 58, 122, 0.4));
}
@keyframes floatCard {
    0%, 100% { transform: scale(0.65) translate(0, 0); }
    33% { transform: scale(0.65) translate(15px, -25px); }
    66% { transform: scale(0.65) translate(-10px, 15px); }
}

/* ==================== 4. 具体组件样式 ==================== */
/* Logo & Title */
.hero-logo-large {
    width: 180px; height: 180px; border-radius: 50%; object-fit: cover; margin-bottom: 25px;
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.5), 0 10px 20px rgba(0,0,0,0.1); display: block;
}
.hero-title {
    display: flex; flex-direction: column; align-items: center; margin: 10px 0 15px 0; color: var(--color-text-heading); font-weight: 700;
}
.hero-line-1 { font-size: 2.5em; margin-bottom: 5px; letter-spacing: 0.05em; }
.hero-line-2 { font-size: 1.8em; color: var(--color-text-heading); letter-spacing: 0.1em; }
.hero-subtitle { font-size: 1.2em; margin-bottom: 40px; color: var(--color-accent); font-weight: 500; }

/* About Card */
.about-us-card {
    max-width: 800px; background-color: var(--color-bg-card);
    border-radius: 20px; padding: 50px; box-shadow: 0 10px 40px var(--color-shadow);
    transition: background-color 0.3s ease;
}
.about-us-card h2, .about-us-card h3, .join-link { text-align: center; }
.about-us-card h2 { font-size: 2.2em; color: var(--color-accent); margin-bottom: 20px; }
.about-us-card h3 { font-size: 1.5em; color: var(--color-text-heading); margin-bottom: 15px; }
.join-link { display: block; margin: 20px auto 0; color: var(--color-accent); font-weight: bold; }

/* News Card */
.news-hero-content  h2 { font-size: 2em; color: var(--color-text-heading); margin-bottom: 40px;text-align: center; }
.news-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; }
.news-card { width: 300px; height: 260px; perspective: 1000px; background: transparent; margin: 0 auto; }
.news-card-inner {
    position: relative; width: 100%; height: 100%; text-align: center;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d;
}
.news-card:hover .news-card-inner { transform: rotateY(180deg); }
.news-card-front, .news-card-back {
    position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 15px; box-shadow: 0 5px 15px var(--color-shadow-card);
}
.news-card-front { background-color: var(--color-bg-card); display: flex; align-items: center; justify-content: center; transition: background-color 0.3s ease; }
.news-card-back {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: white;
    transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 25px;
}
.news-card-back a {
    margin-top: 15px; padding: 8px 20px; border: 2px solid #fff; border-radius: 25px; color: white; font-weight: bold; transition: 0.3s;
}
.news-card-back a:hover { background: #fff; color: #003a7a; }

/* Common & Nav */
.scroll-down {
    position: absolute; bottom: 30px; font-size: 2em; animation: bounce 2s infinite; color: var(--color-text-heading); cursor: pointer; z-index: 10;
}
.side-nav {
    position: fixed; right: 30px; top: 50%; transform: translateY(-50%); z-index: 100; display: flex; flex-direction: column; gap: 20px;
}
.nav-dot {
    width: 12px; height: 12px; border-radius: 50%; background-color: var(--color-border); transition: all 0.3s ease; border: 2px solid transparent; position: relative;
}
.nav-dot:hover { background-color: var(--color-accent); transform: scale(1.3); box-shadow: 0 0 10px rgba(255, 111, 0, 0.5); }
.nav-dot:hover::before { content: attr(title); position: absolute; right: 25px; top: 50%; transform: translateY(-50%); background: var(--color-primary); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; }

/* 动画定义 */
@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }
@keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

/* 响应式 */
.pc-only { display: none; }
@media (min-width: 1024px) {
    .pc-only { display: block; }
    .hero-line-1 { font-size: 3em; }
    .hero-logo-large { width: 250px; height: 250px; }
}
@media (max-width: 1400px) {
    .floating-card-wrapper:nth-child(5), .floating-card-wrapper:nth-child(6) { display: none; }
}
</style>
