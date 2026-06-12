<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Article } from '../../../api/articles'

const props = defineProps<{
  mode: 'create' | 'edit'
  article?: Article | null
  saving?: boolean
  error?: string
}>()

const emit = defineEmits<{
  save: [{ title: string; content: string; summary: string | null; publishedAt: string | null }]
  cancel: []
}>()

const title = ref('')
const content = ref('')
const summary = ref('')
const publishedAt = ref('')

// edit 模式下同步文章数据
watch(() => props.article, (a) => {
  if (props.mode === 'edit' && a) {
    title.value = a.title
    content.value = a.content
    summary.value = a.summary || ''
    publishedAt.value = a.publishedAt ? new Date(a.publishedAt).toISOString().slice(0, 16) : ''
  }
}, { immediate: true })

// create 模式下清空
watch(() => props.mode, (m) => {
  if (m === 'create') { title.value = ''; content.value = ''; summary.value = ''; publishedAt.value = '' }
})

function handleSave() {
  if (!title.value.trim() || !content.value.trim()) return
  emit('save', {
    title: title.value.trim(),
    content: content.value,
    summary: summary.value.trim() || null,
    publishedAt: publishedAt.value ? new Date(publishedAt.value).toISOString() : null,
  })
}
</script>

<template>
  <div
    class="rounded-xl p-7 mb-6 shadow-sm"
    :class="{ 'border-l-4': mode === 'edit' }"
    :style="{
      backgroundColor: 'var(--color-bg-card)',
      boxShadow: '0 2px 12px var(--color-shadow)',
      ...(mode === 'edit' ? { borderLeftColor: 'var(--color-accent)' } : {})
    }"
  >
    <h2 class="m-0 mb-5 text-[1.15em]" :style="{ color: 'var(--color-text-heading)' }">
      {{ mode === 'create' ? '新建文章' : `编辑文章 #${article?.id ?? ''}` }}
    </h2>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="mb-[18px]">
        <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">标题</label>
        <input
          v-model="title" placeholder="文章标题" :disabled="saving"
          class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] transition-colors duration-200 focus:outline-none"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)', fontFamily: 'inherit' }"
        >
      </div>

      <div class="mb-[18px]">
        <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">
          发布时间
          <span class="font-normal text-[0.85em]" :style="{ color: 'var(--color-text-muted)' }">（不填则使用当前时间）</span>
        </label>
        <input
          v-model="publishedAt" type="datetime-local" :disabled="saving"
          class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] transition-colors duration-200 focus:outline-none"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)', fontFamily: 'inherit' }"
        >
      </div>
    </div>

    <div class="mb-[18px]">
      <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">
        摘要 <span class="font-normal text-[0.85em]" :style="{ color: 'var(--color-text-muted)' }">（不填则自动截取正文前100字）</span>
      </label>
      <input
        v-model="summary" placeholder="文章摘要（可选）" :disabled="saving"
        class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] transition-colors duration-200 focus:outline-none"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)', fontFamily: 'inherit' }"
      >
    </div>

    <div class="mb-[18px]">
      <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">
        内容 <span class="font-normal text-[0.85em]" :style="{ color: 'var(--color-text-muted)' }">（Markdown 格式）</span>
      </label>
      <textarea
        v-model="content" placeholder="在此编写 Markdown 内容…" :disabled="saving" rows="14"
        class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] font-mono leading-relaxed resize-y min-h-[240px] transition-colors duration-200 focus:outline-none"
        :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)' }"
      ></textarea>
    </div>

    <p v-if="error" class="text-[#c0392b] text-[0.9em] mt-1">{{ error }}</p>

    <div class="flex gap-3 items-center mt-5">
      <button
        :disabled="saving"
        class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--color-primary)' }"
        @click="handleSave"
      >{{ saving ? '保存中…' : (mode === 'create' ? '发布文章' : '保存修改') }}</button>
      <button
        class="bg-transparent border rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer transition-all duration-200"
        :style="{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }"
        @click="emit('cancel')"
      >取消</button>
    </div>
  </div>
</template>
