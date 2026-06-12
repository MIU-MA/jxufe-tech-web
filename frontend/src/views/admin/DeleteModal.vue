<script setup lang="ts">
defineProps<{
  targetName: string
  deleting?: boolean
  error?: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-5" @click.self="emit('cancel')">
    <div
      class="max-w-[420px] w-full rounded-xl p-8 shadow-lg"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 8px 40px rgba(0,0,0,.15)' }"
    >
      <h3 class="m-0 mb-3" :style="{ color: 'var(--color-text-heading)' }">确认删除</h3>
      <p class="m-0 mb-2" :style="{ color: 'var(--color-text-secondary)' }">确定要删除文章 <strong>「{{ targetName }}」</strong> 吗？</p>
      <p class="m-0 mb-2 text-[0.88em]" :style="{ color: 'var(--color-text-muted)' }">此操作不可撤销。</p>
      <p v-if="error" class="text-[#c0392b] text-[0.9em] mt-1">{{ error }}</p>
      <div class="flex gap-3 items-center mt-5">
        <button
          :disabled="deleting"
          class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background-color: #c0392b"
          @click="emit('confirm')"
        >{{ deleting ? '删除中…' : '确认删除' }}</button>
        <button
          class="bg-transparent border rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer transition-all duration-200"
          :style="{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }"
          @click="emit('cancel')"
        >取消</button>
      </div>
    </div>
  </div>
</template>
