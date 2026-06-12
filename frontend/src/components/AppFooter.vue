<script setup lang="ts">
import { ref } from 'vue';

const friendLinks = ref([
    { name: "程序设计协会", url: "https://jxufe-acm.cn", logo: "https://jxufe-acm.cn/images/logo.png" },
    { name: "计算机协会",   url: "https://qm.qq.com/q/vh2EE5qytM", logo: "https://jxufe-acm.cn/images/jsjxh.png" },
    { name: "网络安全协会", url: "https://csec.jxufe.edu.cn", logo: "https://csec.jxufe.edu.cn/favicon.svg" },
    { name: "江西财经大学", url: "https://www.jxufe.edu.cn/", logo: "https://jxufe-acm.cn/jxufe.png" }
]);

const contactInfo = { email: "2117410945@qq.com" };
</script>

<template>
  <footer
    class="w-full border-t mt-0 transition-colors duration-300"
    :style="{ backgroundColor: 'var(--color-bg-footer)', color: 'var(--color-text-footer)', borderColor: 'var(--color-border-light)' }"
  >
    <div class="py-[60px]">
      <div class="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr] gap-10 md:gap-10">

        <!-- 品牌栏 -->
        <div>
          <div class="flex items-center gap-3 mb-5">
            <img src="/logo.jpg" alt="Logo" class="w-12 h-12 rounded-full shadow-sm" />
            <span class="text-[1.4rem] font-bold" :style="{ color: 'var(--color-text-heading)' }">{{ $t('footer.brandName') }}</span>
          </div>
          <p class="text-[0.95rem] leading-relaxed max-w-[90%] md:max-w-full" :style="{ color: 'var(--color-text-muted)' }">
            {{ $t('footer.tagline1') }}<br>
            {{ $t('footer.tagline2') }}
          </p>
        </div>

        <!-- 联系栏 -->
        <div>
          <h4 class="text-[1.1rem] font-semibold mb-6 relative pl-3" :style="{ color: 'var(--color-text)' }">
            <span class="absolute left-0 top-0 bottom-0 w-1 rounded-sm" :style="{ backgroundColor: 'var(--color-accent)' }"></span>
            {{ $t('footer.contactUs') }}
          </h4>
          <ul class="list-none p-0 m-0 space-y-4 text-[0.95rem]">
            <li class="flex items-start gap-2.5 leading-relaxed">
              <span class="text-[1.1rem] opacity-80">📧</span>
              <a :href="`mailto:${contactInfo.email}`" class="hover:underline transition-colors" :style="{ color: 'var(--color-text-footer)' }">{{ contactInfo.email }}</a>
            </li>
            <li class="flex items-start gap-2.5 leading-relaxed">
              <span class="text-[1.1rem] opacity-80">🏫</span>
              <span>{{ $t('footer.school') }}</span>
            </li>
            <li class="flex items-start gap-2.5 leading-relaxed">
              <span class="text-[1.1rem] opacity-80">📍</span>
              <span>{{ $t('footer.address') }}</span>
            </li>
          </ul>
        </div>

        <!-- 友情链接栏 -->
        <div>
          <h4 class="text-[1.1rem] font-semibold mb-6 relative pl-3" :style="{ color: 'var(--color-text)' }">
            <span class="absolute left-0 top-0 bottom-0 w-1 rounded-sm" :style="{ backgroundColor: 'var(--color-accent)' }"></span>
            {{ $t('footer.friendLinks') }}
          </h4>
          <div class="flex flex-col gap-2.5">
            <a
              v-for="(item, index) in friendLinks"
              :key="index"
              :href="item.url"
              class="flex items-center no-underline text-[0.95rem] py-2 px-3 rounded-md border transition-all duration-200 hover:translate-x-[5px] hover:shadow-md"
              :style="{
                color: 'var(--color-text-footer)',
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
              }"
              target="_blank"
            >
              <img :src="item.logo" :alt="item.name" class="w-5 h-5 mr-2.5 rounded-full">
              <span>{{ item.name }}</span>
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- 底部版权栏 -->
    <div
      class="text-white/80 py-3 px-5 text-sm flex flex-wrap items-center justify-center text-center gap-3 transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-footer-bottom)' }"
    >
      <p>&copy; {{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
      <div class="flex items-center gap-2">
        <a href="https://beian.miit.gov.cn/" target="_blank" class="text-white/60 no-underline hover:text-white transition-colors">赣ICP备2025074452号</a>
        <span class="opacity-40">|</span>
        <a href="https://beian.mps.gov.cn/" target="_blank" class="inline-flex items-center no-underline text-white/60 hover:text-white transition-colors">
          <img src="https://www.beian.gov.cn/img/ghs.png" alt="公安备案" class="h-4 mr-1">
          赣公网安备36010602000365号
        </a>
      </div>
    </div>
  </footer>
</template>
