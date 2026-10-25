<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRight } from 'lucide-vue-next'
defineProps<{ title: string; eyebrow: string; description?: string }>()
const { t } = useI18n()
</script>
<template>
  <div>
    <div
      class="border-b border-border bg-bg-alt bg-[image:linear-gradient(to_right,rgba(16,52,95,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,52,95,0.05)_1px,transparent_1px)] bg-[size:44px_44px]"
    >
      <div class="mx-auto w-full max-w-[1160px] px-4 md:px-6">
        <div class="flex min-h-14 items-center gap-2 text-xs text-text-muted">
          <RouterLink to="/">{{ t('nav.home') }}</RouterLink
          ><ChevronRight :size="12" class="shrink-0" aria-hidden="true" /><span
            class="truncate"
            >{{ title }}</span
          >
        </div>
        <header class="mt-4 pb-7 md:pb-10">
          <p class="mt-0 mb-2.5 text-[11px] tracking-[.11em] text-primary">
            {{ eyebrow }}
          </p>
          <h1
            class="m-0 font-display text-[clamp(28px,3vw,38px)] font-semibold leading-normal text-text-heading wrap-anywhere"
          >
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="mt-3 mb-0 max-w-[760px] text-sm leading-[1.95] text-text-secondary md:text-[15px]"
          >
            {{ description }}
          </p>
          <slot name="meta" />
        </header>
      </div>
    </div>
    <main
      class="mx-auto w-full max-w-[1160px] px-4 pt-2 pb-16 md:px-6 [&_.ed-text]:text-sm! md:[&_.ed-text]:text-base! [&_.ed-section-title]:mb-[22px]! [&_.ed-section-title]:pb-[13px]! [&_.ed-section-title_h2]:text-[23px]! md:[&_.ed-section-title_h2]:text-[25px]! [&_.ed-section-title_h2]:font-semibold! [&_.ed-section-title>span]:text-[15px]! [&_.ed-section-title>span]:text-primary! [&_.ed-news-link_h2]:text-2xl! [&_.ed-news-link_p]:text-sm! [&_.ed-department_p]:text-sm! [&_.ed-note_p]:text-sm! [&_.ed-news-link_time]:text-[13px]! [&_.ed-link]:text-[13px]! [&_.ed-meta]:text-xs! [&_.ed-abstract]:mt-8! [&_.ed-abstract]:text-[15px]!"
    >
      <slot />
    </main>
  </div>
</template>
