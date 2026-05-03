<script setup>
import { ref, useTemplateRef } from 'vue';
import { useScrollReveal } from '../composables/useScrollReveal';

const contributors = ref ([
  { name: "MIUMA",  img: "/images/jt.jpg", url: "https://github.com/MIU-MA" },
  { name: "TangTangChu",img:"https://avatars.githubusercontent.com/u/61231159?v=4", url: "https://github.com/TangTangChu" },
]);

useScrollReveal();
</script>

<template>
  <main class="page-container">
    <!-- 协会简介 -->
    <section class="section fade-in-on-scroll">
      <h2 class="section-title">协会简介</h2>
      <p class="section-text">
        江西财经大学<strong>数智技术协会</strong>隶属于信息管理与数学学院，
        专注于数据科学、人工智能和项目开发实践，致力于打造全校最专业的技术交流平台。
      </p>
    </section>

    <!-- 部门介绍 -->
    <section class="section fade-in-on-scroll">
      <h2 class="section-title">部门设置</h2>
      <div class="dept-grid">
        <div class="dept-card">
          <div class="dept-icon">📢</div>
          <h3>宣传部</h3>
          <p>负责社团形象的塑造与推广，制作海报和宣传物料，让更多人了解数智技术协会。</p>
        </div>
        <div class="dept-card">
          <div class="dept-icon">📋</div>
          <h3>组织部</h3>
          <p>策划并执行社团的各项精彩活动，包括讲座、分享会、比赛等，确保每场活动顺利落地。</p>
        </div>
        <div class="dept-card">
          <div class="dept-icon">💻</div>
          <h3>学习部</h3>
          <p>深入研究前沿技术，组织技术分享和培训，带领成员学习 Python、AI、Web 开发等实用技能。</p>
        </div>
      </div>
    </section>

    <section class="section fade-in-on-scroll">
         <h2 class="section-title">Contributors</h2>
          <p>
           感谢各位大佬对本网站上线的大力支持！
           如果你也想参与到网站的维护和更新中来，
           欢迎<a href="https://github.com/MIU-MA/vue3-js-jxufe-tech" style="color: blue;">查看详细</a>
          </p>
          <div class="contributor-list">
            <a v-for="contributor in contributors" :key="contributor.name" :href="contributor.url" target="_blank" :title="contributor.name">
              <img :src="contributor.img" :alt="contributor.name" class="member-photo" style="width: 80px; height: 80px; margin: 0;">
            </a>
          </div>
    </section>

  </main>
</template>

<style scoped>
.section {
  max-width: 800px;
  margin: 0 auto 60px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 58, 122, 0.06);
}

.section-title {
  font-size: 1.8em;
  color: #ff6f00;
  margin: 0 0 20px;
  text-align: center;
}

.section-text {
  font-size: 1.05em;
  color: #475569;
  line-height: 1.8;
  text-align: center;
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-top: 10px;
}

.dept-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 12px;
  background: #f8fafc;
  transition: transform 0.3s, box-shadow 0.3s;
}

.dept-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 58, 122, 0.1);
}

.dept-icon {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.dept-card h3 {
  color: #003a7a;
  margin: 0 0 10px;
  font-size: 1.2em;
}

.dept-card p {
  color: #64748b;
  font-size: 0.93em;
  line-height: 1.6;
  margin: 0;
}

.contributor-list {
  display: flex;
  justify-content: left;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.contributor-list a {
  display: inline-block;
  transition: transform 0.3s ease;
}
.contributor-list a:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .section {
    padding: 24px 20px;
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 1.4em;
  }

  .dept-grid {
    grid-template-columns: 1fr;
  }
}
</style>
