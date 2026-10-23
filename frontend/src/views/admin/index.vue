<script setup lang="ts">
import { ref, onMounted, provide, type Component } from 'vue'
import { FileText, Image, LogOut } from 'lucide-vue-next'
import { decodeJwtExp } from '../../api/adminAuth'
import AdminLogin from './AdminLogin.vue'
import ArticlesPanel from './articles/ArticlesPanel.vue'
import ImagesPanel from './images/ImagesPanel.vue'

interface Tab {
  key: string
  label: string
  icon: string
  panel: Component
}
const tabs: Tab[] = [
  { key: 'articles', label: '文章管理', icon: 'FileText', panel: ArticlesPanel },
  { key: 'images', label: '图片管理', icon: 'Image', panel: ImagesPanel },
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
  if (saved) {
    const exp = decodeJwtExp(saved)
    if (exp !== null && exp <= Date.now()) {
      localStorage.removeItem('admin_token')
      loginError.value = '登录已过期，请重新登录'
    } else {
      token.value = saved
    }
  }

  const msg = sessionStorage.getItem('admin-logout-msg')
  if (msg) {
    loginError.value = msg
    sessionStorage.removeItem('admin-logout-msg')
  }
})

async function onLogin(username: string, password: string) {
  loginLoading.value = true
  loginError.value = ''
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
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
  sessionStorage.removeItem('admin-logout-msg')
}
</script>

<template>
  <div class="admin-shell">
    <AdminLogin v-if="!token" :loading="loginLoading" :error="loginError" @login="onLogin" />
    <div v-else class="admin-layout">
      <aside class="admin-nav">
        <div class="admin-nav-heading">
          <p>DSA / ADMIN</p>
          <h1>内容管理</h1>
        </div>
        <nav>
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            :class="{ selected: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="getTabIcon(tab.icon)" :size="16" aria-hidden="true" />{{ tab.label }}
          </button>
        </nav>
        <button class="admin-logout" type="button" @click="logout">
          <LogOut :size="15" aria-hidden="true" />退出登录
        </button>
      </aside>
      <main class="admin-main">
        <header>
          <p class="ed-kicker">CONTENT MANAGEMENT</p>
          <h2>{{ tabs.find((tab) => tab.key === activeTab)?.label }}</h2>
        </header>
        <component :is="tabs.find((tab) => tab.key === activeTab)?.panel" :key="activeTab" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: calc(100vh - 60px);
  background: var(--color-bg);
}
.admin-layout {
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 186px minmax(0, 1fr);
  gap: 36px;
  padding: 0 32px;
  min-height: calc(100vh - 60px);
}
.admin-nav {
  padding: 34px 0;
  display: flex;
  flex-direction: column;
}
.admin-nav-heading {
  margin-bottom: 25px;
}
.admin-nav-heading p {
  margin: 0 0 8px;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--color-text-muted);
}
.admin-nav-heading h1 {
  margin: 0;
  font: 500 23px/1.5 var(--font-display);
  color: var(--color-text-heading);
}
.admin-nav nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.admin-nav button {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 11px;
  font: inherit;
  font-size: 12px;
  background: transparent;
  border: 0;
  color: var(--color-text-secondary);
  text-align: left;
  cursor: pointer;
}
.admin-nav button.selected {
  color: var(--color-primary);
  background: var(--color-bg-alt);
  border-left: 2px solid var(--color-primary);
  padding-left: 9px;
}
.admin-nav .admin-logout {
  margin-top: auto;
  border-top: 1px solid var(--color-border-light);
  padding-top: 20px;
}
.admin-main {
  min-width: 0;
  padding: 30px 0 45px;
}
.admin-main > header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 18px;
  margin-bottom: 25px;
}
.admin-main > header h2 {
  margin: 0;
  font: 500 29px/1.5 var(--font-display);
  color: var(--color-text-heading);
}
@media (max-width: 700px) {
  .admin-layout {
    display: block;
    padding: 0 20px;
  }
  .admin-nav {
    padding: 22px 0 15px;
    border-bottom: 1px solid var(--color-border);
  }
  .admin-nav-heading {
    margin-bottom: 16px;
  }
  .admin-nav nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .admin-nav .admin-logout {
    margin-top: 10px;
    padding-top: 10px;
  }
  .admin-main {
    padding-top: 24px;
  }
}
</style>
