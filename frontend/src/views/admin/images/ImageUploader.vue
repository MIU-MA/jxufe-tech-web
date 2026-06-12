<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ token: string }>()

interface ImageInfo { name: string; size: number; url: string }

const images = ref<ImageInfo[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadMsg = ref('')
const copied = ref('')

// ====== 加载图片库 ======
async function loadImages() {
  loading.value = true
  try {
    const res = await fetch('/api/upload/images')
    const json = await res.json()
    images.value = json.data || []
  } catch { /* ignore */ }
  finally { loading.value = false }
}

// ====== 上传图片 ======
const fileInput = ref<HTMLInputElement>()

async function handleUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 校验类型
  if (!file.type.startsWith('image/')) {
    uploadMsg.value = '只支持图片文件（jpg/png/webp/gif）'
    return
  }

  uploading.value = true; uploadMsg.value = ''
  try {
    const form = new FormData()
    form.append('image', file)
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${props.token}` },
      body: form,
    })
    if (!res.ok) throw new Error('上传失败')
    const json = await res.json()
    uploadMsg.value = `上传成功: ${json.url}`
    target.value = '' // 清空 input
    await loadImages()
  } catch {
    uploadMsg.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

// ====== 复制 URL ======
function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
  copied.value = url
  setTimeout(() => copied.value = '', 2000)
}

// ====== 删除图片 ======
async function deleteImage(filename: string) {
  if (!confirm('确定删除该图片？')) return
  try {
    await fetch(`/api/upload/image/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${props.token}` },
    })
    await loadImages()
  } catch { /* ignore */ }
}

// ====== 格式化文件大小 ======
function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(loadImages)
</script>

<template>
  <div
    class="rounded-xl p-7 mb-6 shadow-sm"
    :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 2px 12px var(--color-shadow)' }"
  >
    <h2 class="m-0 mb-5 text-[1.15em]" :style="{ color: 'var(--color-text-heading)' }">🖼 图片管理</h2>

    <!-- 上传区域 -->
    <div class="mb-5">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleUpload"
      >
      <button
        :disabled="uploading"
        class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--color-primary)' }"
        @click="fileInput?.click()"
      >{{ uploading ? '上传中…' : '上传图片' }}</button>
      <span v-if="uploadMsg" class="ml-4 text-sm" :class="uploadMsg.startsWith('上传成功') ? 'text-green-600' : 'text-[#c0392b]'">{{ uploadMsg }}</span>
    </div>

    <!-- 图片库 -->
    <div v-if="loading" class="text-center py-6" :style="{ color: 'var(--color-text-muted)' }">加载中…</div>
    <div v-else-if="images.length === 0" class="text-center py-6" :style="{ color: 'var(--color-text-muted)' }">暂无上传的图片</div>
    <div v-else class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))">
      <div
        v-for="img in images" :key="img.name"
        class="rounded-lg border overflow-hidden group relative"
        :style="{ borderColor: 'var(--color-border)' }"
      >
        <img :src="img.url" :alt="img.name" class="w-full h-[120px] object-cover">
        <div class="p-2">
          <p class="text-xs truncate mb-1" :title="img.url" :style="{ color: 'var(--color-text-secondary)' }">{{ img.name }}</p>
          <p class="text-xs mb-2" :style="{ color: 'var(--color-text-muted)' }">{{ fmtSize(img.size) }}</p>
          <div class="flex gap-1.5">
            <button
              class="flex-1 text-xs border-none rounded py-1 cursor-pointer transition-opacity hover:opacity-75"
              :style="{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-primary)' }"
              @click="copyUrl(img.url)"
            >{{ copied === img.url ? '已复制 ✓' : '复制 URL' }}</button>
            <button
              class="text-xs border-none rounded py-1 px-2 cursor-pointer transition-opacity hover:opacity-75"
              style="background-color: #fef2f2; color: #c0392b"
              @click="deleteImage(img.name)"
            >🗑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
