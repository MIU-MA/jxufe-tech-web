<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { useScrollReveal } from '../composables/useScrollReveal';

const contributors = ref ([
  { name: "MIUMA",  img: "https://www.miuma.top/images/jt.svg", url: "https://github.com/MIU-MA" },
  { name: "TangTangChu",img:"https://avatars.githubusercontent.com/u/61231159?v=4", url: "https://github.com/TangTangChu" },
]);

useScrollReveal();
</script>

<template>
  <main class="max-w-6xl mx-auto px-5 pt-20 pb-10 min-h-[calc(100vh-350px)]">
    <!-- 协会简介 -->
    <section
      class="fade-in-on-scroll max-w-[800px] mx-auto mb-16 p-10 rounded-2xl shadow-md transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 4px 20px var(--color-shadow)' }"
    >
      <h2 class="text-[1.8em] text-center mb-5" :style="{ color: 'var(--color-accent)' }">{{ $t('details.aboutAssociation') }}</h2>
      <p class="text-[1.05em] text-text-secondary leading-relaxed text-center">
        {{ $t('details.aboutIntro') }}
      </p>
    </section>

    <!-- 部门介绍 -->
    <section
      class="fade-in-on-scroll max-w-[800px] mx-auto mb-16 p-10 rounded-2xl shadow-md transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 4px 20px var(--color-shadow)' }"
    >
      <h2 class="text-[1.8em] text-center mb-5" :style="{ color: 'var(--color-accent)' }">{{ $t('details.departmentSetup') }}</h2>
      <div class="grid gap-6 mt-2.5" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
        <div
          class="text-center py-8 px-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--color-bg-alt)' }"
        >
          <div class="text-[2.5em] mb-3">📢</div>
          <h3 class="text-[1.2em] mb-2.5" :style="{ color: 'var(--color-text-heading)' }">{{ $t('details.publicDept') }}</h3>
          <p class="text-[0.93em] leading-relaxed m-0" :style="{ color: 'var(--color-text-muted)' }">{{ $t('details.publicDeptDesc') }}</p>
        </div>
        <div
          class="text-center py-8 px-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--color-bg-alt)' }"
        >
          <div class="text-[2.5em] mb-3">📋</div>
          <h3 class="text-[1.2em] mb-2.5" :style="{ color: 'var(--color-text-heading)' }">{{ $t('details.orgDept') }}</h3>
          <p class="text-[0.93em] leading-relaxed m-0" :style="{ color: 'var(--color-text-muted)' }">{{ $t('details.orgDeptDesc') }}</p>
        </div>
        <div
          class="text-center py-8 px-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :style="{ backgroundColor: 'var(--color-bg-alt)' }"
        >
          <div class="text-[2.5em] mb-3">💻</div>
          <h3 class="text-[1.2em] mb-2.5" :style="{ color: 'var(--color-text-heading)' }">{{ $t('details.studyDept') }}</h3>
          <p class="text-[0.93em] leading-relaxed m-0" :style="{ color: 'var(--color-text-muted)' }">{{ $t('details.studyDeptDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- Contributors -->
    <section
      class="fade-in-on-scroll max-w-[800px] mx-auto mb-16 p-10 rounded-2xl shadow-md transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 4px 20px var(--color-shadow)' }"
    >
      <h2 class="text-[1.8em] text-center mb-5" :style="{ color: 'var(--color-accent)' }">{{ $t('details.contributors') }}</h2>
      <p>
        {{ $t('details.contributorsText1') }}
        {{ $t('details.contributorsText2') }}
        欢迎<a href="https://github.com/MIU-MA/vue3-js-jxufe-tech" style="color: blue;">{{ $t('details.viewDetails') }}</a>
      </p>
      <div class="flex justify-start gap-5 flex-wrap mt-5">
        <a v-for="contributor in contributors" :key="contributor.name" :href="contributor.url" target="_blank" :title="contributor.name"
          class="inline-block transition-transform duration-300 hover:scale-110">
          <img :src="contributor.img" :alt="contributor.name" class="w-20 h-20 m-0 object-cover">
        </a>
      </div>
    </section>
  </main>
</template>
