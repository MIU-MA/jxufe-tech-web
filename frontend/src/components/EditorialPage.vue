<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  title: string
  eyebrow: string
  description?: string
}>()
const { t } = useI18n()
</script>

<template>
  <div class="ed-layout">
    <main class="ed-main">
      <div class="ed-breadcrumb">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <ChevronRight :size="12" aria-hidden="true" />
        <span>{{ title }}</span>
      </div>
      <header class="ed-page-header">
        <p class="ed-kicker">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="description" class="ed-description">{{ description }}</p>
        <slot name="meta"></slot>
      </header>
      <slot></slot>
    </main>
  </div>
</template>
