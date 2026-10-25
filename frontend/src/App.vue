<script setup lang="ts">
import { RouterView } from 'vue-router'
import { provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import AppAssistant from './components/AppAssistant.vue'
import { assistantKey, createAssistant } from './composables/useAssistant'
const assistant = createAssistant()
provide(assistantKey, assistant)
</script>

<template>
  <div class="flex min-h-dvh items-start">
    <div
      class="@container/site min-w-0 flex-1"
      :class="{ 'hidden lg:block': assistant.isOpen.value }"
    >
      <AppHeader />
      <Suspense><RouterView /></Suspense>
      <AppFooter />
    </div>
    <AppAssistant />
  </div>
</template>
