<script setup lang="ts">
import type { Article } from '../../../api/articles'

defineProps<{ articles: Article[] }>()
const emit = defineEmits<{ edit: [article: Article]; delete: [article: Article] }>()

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function stripMd(md: string) { return md.replace(/[#*_~`>\[\]()!|-]/g, '').replace(/\n+/g, ' ').trim().slice(0, 80) }
</script>

<template>
  <div
    class="rounded-xl py-2 overflow-x-auto shadow-sm"
    :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 2px 12px var(--color-shadow)' }"
  >
    <table v-if="articles.length > 0" class="w-full border-collapse text-[0.92em]">
      <thead>
        <tr>
          <th class="text-left px-4 py-3.5 border-b-2 font-semibold text-[0.85em] whitespace-nowrap w-[50px]" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">ID</th>
          <th class="text-left px-4 py-3.5 border-b-2 font-semibold text-[0.85em] whitespace-nowrap min-w-[120px]" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">标题</th>
          <th class="text-left px-4 py-3.5 border-b-2 font-semibold text-[0.85em] whitespace-nowrap max-w-[260px] hidden sm:table-cell" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">内容预览</th>
          <th class="text-left px-4 py-3.5 border-b-2 font-semibold text-[0.85em] whitespace-nowrap min-w-[120px]" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">创建时间</th>
          <th class="text-left px-4 py-3.5 border-b-2 font-semibold text-[0.85em] whitespace-nowrap min-w-[110px]" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in articles" :key="a.id">
          <td class="px-4 py-3 border-b align-top w-[50px]" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }">{{ a.id }}</td>
          <td class="px-4 py-3 border-b align-top min-w-[120px] font-semibold" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-heading)' }">{{ a.title }}</td>
          <td class="px-4 py-3 border-b align-top max-w-[260px] truncate hidden sm:table-cell" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }">{{ stripMd(a.content) }}</td>
          <td class="px-4 py-3 border-b align-top min-w-[120px] whitespace-nowrap" :style="{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }">{{ formatDate(a.createdAt) }}</td>
          <td class="px-4 py-3 border-b align-top min-w-[110px] whitespace-nowrap" :style="{ borderColor: 'var(--color-border)' }">
            <button
              class="border-none rounded-md py-1 px-3.5 text-[0.85em] cursor-pointer mr-1.5 transition-opacity duration-200 hover:opacity-75"
              :style="{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-primary)' }"
              @click="emit('edit', a)"
            >编辑</button>
            <button
              class="border-none rounded-md py-1 px-3.5 text-[0.85em] cursor-pointer transition-opacity duration-200 hover:opacity-75"
              style="background-color: #fef2f2; color: #c0392b"
              @click="emit('delete', a)"
            >删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-center py-10" :style="{ color: 'var(--color-text-muted)' }">暂无文章，点击「新建文章」开始。</p>
  </div>
</template>
