<script setup lang="ts">
import { ref, onMounted, provide, type Component } from 'vue'
import { FileText, Image, LogOut } from 'lucide-vue-next'
import AdminLogin from './AdminLogin.vue'
import ArticlesPanel from './articles/ArticlesPanel.vue'
import ImagesPanel from './images/ImagesPanel.vue'

interface Tab { key: string; label: string; icon: string; panel: Component }
const tabs: Tab[] = [
  { key: 'articles', label: '文章管理', icon: 'FileText', panel: ArticlesPanel },
  { key: 'images',   label: '图片管理', icon: 'Image', panel: ImagesPanel  },
]
function getTabIcon(iconName: string) {
  const map: Record<string, any> = { FileText, Image }
  return map[iconName]
}
const activeTab = ref('articles')

const token = ref('')
provide('token', token)

const loginLoading = ref(false)
const loginError = ref('')

onMounted(() => {
  const saved = localStorage.getItem('admin_token')
  if (saved) token.value = saved
})

async function onLogin(username: string, password: string) {
  loginLoading.value = true; loginError.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!res.ok) throw new Error('登录失败')
    const data = await res.json()
    token.value = data.access_token
    localStorage.setItem('admin_token', data.access_token)
  } catch {
    loginError.value = '登录失败，请检查用户名和密码'
  } finally {
    loginLoading.value = false
  }
}

function logout() {
  token.value = ''
  localStorage.removeItem('admin_token')
}
</script>

<template>
  <div class="min-h-[calc(100vh-60px)]" :style="{ background: 'var(--color-bg)' }">

    <AdminLogin v-if="!token" :loading="loginLoading" :error="loginError" @login="onLogin" />

    <div v-else class="flex min-h-[calc(100vh-60px)]">
      <aside
        class="w-[220px] shrink-0 flex flex-col border-r transition-colors duration-300"
        :style="{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }"
      >
        <div class="px-5 py-6 border-b" :style="{ borderColor: 'var(--color-border)' }">
          <h1 class="m-0 text-lg font-bold" :style="{ color: 'var(--color-text-heading)' }">管理后台</h1>
        </div>

        <nav class="flex-1 py-4 px-3">
          <button
            v-for="tab in tabs" :key="tab.key"
            class="w-full text-left flex items-center gap-3 px-4 py-3 mb-1 rounded-lg border-none cursor-pointer transition-all duration-200 text-[0.95em]"
            :style="activeTab === tab.key
              ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
              : { backgroundColor: 'transparent', color: 'var(--color-text-secondary)' }"
            @click="activeTab = tab.key"
          >
            <component :is="getTabIcon(tab.icon)" :size="20" />
            {{ tab.label }}
          </button>
        </nav>

        <div class="px-3 py-4 border-t" :style="{ borderColor: 'var(--color-border)' }">
          <button
            class="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border-none cursor-pointer transition-all duration-200 text-[0.95em] hover:bg-[#fef2f2] hover:text-[#c0392b]"
            :style="{ backgroundColor: 'transparent', color: 'var(--color-text-muted)' }"
            @click="logout"
          >
            <LogOut :size="20" />
            退出登录
          </button>
        </div>
      </aside>

      <main class="flex-1 overflow-auto p-6 md:p-8">
        <component :is="tabs.find(t => t.key === activeTab)?.panel" :key="activeTab" />
      </main>
    </div>
  </div>
</template>
