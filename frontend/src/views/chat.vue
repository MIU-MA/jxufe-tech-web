<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, BookOpen, Check, ChevronRight, Copy, Menu, Plus, Search, X } from 'lucide-vue-next'
import { useChat, type ChatMessage } from '../composables/useChat'
import { renderWikiMarkdown } from '../utils/wikiMarkdown'

interface Entry { question: ChatMessage; answer?: ChatMessage }
const { t, tm, locale } = useI18n()
const { messages, isThinking, budget, send, clearMessages } = useChat()
// A wiki reader keeps their position while text streams, rather than following its end.
const containerRef = ref<HTMLElement | null>(null)
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedId = ref<string | null>(null)
const mobileNavOpen = ref(false)
const submitting = ref(false)
const copyFeedback = ref('')
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
const busy = computed(() => submitting.value || isThinking.value)
const budgetExhausted = computed(() => budget.value !== null && !budget.value.enabled)
const canSend = computed(() => Boolean(inputText.value.trim()) && !busy.value && !budgetExhausted.value)
const entries = computed(() => {
  const items: Entry[] = []
  for (const message of messages.value) {
    if (message.role === 'user') items.push({ question: message })
    else if (items.length && !items[items.length - 1].answer) items[items.length - 1].answer = message
  }
  return items
})
const home = computed(() => selectedId.value === 'home' || entries.value.length === 0)
const activeEntry = computed(() => home.value ? undefined
  : entries.value.find(entry => entry.question.id === selectedId.value) ?? entries.value[entries.value.length - 1])
const article = computed(() => renderWikiMarkdown(activeEntry.value?.answer?.content ?? '', activeEntry.value?.question.id ?? 'wiki'))
const activeGenerating = computed(() => isThinking.value && activeEntry.value?.question.id === entries.value[entries.value.length - 1]?.question.id)
const orphanError = computed(() => {
  const last = messages.value[messages.value.length - 1]
  return last?.role === 'assistant' && !entries.value.some(entry => entry.answer?.id === last.id) ? last.content : ''
})
const sections = computed(() => ['overview', 'topics', 'getting-started', 'reading-notes'].map(id => ({ id: `wiki-${id}`, text: t(`chat.wiki.${id}`), level: 2 })))
const outline = computed(() => home.value ? sections.value : [{ id: 'wiki-entry-top', text: t('chat.wiki.summary'), level: 2 }, ...article.value.headings])
const quickHints = computed(() => (tm('chat.hints') as string[]).map((question, index) => ({ question, label: t(`chat.topics.${index}`) })))
const steps = computed(() => tm('chat.wiki.steps') as string[])
watch(() => activeEntry.value?.question.id, async () => {
  await nextTick()
  if (containerRef.value) containerRef.value.scrollTop = 0
})

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}
async function handleSend() {
  if (!canSend.value) return
  const text = inputText.value
  inputText.value = ''
  selectedId.value = null
  submitting.value = true
  await nextTick()
  autoResize()
  try { await send(text) } finally { submitting.value = false }
}
function handleKeydown(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) return
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void handleSend() }
}
async function chooseHint(question: string) {
  inputText.value = question
  mobileNavOpen.value = false
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
}
async function selectEntry(id: string) {
  selectedId.value = id
  copied.value = false
  mobileNavOpen.value = false
  await nextTick()
  if (containerRef.value) containerRef.value.scrollTop = 0
}
async function jumpTo(id: string) {
  await nextTick()
  const target = containerRef.value?.querySelector<HTMLElement>(`#${id}`)
  target?.scrollIntoView({ block: 'start', behavior: 'auto' })
  target?.focus({ preventScroll: true })
  mobileNavOpen.value = false
}
async function openSection(id: string) { await selectEntry('home'); await jumpTo(id) }
async function handleClear() {
  if (busy.value) return
  clearMessages()
  inputText.value = ''
  selectedId.value = 'home'
  mobileNavOpen.value = false
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
}
async function copyAnswer() {
  const content = activeEntry.value?.answer?.content
  if (!content) return
  clearTimeout(copyTimer)
  copied.value = false
  try { await navigator.clipboard.writeText(content); copied.value = true; copyFeedback.value = t('chat.copied') }
  catch { copyFeedback.value = t('chat.copyFailed') }
  copyTimer = setTimeout(() => { copied.value = false; copyFeedback.value = '' }, 2500)
}
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <div class="wiki-page">
    <div v-if="mobileNavOpen" class="nav-backdrop" @click="mobileNavOpen = false"></div>
    <aside id="wiki-navigation" class="wiki-sidebar" :class="{ 'is-open': mobileNavOpen }" :aria-label="t('chat.wiki.navigation')">
      <div class="wiki-wordmark"><BookOpen :size="27" :stroke-width="1.2" aria-hidden="true" /><div><span>{{ t('chat.wiki.brand') }}</span><small>DSA KNOWLEDGE</small></div><button class="mobile-close icon-button" type="button" :aria-label="t('chat.wiki.closeNav')" @click="mobileNavOpen = false"><X :size="18" /></button></div>
      <p class="nav-caption">{{ t('chat.wiki.navigation') }}</p>
      <button class="nav-home" :class="{ selected: home }" type="button" @click="selectEntry('home')"><BookOpen :size="15" aria-hidden="true" />{{ t('chat.wiki.home') }}</button>
      <nav class="section-nav"><a v-for="section in sections" :key="section.id" :href="`#${section.id}`" @click.prevent="openSection(section.id)">{{ section.text }}</a></nav>
      <div class="history-heading"><span>{{ t('chat.wiki.explorations') }}</span><span>{{ entries.length.toString().padStart(2, '0') }}</span></div>
      <p v-if="!entries.length" class="history-empty">{{ t('chat.wiki.noHistory') }}</p>
      <nav v-else class="entry-nav" :aria-label="t('chat.wiki.explorations')"><button v-for="entry in entries" :key="entry.question.id" type="button" :disabled="busy" :class="{ selected: activeEntry?.question.id === entry.question.id }" @click="selectEntry(entry.question.id)"><span>{{ entry.question.content }}</span><ChevronRight :size="13" aria-hidden="true" /></button></nav>
      <div class="sidebar-foot"><span class="model-dot"></span>DeepSeek<span> / AI</span></div>
    </aside>

    <main class="wiki-column">
      <header class="wiki-toolbar">
        <div class="breadcrumbs"><button class="mobile-toggle icon-button" type="button" :aria-label="t('chat.wiki.navigation')" aria-controls="wiki-navigation" :aria-expanded="mobileNavOpen" @click="mobileNavOpen = !mobileNavOpen"><Menu :size="19" /></button><button type="button" @click="selectEntry('home')">{{ t('chat.wiki.brand') }}</button><ChevronRight :size="12" aria-hidden="true" /><span>{{ t(home ? 'chat.wiki.home' : 'chat.wiki.article') }}</span></div>
        <button class="new-exploration" type="button" :disabled="!messages.length || busy" @click="handleClear"><Plus :size="15" aria-hidden="true" /><span>{{ t('chat.newChat') }}</span></button>
      </header>
      <div ref="containerRef" class="wiki-reading">
        <article class="wiki-article" :aria-busy="activeGenerating">
          <div class="article-label"><span>{{ t(home ? 'chat.wiki.portal' : 'chat.wiki.generated') }}</span><span>{{ t('chat.wiki.edition') }}</span></div>
          <h1 id="wiki-entry-top" tabindex="-1">{{ home ? t('chat.wiki.homeTitle') : activeEntry?.question.content }}</h1>
          <div class="article-meta"><span>{{ t('chat.wiki.byline') }}</span><span v-if="activeEntry">{{ formatDate(activeEntry.question.timestamp) }}</span></div>
          <details class="mobile-outline"><summary>{{ t('chat.wiki.contents') }}</summary><nav><a v-for="heading in outline" :key="heading.id" :href="`#${heading.id}`" @click.prevent="jumpTo(heading.id)">{{ heading.text }}</a></nav></details>

          <p v-if="orphanError" class="request-error" role="alert">{{ orphanError }}</p>
          <template v-if="home">
            <div class="wiki-notice"><BookOpen :size="18" aria-hidden="true" /><p><strong>{{ t('chat.wiki.welcome') }}</strong>{{ t('chat.wiki.welcomeNote') }}</p></div>
            <section class="home-section"><h2 id="wiki-overview" tabindex="-1">{{ t('chat.wiki.overview') }}</h2><p>{{ t('chat.wiki.overviewText') }}</p></section>
            <section class="home-section"><h2 id="wiki-topics" tabindex="-1">{{ t('chat.wiki.topics') }}</h2><p>{{ t('chat.wiki.topicIntro') }}</p><div class="topic-index"><div class="topic-index-heading">{{ t('chat.wiki.exploreByTopic') }}</div><div v-for="(hint, index) in quickHints" :key="hint.question" class="topic-row"><span class="topic-id">0{{ index + 1 }}</span><strong>{{ hint.label }}</strong><button type="button" :disabled="busy || budgetExhausted" @click="chooseHint(hint.question)">{{ hint.question }}<ArrowRight :size="14" aria-hidden="true" /></button></div></div></section>
            <section class="home-section"><h2 id="wiki-getting-started" tabindex="-1">{{ t('chat.wiki.getting-started') }}</h2><ol class="getting-started"><li v-for="step in steps" :key="step">{{ step }}</li></ol></section>
            <section class="home-section reading-notes"><h2 id="wiki-reading-notes" tabindex="-1">{{ t('chat.wiki.reading-notes') }}</h2><p>{{ t('chat.wiki.disclaimer') }}</p></section>
          </template>
          <template v-else>
            <div class="generated-note">{{ t('chat.wiki.generatedNote') }}</div>
            <div v-if="article.html" class="wiki-prose prose dark:prose-invert max-w-none" v-html="article.html"></div>
            <p v-if="activeGenerating" class="thinking" role="status"><span></span>{{ t(activeEntry?.answer?.content ? 'chat.generating' : 'chat.thinking') }}</p>
            <div v-else-if="activeEntry?.answer?.content" class="article-end"><button type="button" class="copy-answer" @click="copyAnswer"><Check v-if="copied" :size="14" aria-hidden="true" /><Copy v-else :size="14" aria-hidden="true" />{{ t(copied ? 'chat.copied' : 'chat.copy') }}</button><span>{{ t('chat.wiki.endNote') }}</span></div>
          </template>
        </article>
      </div>
      <footer class="wiki-composer">
        <form @submit.prevent="handleSend">
          <label for="wiki-question"><Search :size="15" aria-hidden="true" />{{ t(busy ? 'chat.thinking' : 'chat.wiki.ask') }}</label>
          <div class="question-field"><textarea id="wiki-question" ref="textareaRef" v-model="inputText" rows="1" :placeholder="t(budgetExhausted ? 'chat.exhaustedPlaceholder' : 'chat.placeholder')" :disabled="busy || budgetExhausted" @input="autoResize" @keydown="handleKeydown"></textarea><button class="explore-button" type="submit" :disabled="!canSend">{{ t('chat.send') }}<ArrowRight :size="15" aria-hidden="true" /></button></div>
        </form>
        <div class="composer-meta"><p :class="{ warning: budgetExhausted }">{{ t(budgetExhausted ? 'chat.exhaustedHint' : 'chat.hint') }}</p><span><kbd>Enter</kbd> {{ t('chat.send') }} · <kbd>Shift + Enter</kbd> {{ t('chat.newLine') }}</span></div>
      </footer>
    </main>

    <aside class="wiki-outline" :aria-label="t('chat.wiki.contents')">
      <div class="outline-title">{{ t('chat.wiki.contents') }}<span>{{ outline.length.toString().padStart(2, '0') }}</span></div>
      <nav><a v-for="heading in outline" :key="heading.id" :href="`#${heading.id}`" :class="{ nested: heading.level > 2 }" @click.prevent="jumpTo(heading.id)">{{ heading.text }}</a></nav>
      <div class="page-note"><p class="note-title">{{ t('chat.wiki.aboutPage') }}</p><dl><div><dt>{{ t('chat.wiki.contentType') }}</dt><dd>{{ t(home ? 'chat.wiki.guide' : 'chat.wiki.aiAnswer') }}</dd></div><div><dt>{{ t('chat.wiki.model') }}</dt><dd>DeepSeek</dd></div></dl><p>{{ t('chat.wiki.sideNote') }}</p></div>
    </aside>
    <p class="sr-only" role="status" aria-live="polite">{{ copyFeedback }}</p>
  </div>
</template>

<style scoped>
.wiki-page { height: calc(100vh - 60px); height: calc(100dvh - 60px); max-width: 1480px; margin: 0 auto; display: grid; grid-template-columns: 186px minmax(0, 1fr) 175px; column-gap: 36px; padding: 0 32px; color: var(--color-text); background: var(--color-bg); }
button { font: inherit; cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .45; }
.wiki-sidebar { min-height: 0; display: flex; flex-direction: column; padding: 32px 0 18px; overflow-y: auto; }
.wiki-wordmark { display: flex; align-items: center; gap: 10px; color: var(--color-text-heading); margin-bottom: 32px; }
.wiki-wordmark > div { display: flex; flex-direction: column; }
.wiki-wordmark span { font-family: var(--font-display); font-size: 22px; letter-spacing: .08em; line-height: 1.4; }
.wiki-wordmark small { font-size: 8px; letter-spacing: .13em; color: var(--color-text-muted); margin-top: 3px; }
.nav-caption, .history-heading { color: var(--color-text-muted); font-size: 11px; margin: 0 0 12px; }
.nav-home { display: flex; align-items: center; gap: 9px; padding: 9px 10px; border: 0; background: transparent; font-size: 13px; text-align: left; color: var(--color-text-secondary); }
.nav-home.selected { color: var(--color-primary); background: var(--color-bg-alt); font-weight: 600; }
.section-nav { display: flex; flex-direction: column; gap: 12px; padding: 17px 0 22px 34px; }
.section-nav a { font-size: 12px; color: var(--color-text-secondary); }
.history-heading { display: flex; justify-content: space-between; border-top: 1px solid var(--color-border-light); padding-top: 20px; }
.history-heading > :last-child { font-size: 10px; font-variant-numeric: tabular-nums; }
.history-empty { margin: 0; font-size: 11px; line-height: 1.9; color: var(--color-text-muted); }
.entry-nav { display: flex; flex-direction: column; gap: 6px; }
.entry-nav button { display: flex; align-items: center; justify-content: space-between; gap: 8px; text-align: left; color: var(--color-text-secondary); font-size: 12px; background: transparent; border: 0; padding: 8px 9px; }
.entry-nav button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.entry-nav button svg { flex-shrink: 0; }
.entry-nav button.selected { color: var(--color-primary); background: var(--color-bg-alt); }
.sidebar-foot { margin-top: auto; padding-top: 30px; display: flex; align-items: center; gap: 7px; color: var(--color-text-muted); font-size: 10px; }
.sidebar-foot > span:last-child { color: var(--color-text-muted); opacity: .7; }
.model-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--color-primary); }
.wiki-column { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.wiki-toolbar { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 68px; border-bottom: 1px solid var(--color-border-light); }
.breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--color-text-muted); }
.breadcrumbs > button:not(.icon-button) { border: 0; padding: 0; background: transparent; color: var(--color-primary); }
.new-exploration { display: flex; align-items: center; gap: 5px; border: 0; padding: 5px 0; background: transparent; color: var(--color-text-secondary); font-size: 11px; white-space: nowrap; }
.wiki-reading { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.wiki-article { padding: 25px 16px 30px 0; overflow-wrap: anywhere; }
.article-label { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: var(--color-text-muted); margin-bottom: 9px; }
.article-label > :first-child { color: var(--color-primary); }
.wiki-article h1 { font-family: var(--font-display); color: var(--color-text-heading); font-weight: 500; font-size: 33px; line-height: 1.45; margin: 0; padding-bottom: 13px; border-bottom: 1px solid var(--color-border); }
.article-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 10px; color: var(--color-text-muted); margin-top: 9px; margin-bottom: 25px; }
.wiki-notice { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: var(--color-bg-alt); border: 1px solid var(--color-border-light); border-left: 3px solid var(--color-primary); }
.wiki-notice > svg { margin-top: 3px; color: var(--color-primary); flex-shrink: 0; }
.wiki-notice p { margin: 0; font-size: 12px; line-height: 1.9; color: var(--color-text-secondary); }
.wiki-notice strong { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-heading); margin-bottom: 3px; }
.home-section { margin-top: 28px; }
.home-section h2 { font-family: var(--font-display); font-size: 22px; line-height: 1.5; font-weight: 500; color: var(--color-text-heading); margin: 0 0 12px; padding-bottom: 6px; border-bottom: 1px solid var(--color-border-light); scroll-margin-top: 15px; }
.home-section > p, .getting-started { font-size: 13px; line-height: 1.95; color: var(--color-text); margin: 0; }
.topic-index { margin-top: 16px; border: 1px solid var(--color-border); }
.topic-index-heading { padding: 8px 13px; background: var(--color-bg-alt); font-size: 11px; color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); }
.topic-row { display: grid; grid-template-columns: 25px 84px minmax(0, 1fr); align-items: start; gap: 8px; padding: 12px 13px; border-bottom: 1px solid var(--color-border-light); }
.topic-row:last-child { border-bottom: 0; }
.topic-id { font-size: 10px; line-height: 2; color: var(--color-text-muted); }
.topic-row strong { font-size: 12px; font-weight: 500; color: var(--color-text-heading); line-height: 1.8; }
.topic-row button { display: flex; justify-content: space-between; align-items: center; gap: 8px; text-align: left; border: 0; padding: 0; color: var(--color-primary); background: transparent; font-size: 12px; line-height: 1.8; }
.topic-row button:hover:not(:disabled) { text-decoration: underline; }
.topic-row button svg { flex-shrink: 0; }
.getting-started { padding-left: 22px; }
.getting-started li { padding-left: 4px; margin: 5px 0; }
.reading-notes > p { color: var(--color-text-secondary); font-size: 12px; }
.generated-note { color: var(--color-text-muted); font-size: 11px; line-height: 1.8; padding-bottom: 22px; }
.wiki-prose { font-size: 14px; line-height: 1.95; overflow-wrap: anywhere; --tw-prose-body: var(--color-text); --tw-prose-headings: var(--color-text-heading); --tw-prose-links: var(--color-primary); --tw-prose-bold: var(--color-text-heading); --tw-prose-code: var(--color-text); --tw-prose-counters: var(--color-text-secondary); --tw-prose-bullets: var(--color-text-muted); }
.wiki-prose :deep(> :first-child) { margin-top: 0; }
.wiki-prose :deep(h2), .wiki-prose :deep(h3) { font-family: var(--font-display); font-weight: 500; scroll-margin-top: 16px; }
.wiki-prose :deep(h2) { font-size: 23px; padding-bottom: 7px; border-bottom: 1px solid var(--color-border-light); }
.wiki-prose :deep(h3) { font-size: 19px; }
.wiki-prose :deep(pre) { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 2px; font-size: 12px; background: var(--color-bg-alt); color: var(--color-text); }
.wiki-prose :deep(table) { display: block; overflow-x: auto; }
.wiki-prose :deep(img) { max-width: 100%; height: auto; }
.article-end { display: flex; justify-content: space-between; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 32px; padding-top: 14px; border-top: 1px solid var(--color-border-light); font-size: 10px; color: var(--color-text-muted); }
.copy-answer { display: flex; align-items: center; gap: 6px; border: 0; padding: 0; background: transparent; color: var(--color-primary); font-size: 11px; }
.thinking { display: flex; align-items: center; gap: 9px; font-size: 12px; color: var(--color-text-muted); }
.thinking > span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-primary); animation: pulse 1.2s infinite; }
.request-error { color: var(--color-accent); background: var(--color-bg-alt); border-left: 2px solid var(--color-accent); padding: 12px; white-space: pre-wrap; font-size: 12px; }
.wiki-composer { flex-shrink: 0; padding: 15px 0 17px; border-top: 1px solid var(--color-border); background: var(--color-bg); }
.wiki-composer label { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--color-text-secondary); margin-bottom: 10px; }
.question-field { display: flex; align-items: flex-end; gap: 12px; padding: 10px 11px 10px 13px; border: 1px solid var(--color-border); border-radius: 3px; background: var(--color-bg-card); }
.question-field:focus-within { border-color: var(--color-primary); }
.question-field textarea { flex: 1; min-width: 0; border: 0; background: transparent; resize: none; min-height: 28px; max-height: 120px; color: var(--color-text); font: inherit; font-size: 13px; line-height: 1.9; outline: none; padding: 0; }
.question-field textarea:focus-visible { outline: none; }
.question-field textarea::placeholder { color: var(--color-text-muted); }
.explore-button { display: flex; align-items: center; gap: 8px; flex-shrink: 0; border: 1px solid var(--color-primary); background: var(--color-primary); color: #fff; padding: 6px 11px; font-size: 11px; border-radius: 2px; }
.composer-meta { display: flex; justify-content: space-between; align-items: center; gap: 10px; color: var(--color-text-muted); font-size: 9px; margin-top: 9px; }
.composer-meta p { margin: 0; }
.composer-meta > span { white-space: nowrap; }
.composer-meta .warning { color: var(--color-accent); }
kbd { font: inherit; }
.wiki-outline { overflow-y: auto; min-height: 0; padding: 39px 0 20px; }
.outline-title { display: flex; justify-content: space-between; padding-bottom: 12px; font-size: 12px; color: var(--color-text-heading); border-bottom: 1px solid var(--color-border-light); }
.outline-title span { font-size: 9px; color: var(--color-text-muted); }
.wiki-outline nav { display: flex; flex-direction: column; gap: 12px; padding: 18px 0 18px 13px; border-left: 1px solid var(--color-border); margin-top: 16px; }
.wiki-outline nav a { color: var(--color-text-secondary); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.wiki-outline nav a:hover { color: var(--color-primary); }
.wiki-outline nav a.nested { padding-left: 12px; font-size: 10px; }
.page-note { margin-top: 38px; padding-top: 15px; border-top: 1px solid var(--color-border-light); }
.note-title { margin: 0 0 15px; color: var(--color-text-heading); font-size: 11px; }
.page-note dl { margin: 0; font-size: 10px; }
.page-note dl > div { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; }
.page-note dt { color: var(--color-text-muted); }
.page-note dd { margin: 0; color: var(--color-text-secondary); }
.page-note > p:last-child { margin-top: 16px; font-size: 10px; line-height: 1.9; color: var(--color-text-muted); }
.mobile-outline, .mobile-toggle, .mobile-close, .nav-backdrop { display: none; }
.icon-button { border: 0; background: transparent; color: var(--color-text-secondary); padding: 5px; }
:global(html.dark .explore-button) { color: #0e1722; }
@keyframes pulse { 50% { opacity: .3; } }
@media (max-width: 1100px) { .wiki-page { grid-template-columns: 162px minmax(0,1fr); column-gap: 26px; padding: 0 24px; } .wiki-outline { display: none; } .mobile-outline { display: block; margin-bottom: 22px; border: 1px solid var(--color-border-light); padding: 10px 13px; color: var(--color-text-secondary); font-size: 12px; } .mobile-outline summary { cursor: pointer; } .mobile-outline nav { display: flex; flex-direction: column; gap: 9px; padding-top: 13px; } }
@media (max-width: 700px) {
  .wiki-page { position: relative; display: flex; padding: 0 19px; }
  .wiki-column { width: 100%; }
  .wiki-toolbar { min-height: 56px; gap: 8px; }
  .mobile-toggle { display: inline-flex; margin-left: -5px; }
  .wiki-sidebar { display: none; }
  .wiki-sidebar.is-open { display: flex; position: absolute; top: 0; bottom: 0; left: 0; z-index: 60; width: min(290px, 86vw); padding: 25px 22px; background: var(--color-bg-card); border-right: 1px solid var(--color-border); }
  .wiki-wordmark { gap: 9px; }
  .mobile-close { display: inline-flex; margin-left: auto; }
  .nav-backdrop { display: block; position: absolute; inset: 0; z-index: 50; background: rgb(0 0 0 / 20%); }
  .wiki-article { padding: 20px 8px 25px 0; }
  .wiki-article h1 { font-size: 28px; }
  .article-meta { font-size: 9px; margin-bottom: 20px; }
  .article-label { font-size: 9px; }
  .home-section { margin-top: 25px; }
  .home-section h2 { font-size: 21px; }
  .wiki-notice { padding: 12px; gap: 9px; }
  .wiki-notice p { font-size: 11px; }
  .topic-row { grid-template-columns: 20px minmax(0,1fr); padding: 11px; gap: 3px 7px; }
  .topic-row button { grid-column: 2; font-size: 11px; }
  .topic-row strong { font-size: 12px; }
  .home-section > p, .getting-started, .wiki-prose { font-size: 12px; }
  .composer-meta > span { display: none; }
  .composer-meta { font-size: 8px; }
  .wiki-composer { padding-bottom: max(12px, env(safe-area-inset-bottom)); }
  .question-field { gap: 7px; padding: 9px 8px 9px 10px; }
  .question-field textarea { font-size: 12px; }
  .explore-button { padding: 5px 8px; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) { .thinking > span { animation: none; } }
</style>
