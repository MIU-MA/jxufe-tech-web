<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ token: string }>()
const emit = defineEmits<{ done: [] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const selectedName = ref('')
const msg = ref('')
const ok = ref(false)

function triggerFile() {
  fileInput.value?.click()
}

async function handleUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedName.value = file.name

  if (!file.name.endsWith('.md')) {
    msg.value = '只支持 .md 文件'; ok.value = false; target.value = ''
    return
  }

  uploading.value = true; msg.value = ''; ok.value = false
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload/markdown', {
      method: 'POST',
      headers: { Authorization: `Bearer ${props.token}` },
      body: form,
    })
    const json = await res.json()
    if (!res.ok) {
      msg.value = json.message || `上传失败 (${res.status})`; ok.value = false
      return
    }
    msg.value = `✅ 文章「${json.article.title}」已创建（ID: ${json.article.id}）`
    ok.value = true
    target.value = ''
    emit('done')
  } catch (err: any) {
    msg.value = `请求失败: ${err.message || '请检查后端是否启动'}`
    ok.value = false
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div
    class="rounded-xl p-7 mb-6 shadow-sm"
    :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 2px 12px var(--color-shadow)' }"
  >
    <h2 class="m-0 mb-5 text-[1.15em]" :style="{ color: 'var(--color-text-heading)' }">📄 Markdown 文件上传</h2>

    <p class="text-sm mb-4" :style="{ color: 'var(--color-text-muted)' }">
      上传 .md 文件将自动创建文章。文件名即为文章标题，文件内容为文章正文。
    </p>

    <input
      ref="fileInput"
      type="file"
      accept=".md"
      :disabled="uploading"
      class="hidden"
      @change="handleUpload"
    >
    <div class="flex items-center gap-3">
      <button
        :disabled="uploading"
        class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--color-primary)' }"
        @click="triggerFile"
      >{{ uploading ? '上传中…' : '选择 .md 文件' }}</button>
      <span class="text-sm" :style="{ color: 'var(--color-text-muted)' }">{{ selectedName || '未选择文件' }}</span>
    </div>

    <p v-if="msg" class="text-sm mt-3" :class="ok ? 'text-green-600' : 'text-[#c0392b]'">{{ msg }}</p>
  </div>
</template>
