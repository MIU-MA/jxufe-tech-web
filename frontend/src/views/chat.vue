<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useChat } from '../composables/useChat'
import MarkdownIt from 'markdown-it'
import { Send, Sparkles, Plus } from 'lucide-vue-next'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const { messages, isThinking, containerRef, send, clearMessages } = useChat()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const hasMessages = computed(() => messages.value.length > 0)

function handleSend() {
  if (!inputText.value.trim() || isThinking.value) return
  send(inputText.value)
  inputText.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
  // Ctrl+N 新对话
  if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleClear()
  }
}

function handleClear() {
  clearMessages()
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

function renderMarkdown(content: string): string {
  if (!content) return ''
  return md.render(content)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}


import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const quickHints = computed(() => (tm('chat.hints') as string[]) ?? [])

const messageGroups = computed(() => {
  const groups: { label: string; items: typeof messages.value }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const msg of messages.value) {
    const date = new Date(msg.timestamp)
    date.setHours(0, 0, 0, 0)
    let label: string
    if (date.getTime() === today.getTime()) {
      label = '今天'
    } else if (date.getTime() === yesterday.getTime()) {
      label = '昨天'
    } else {
      label = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    }

    let last = groups[groups.length - 1]
    if (!last || last.label !== label) {
      last = { label, items: [] }
      groups.push(last)
    }
    last.items.push(msg)
  }
  return groups
})
</script>

<template>
  <main
    class="flex flex-col mx-auto min-h-[calc(100vh-60px)] transition-colors duration-300"
    :style="{ backgroundColor: 'var(--color-bg)' }"
  >
    <!-- ==================== 顶部栏 ==================== -->
    <header
      class="sticky top-[60px] z-30 flex items-center justify-between px-5 py-3 border-b backdrop-blur-sm transition-colors duration-300"
      :style="{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-light)',
      }"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          :style="{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }"
        >
          <Sparkles :size="18" color="#fff" />
        </div>
        <!-- <div>
          <h1 class="text-base font-semibold" :style="{ color: 'var(--color-text-heading)' }">
            {{ $t('chat.title') }}
          </h1>
          <p class="text-xs" :style="{ color: 'var(--color-text-muted)' }">
            {{ $t('chat.subtitle') }}
          </p>
        </div> -->
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="hasMessages"
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200"
          :style="{
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border-light)',
          }"
          @click="handleClear"
          :title="$t('chat.newChat')"
        >
          <Plus :size="15" />
          <span class="hidden sm:inline">{{ $t('chat.newChat') }}</span>
        </button>
      </div>
    </header>

    <!-- ==================== 消息区域 ==================== -->
    <div
      ref="containerRef"
      class="flex-1 overflow-y-auto"
    >
      <!-- 空状态 -->
      <div
        v-if="!hasMessages && !isThinking"
        class="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] px-5 text-center"
      >
        <div
          class="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          :style="{ background: 'linear-gradient(135deg, var(--color-primary), #0088cc)' }"
        >
          <Sparkles :size="36" color="#fff" />
        </div>
        <h2 class="text-2xl font-bold mb-3" :style="{ color: 'var(--color-text-heading)' }">
          {{ $t('chat.welcomeTitle') }}
        </h2>
        <p class="max-w-md leading-relaxed mb-8" :style="{ color: 'var(--color-text-secondary)' }">
          {{ $t('chat.welcomeDesc') }}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full">
          <button
            v-for="hint in quickHints"
            :key="hint"
            class="text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5"
            :style="{
              backgroundColor: 'var(--color-bg-alt)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-light)',
            }"
            @click="inputText = hint; handleSend()"
          >
            {{ hint }}
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="max-w-3xl mx-auto w-full px-4 py-6">
        <template v-for="group in messageGroups" :key="group.label">
          <!-- 日期分隔 -->
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px" :style="{ backgroundColor: 'var(--color-border-light)' }"></div>
            <span class="text-xs px-3 py-1 rounded-full" :style="{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-alt)' }">
              {{ group.label }}
            </span>
            <div class="flex-1 h-px" :style="{ backgroundColor: 'var(--color-border-light)' }"></div>
          </div>

          <!-- 消息气泡 -->
          <template v-for="msg in group.items" :key="msg.id">
            <div
              class="mb-5"
              :class="msg.role === 'user' ? 'flex justify-end' : 'flex gap-3'"
            >
              <!-- AI 头像 -->
              <div v-if="msg.role === 'assistant'" class="shrink-0">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :style="{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }"
                >
                  <Sparkles :size="14" color="#fff" />
                </div>
              </div>

              <div
                class="max-w-[80%]"
                :class="msg.role === 'user' ? 'items-end' : 'items-start'"
              >
                <div
                  v-if="msg.role === 'user'"
                  class="px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed whitespace-pre-wrap break-words"
                  :style="{
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                  }"
                >
                  {{ msg.content }}
                </div>

                <div
                  v-else
                  class="px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed transition-colors duration-300"
                  :style="{
                    backgroundColor: 'var(--color-bg-card)',
                    color: 'var(--color-text)',
                    border: '1px solid ' + 'var(--color-border-light)',
                  }"
                >
                  <div
                    class="prose prose-sm dark:prose-invert max-w-none prose-pre:rounded-lg prose-code:text-sm"
                    :style="{ '--tw-prose-body': 'var(--color-text)', '--tw-prose-headings': 'var(--color-text-heading)' }"
                    v-html="renderMarkdown(msg.content)"
                  ></div>
                  <span
                    v-if="isThinking && msg.id === messages[messages.length - 1]?.id && !msg.content"
                    class="inline-block w-2 h-4 ml-0.5 align-text-bottom animate-pulse rounded-sm"
                    :style="{ backgroundColor: 'var(--color-accent)' }"
                  ></span>
                </div>

                <!-- 时间 -->
                <p class="text-[11px] mt-1 px-1" :class="msg.role === 'user' ? 'text-right' : 'text-left'" :style="{ color: 'var(--color-text-muted)' }">
                  {{ formatTime(msg.timestamp) }}
                </p>
              </div>
            </div>
          </template>
        </template>

        <div v-if="isThinking && messages[messages.length - 1]?.role === 'user'" class="flex gap-3 mb-5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :style="{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }"
          >
            <Sparkles :size="14" color="#fff" />
          </div>
          <div
            class="px-4 py-3 rounded-2xl rounded-bl-md"
            :style="{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid ' + 'var(--color-border-light)',
            }"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="inline-block w-2 h-2 rounded-full animate-bounce"
                :style="{ backgroundColor: 'var(--color-text-muted)' }"
              ></span>
              <span
                class="inline-block w-2 h-2 rounded-full animate-bounce"
                style="animation-delay: 0.15s"
                :style="{ backgroundColor: 'var(--color-text-muted)' }"
              ></span>
              <span
                class="inline-block w-2 h-2 rounded-full animate-bounce"
                style="animation-delay: 0.3s"
                :style="{ backgroundColor: 'var(--color-text-muted)' }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="sticky bottom-0 z-30 border-t transition-colors duration-300"
      :style="{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-light)',
      }"
    >
      <div class="max-w-3xl mx-auto px-4 py-3">
        <div
          class="flex items-end gap-2.5 rounded-2xl px-4 py-2.5 transition-colors duration-300"
          :style="{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid ' + 'var(--color-border)',
          }"
        >
          <textarea
            ref="textareaRef"
            v-model="inputText"
            :placeholder="$t('chat.placeholder')"
            rows="1"
            class="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:select-none"
            :style="{ color: 'var(--color-text)', '--placeholder-color': 'var(--color-text-muted)' }"
            @keydown="handleKeydown"
            @input="autoResize"
            :disabled="isThinking"
          ></textarea>
          <button
            class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-40"
            :style="{
              backgroundColor: inputText.trim() && !isThinking ? 'var(--color-primary)' : 'var(--color-border-light)',
              color: inputText.trim() && !isThinking ? '#fff' : 'var(--color-text-muted)',
            }"
            :disabled="!inputText.trim() || isThinking"
            @click="handleSend"
            :title="$t('chat.send')"
          >
            <Send :size="16" />
          </button>
        </div>
        <p class="text-xs text-center mt-2" :style="{ color: 'var(--color-text-muted)' }">
          {{ $t('chat.hint') }}
        </p>
      </div>
    </div>
  </main>
</template>
