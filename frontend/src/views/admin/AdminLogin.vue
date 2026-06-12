<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{ login: [username: string, password: string] }>()

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-60px)] p-10">
    <form
      class="w-full max-w-[400px] rounded-2xl p-12 shadow-lg"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 4px 24px var(--color-shadow)' }"
      @submit.prevent="emit('login', username, password)"
    >
      <h1 class="text-center text-[1.6em] mb-2" :style="{ color: 'var(--color-text-heading)' }">管理后台</h1>
      <p class="text-center text-[0.9em] mb-7" :style="{ color: 'var(--color-text-muted)' }">请使用管理员账号登录</p>
      <div class="mb-[18px]">
        <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">用户名</label>
        <input
          v-model="username" placeholder="admin" autocomplete="username" :disabled="loading"
          class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] transition-colors duration-200 focus:outline-none"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)', fontFamily: 'inherit' }"
        >
      </div>
      <div class="mb-[18px]">
        <label class="block mb-1.5 font-semibold text-[0.9em]" :style="{ color: 'var(--color-text-secondary)' }">密码</label>
        <input
          v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" :disabled="loading"
          class="w-full box-border px-3.5 py-2.5 border rounded-lg text-[0.95em] transition-colors duration-200 focus:outline-none"
          :style="{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-heading)', fontFamily: 'inherit' }"
        >
      </div>
      <button
        type="submit" :disabled="loading"
        class="w-full border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--color-primary)' }"
      >{{ loading ? '登录中…' : '登 录' }}</button>
      <p v-if="error" class="text-[#c0392b] text-[0.9em] mt-3">{{ error }}</p>
    </form>
  </div>
</template>
