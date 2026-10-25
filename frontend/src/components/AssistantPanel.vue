<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import {
  ArrowUp,
  BookOpen,
  Check,
  Copy,
  MessageCircle,
  Plus,
  X,
} from 'lucide-vue-next'
import { useAssistant } from '../composables/useAssistant'
import { useChat } from '../composables/useChat'
import { createSafeMarkdown } from '../utils/markdown'

const assistant = useAssistant()
const { t, tm } = useI18n()
const { messages, isThinking, budget, containerRef, send, clearMessages } =
  useChat()
const input = ref<HTMLTextAreaElement | null>(null)
const submitting = ref(false)
const feedback = ref('')
const copiedId = ref('')
const md = createSafeMarkdown()
let copyTimer: ReturnType<typeof setTimeout> | undefined
const busy = computed(() => submitting.value || isThinking.value)
const exhausted = computed(() => budget.value?.enabled === false)
const canSend = computed(
  () => !!assistant.draft.value.trim() && !busy.value && !exhausted.value,
)
const hints = computed(() => tm('chat.hints') as string[])
function chooseHint(question: string) {
  assistant.draft.value = question
  input.value?.focus()
}

watch(
  () => assistant.isOpen.value,
  async (open) => {
    if (open) {
      await nextTick()
      input.value?.focus()
    }
  },
  { immediate: true },
)
function resize() {
  if (input.value) {
    input.value.style.height = 'auto'
    input.value.style.height = `${Math.min(input.value.scrollHeight, 130)}px`
  }
}
watch(
  () => assistant.draft.value,
  () => nextTick(resize),
)
async function submit() {
  if (!canSend.value) return
  const text = assistant.draft.value.trim()
  const context = assistant.context.value
  assistant.draft.value = ''
  submitting.value = true
  try {
    await send(
      text,
      context
        ? `${context.title}\n${context.content.slice(0, 6000)}`
        : undefined,
    )
  } finally {
    submitting.value = false
    if (assistant.isOpen.value) input.value?.focus()
  }
}
function keydown(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void submit()
  }
}
function clear() {
  if (busy.value) return
  clearMessages()
  assistant.context.value = null
  assistant.draft.value = ''
  input.value?.focus()
}
async function copy(id: string, content: string) {
  clearTimeout(copyTimer)
  try {
    await navigator.clipboard.writeText(content)
    copiedId.value = id
    feedback.value = t('chat.copied')
  } catch {
    feedback.value = t('chat.copyFailed')
  }
  copyTimer = setTimeout(() => {
    copiedId.value = ''
    feedback.value = ''
  }, 2500)
}
onBeforeUnmount(() => {
  clearTimeout(copyTimer)
})
</script>

<template>
  <section
    id="assistant-panel"
    aria-labelledby="assistant-title"
    class="flex h-full min-h-0 flex-col [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-45"
    @keydown.esc.stop="assistant.close()"
  >
    <header
      class="flex shrink-0 items-center gap-2 border-t-4 border-t-primary-dark border-b border-b-border px-5 py-4"
    >
      <div
        class="flex min-w-0 flex-1 items-center gap-3 text-primary [&_h2]:m-0 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-text-heading [&_span]:text-[11px] [&_span]:text-text-secondary"
      >
        <MessageCircle :size="22" aria-hidden="true" />
        <div>
          <h2 id="assistant-title">{{ t('assistant.title') }}</h2>
          <span>{{ t('assistant.subtitle') }}</span>
        </div>
      </div>
      <button
        type="button"
        class="grid size-[34px] shrink-0 place-items-center rounded border-0 bg-transparent text-text-secondary hover:bg-bg-alt"
        :disabled="busy"
        :aria-label="t('assistant.newChat')"
        @click="clear"
      >
        <Plus :size="19" />
      </button>
      <button
        type="button"
        class="grid size-[34px] shrink-0 place-items-center rounded border-0 bg-transparent text-text-secondary hover:bg-bg-alt"
        :aria-label="t('assistant.close')"
        @click="assistant.close()"
      >
        <X :size="21" />
      </button>
    </header>
    <div
      class="flex shrink-0 items-center gap-2 border-b border-border-light bg-bg-alt px-6 py-3 text-xs text-primary [&>span]:ml-auto [&>span]:text-[10px] [&>span]:text-text-muted"
    >
      <BookOpen :size="14" aria-hidden="true" /><RouterLink
        to="/wiki"
        @click="assistant.close()"
        >{{ t('assistant.visitWiki') }} →</RouterLink
      ><span>DeepSeek</span>
    </div>
    <div
      ref="containerRef"
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 lg:p-6"
      :aria-busy="busy"
    >
      <div
        v-if="!messages.length"
        class="pt-4 lg:pt-8 [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:font-display [&>h3]:text-[25px] [&>h3]:font-semibold [&>h3]:leading-normal [&>h3]:text-text-heading [&>p]:mb-6 [&>p]:text-[13px] [&>p]:leading-[1.9] [&>p]:text-text-secondary [&>button]:my-2 [&>button]:flex [&>button]:w-full [&>button]:justify-between [&>button]:gap-3 [&>button]:rounded [&>button]:border [&>button]:border-border [&>button]:bg-bg [&>button]:px-3.5 [&>button]:py-3 [&>button]:text-left [&>button]:text-[13px] [&>button]:text-text [&>button:hover]:bg-bg-alt [&>button:hover]:text-primary"
      >
        <span
          class="inline-grid size-14 place-items-center rounded-md border border-border bg-bg-alt text-primary"
          ><MessageCircle :size="30" :stroke-width="1.4" aria-hidden="true"
        /></span>
        <h3>{{ t('assistant.welcome') }}</h3>
        <p>{{ t('assistant.intro') }}</p>
        <button
          v-for="hint in hints"
          :key="hint"
          type="button"
          @click="chooseHint(hint)"
        >
          {{ hint }} <span aria-hidden="true">↗</span>
        </button>
      </div>
      <article
        v-for="message in messages"
        :key="message.id"
        class="mb-6 wrap-anywhere"
        :class="message.role"
      >
        <span class="text-[11px] text-text-muted">{{
          t(message.role === 'user' ? 'assistant.you' : 'assistant.title')
        }}</span>
        <p
          v-if="message.role === 'user'"
          class="mt-2 mb-0 whitespace-pre-wrap rounded bg-bg-alt px-4 py-3 text-sm"
        >
          {{ message.content }}
        </p>
        <div
          v-else
          class="prose dark:prose-invert mt-2 max-w-full text-sm [--tw-prose-body:var(--color-text)] [--tw-prose-headings:var(--color-text-heading)] [--tw-prose-links:var(--color-primary)] [--tw-prose-bold:var(--color-text-heading)] [--tw-prose-code:var(--color-text)] prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border prose-pre:bg-bg-alt prose-pre:text-text prose-table:block prose-table:overflow-x-auto prose-img:max-w-full prose-h1:text-xl prose-h2:text-xl"
          v-html="md.render(message.content)"
        ></div>
        <span
          v-if="message.role === 'assistant' && !message.content && busy"
          class="mt-2.5 block text-[13px] text-text-secondary"
          role="status"
          >{{ t('chat.thinking') }}</span
        >
        <button
          v-if="message.role === 'assistant' && message.content && !busy"
          type="button"
          class="flex items-center gap-1.5 border-0 bg-transparent py-1 text-[11px] text-text-muted"
          @click="copy(message.id, message.content)"
        >
          <Check v-if="copiedId === message.id" :size="13" /><Copy
            v-else
            :size="13"
          />{{ t(copiedId === message.id ? 'chat.copied' : 'chat.copy') }}
        </button>
      </article>
    </div>
    <form
      class="shrink-0 border-t border-border px-5 pt-4 pb-[max(14px,env(safe-area-inset-bottom))]"
      @submit.prevent="submit"
    >
      <div
        v-if="assistant.context.value"
        class="mb-2 flex items-center gap-2 text-[11px] text-primary [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>button]:grid [&>button]:place-items-center [&>button]:border-0 [&>button]:bg-transparent [&>button]:text-inherit"
      >
        <span
          >{{ t('assistant.context') }}：{{
            assistant.context.value.title
          }}</span
        ><button
          type="button"
          :aria-label="t('assistant.removeContext')"
          :disabled="busy"
          @click="assistant.context.value = null"
        >
          <X :size="14" />
        </button>
      </div>
      <div
        class="flex items-end rounded-[5px] border border-border bg-bg p-2.5 focus-within:border-primary [&>textarea]:min-w-0 [&>textarea]:max-h-[130px] [&>textarea]:flex-1 [&>textarea]:resize-none [&>textarea]:border-0 [&>textarea]:bg-transparent [&>textarea]:px-1.5 [&>textarea]:py-0.5 [&>textarea]:text-sm [&>textarea]:leading-[1.7] [&>textarea]:text-text [&>textarea:focus-visible]:outline-none! [&>button]:grid [&>button]:size-[34px] [&>button]:shrink-0 [&>button]:place-items-center [&>button]:rounded [&>button]:border-0 [&>button]:bg-[var(--color-control-bg)] [&>button]:text-[var(--color-control-text)]"
      >
        <textarea
          ref="input"
          v-model="assistant.draft.value"
          rows="2"
          :maxlength="assistant.context.value ? 1000 : 2000"
          :aria-label="t('chat.placeholder')"
          :placeholder="
            t(exhausted ? 'chat.exhaustedPlaceholder' : 'chat.placeholder')
          "
          :disabled="busy || exhausted"
          @keydown="keydown"
          @input="resize"
        ></textarea
        ><button
          type="submit"
          :disabled="!canSend"
          :aria-label="t('chat.send')"
        >
          <ArrowUp :size="19" />
        </button>
      </div>
      <p
        class="mt-2 mb-0 text-[10px] leading-[1.8]"
        :class="exhausted ? 'text-accent' : 'text-text-muted'"
      >
        {{ t(exhausted ? 'chat.exhaustedHint' : 'chat.hint') }}
      </p>
      <span class="sr-only" role="status">{{ feedback }}</span>
    </form>
  </section>
</template>
