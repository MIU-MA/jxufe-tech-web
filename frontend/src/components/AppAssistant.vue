<script setup lang="ts">
import { defineAsyncComponent, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { MessageCircle } from 'lucide-vue-next'
import { useAssistant } from '../composables/useAssistant'
const assistant = useAssistant()
const route = useRoute()
const launcher = ref<HTMLButtonElement | null>(null)
let opener: HTMLElement | null = null
let mobileScroll: number | null = null
const AssistantPanel = defineAsyncComponent(
  () => import('./AssistantPanel.vue'),
)
watch(
  () => assistant.isOpen.value,
  async (open) => {
    if (open) {
      opener = document.activeElement as HTMLElement | null
      mobileScroll = window.matchMedia('(max-width: 1023px)').matches
        ? window.scrollY
        : null
    } else {
      await nextTick()
      if (opener?.isConnected && opener.getClientRects().length)
        opener.focus({ preventScroll: true })
      else launcher.value?.focus({ preventScroll: true })
      if (mobileScroll !== null)
        window.scrollTo({ top: mobileScroll, behavior: 'instant' })
      mobileScroll = null
    }
  },
  { flush: 'sync' },
)
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/admin')) assistant.close()
  },
)
</script>
<template>
  <button
    v-if="!route.path.startsWith('/admin') && !assistant.isOpen.value"
    ref="launcher"
    type="button"
    class="fixed right-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-110 flex cursor-pointer items-center gap-2 rounded-md border border-border bg-[var(--color-control-bg)] p-3 text-sm text-[var(--color-control-text)] shadow-sm hover:brightness-110 sm:right-6 sm:bottom-6 sm:px-5"
    :aria-label="$t('assistant.title')"
    :aria-expanded="assistant.isOpen.value"
    aria-controls="assistant-panel"
    @click="assistant.open()"
  >
    <MessageCircle :size="21" aria-hidden="true" /><span
      class="hidden sm:inline"
      >{{ $t('assistant.title') }}</span
    >
  </button>
  <aside
    v-if="assistant.activated.value"
    v-show="assistant.isOpen.value"
    class="sticky top-0 z-110 h-dvh w-full shrink-0 overflow-hidden border-l border-border bg-bg text-text lg:w-[400px] xl:w-[440px]"
    :aria-label="$t('assistant.title')"
  >
    <AssistantPanel />
  </aside>
</template>
