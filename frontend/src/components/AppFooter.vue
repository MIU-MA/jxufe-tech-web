<script setup lang="ts">
import { ref } from 'vue';
import { Mail, Building2, MapPin } from 'lucide-vue-next';

const friendLinks = ref([
    { name: "程序设计协会", url: "https://jxufe-acm.cn", logo: "https://jxufe-acm.cn/images/logo.png" },
    { name: "计算机协会",   url: "https://www.jxufe-cs.top/", logo: "https://www.jxufe-cs.top/img/%E4%BC%9A%E5%BE%BD.png" },
    { name: "网络安全协会", url: "https://csec.jxufe.edu.cn", logo: "https://csec.jxufe.edu.cn/favicon.svg" },
    { name: "江西财经大学", url: "https://www.jxufe.edu.cn/", logo: "https://jxufe-acm.cn/jxufe.png" }
]);

const contactInfo = { email: "2117410945@qq.com" };
</script>

<template>
  <footer class="w-full mt-0 border-t border-t-[var(--color-border)] transition-colors duration-300 bg-[var(--color-bg-footer)]">
    <div class="max-w-[1160px] mx-auto px-4 md:px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-[1.6fr_1.2fr_1.2fr] gap-12">

        <div>
          <div class="flex items-center gap-3 mb-5">
            <img src="/logo.jpg" alt="数智技术协会会徽" class="w-11 h-11 rounded-full object-cover" />
            <span class="font-display text-[1.3em] text-[var(--color-text-heading)]">{{ $t('footer.brandName') }}</span>
          </div>
          <p class="text-[0.92rem] leading-relaxed m-0 text-[var(--color-text-secondary)]">
            {{ $t('footer.tagline1') }}<br>
            {{ $t('footer.tagline2') }}
          </p>
        </div>

        <div>
          <h4 class="text-[1rem] m-0 mb-5 pb-2 text-[var(--color-text-heading)] border-b border-b-[var(--color-border)]">
            {{ $t('footer.contactUs') }}
          </h4>
          <ul class="list-none p-0 m-0 space-y-3 text-[0.92rem] text-[var(--color-text-secondary)]">
            <li class="flex items-start gap-2.5 leading-relaxed">
              <Mail :size="17" class="mt-0.5 shrink-0 opacity-70" />
              <a :href="`mailto:${contactInfo.email}`" class="no-underline hover:no-underline text-[var(--color-text-secondary)]">{{ contactInfo.email }}</a>
            </li>
            <li class="flex items-start gap-2.5 leading-relaxed">
              <Building2 :size="17" class="mt-0.5 shrink-0 opacity-70" />
              <span>{{ $t('footer.school') }}</span>
            </li>
            <li class="flex items-start gap-2.5 leading-relaxed">
              <MapPin :size="17" class="mt-0.5 shrink-0 opacity-70" />
              <span>{{ $t('footer.address') }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-[1rem] m-0 mb-5 pb-2 text-[var(--color-text-heading)] border-b border-b-[var(--color-border)]">
            {{ $t('footer.friendLinks') }}
          </h4>
          <ul class="list-none p-0 m-0 flex flex-col gap-3">
            <li v-for="(item, index) in friendLinks" :key="index">
              <a
                :href="item.url"
                class="flex items-center gap-2.5 no-underline hover:no-underline text-[0.92rem] transition-colors text-[var(--color-text-secondary)]"
                target="_blank"
              >
                <img :src="item.logo" :alt="item.name" class="w-5 h-5 rounded-full object-cover">
                <span>{{ item.name }}</span>
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <div class="py-4 px-4 md:px-6 text-sm flex flex-wrap items-center justify-center text-center gap-3 transition-colors duration-300 bg-[var(--color-bg-footer-bottom)]">
      <p class="m-0 text-[var(--color-text-dark-muted)]">&copy; {{ $t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
      <div class="flex items-center gap-2">
        <a href="https://beian.miit.gov.cn/" target="_blank" class="no-underline hover:no-underline transition-colors text-[var(--color-text-dark-muted)]">赣ICP备2025074452号</a>
        <span class="opacity-50">|</span>
        <a href="https://beian.mps.gov.cn/" target="_blank" class="inline-flex items-center no-underline hover:no-underline transition-colors text-[var(--color-text-dark-muted)]">
          <img src="https://www.beian.gov.cn/img/ghs.png" alt="公安备案" class="h-4 mr-1">
          赣公网安备36010602000365号
        </a>
      </div>
    </div>
  </footer>
</template>
