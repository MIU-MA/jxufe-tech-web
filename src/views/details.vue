<script setup lang="ts">
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
      <h2 class="section-title">{{ $t('details.aboutAssociation') }}</h2>
      <p class="section-text">
        {{ $t('details.aboutIntro') }}
      </p>
    </section>

    <!-- 部门介绍 -->
    <section class="section fade-in-on-scroll">
      <h2 class="section-title">{{ $t('details.departmentSetup') }}</h2>
      <div class="dept-grid">
        <div class="dept-card">
          <div class="dept-icon">📢</div>
          <h3>{{ $t('details.publicDept') }}</h3>
          <p>{{ $t('details.publicDeptDesc') }}</p>
        </div>
        <div class="dept-card">
          <div class="dept-icon">📋</div>
          <h3>{{ $t('details.orgDept') }}</h3>
          <p>{{ $t('details.orgDeptDesc') }}</p>
        </div>
        <div class="dept-card">
          <div class="dept-icon">💻</div>
          <h3>{{ $t('details.studyDept') }}</h3>
          <p>{{ $t('details.studyDeptDesc') }}</p>
        </div>
      </div>
    </section>

    <section class="section fade-in-on-scroll">
         <h2 class="section-title">{{ $t('details.contributors') }}</h2>
          <p>
           {{ $t('details.contributorsText1') }}
           {{ $t('details.contributorsText2') }}
           欢迎<a href="https://github.com/MIU-MA/vue3-js-jxufe-tech" style="color: blue;">{{ $t('details.viewDetails') }}</a>
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
  background: var(--color-bg-card);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px var(--color-shadow);
  transition: background-color 0.3s ease;
}

.section-title {
  font-size: 1.8em;
  color: var(--color-accent);
  margin: 0 0 20px;
  text-align: center;
}

.section-text {
  font-size: 1.05em;
  color: var(--color-text-secondary);
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
  background: var(--color-bg-alt);
  transition: transform 0.3s, box-shadow 0.3s;
}

.dept-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--color-shadow);
}

.dept-icon {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.dept-card h3 {
  color: var(--color-text-heading);
  margin: 0 0 10px;
  font-size: 1.2em;
}

.dept-card p {
  color: var(--color-text-muted);
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
