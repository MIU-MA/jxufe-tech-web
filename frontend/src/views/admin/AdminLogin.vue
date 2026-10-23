<script setup lang="ts">
import { RouterLink } from 'vue-router'

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
  <main class="admin-login-layout">
    <div class="admin-login-intro">
      <p class="ed-kicker">DSA / CONTENT MANAGEMENT</p>
      <h1>内容管理</h1>
      <p>管理协会的文章与图片，<br />记录每一次分享与探索。</p>
      <RouterLink to="/" class="ed-link">← 返回网站首页</RouterLink>
    </div>
    <form class="admin-login-form" @submit.prevent="emit('login', username, password)">
      <h2>管理员登录</h2>
      <p class="admin-login-hint">请使用管理员账号登录</p>
      <div class="admin-field">
        <label for="admin-username">用户名</label
        ><input
          id="admin-username"
          v-model="username"
          type="text"
          placeholder="admin"
          autocomplete="username"
          :disabled="loading"
        />
      </div>
      <div class="admin-field">
        <label for="admin-password">密码</label
        ><input
          id="admin-password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          :disabled="loading"
        />
      </div>
      <button class="ed-button" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登录后台' }}<span aria-hidden="true">→</span>
      </button>
      <p v-if="error" class="admin-login-error" role="alert">{{ error }}</p>
    </form>
  </main>
</template>

<style scoped>
.admin-login-layout {
  width: min(820px, 100%);
  min-height: calc(100vh - 60px);
  margin: 0 auto;
  padding: 70px 30px;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 55px;
}
.admin-login-intro h1 {
  font: 500 34px/1.5 var(--font-display);
  color: var(--color-text-heading);
  margin: 14px 0 18px;
}
.admin-login-intro > p:not(.ed-kicker) {
  font-size: 13px;
  line-height: 2;
  color: var(--color-text-secondary);
  margin-bottom: 25px;
}
.admin-login-form {
  padding: 26px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-bg-card);
}
.admin-login-form h2 {
  margin: 0 0 8px;
  font: 500 23px/1.5 var(--font-display);
  color: var(--color-text-heading);
}
.admin-login-hint {
  margin: 0 0 24px;
  color: var(--color-text-muted);
  font-size: 11px;
}
.admin-field {
  margin-bottom: 18px;
}
.admin-field label {
  display: block;
  margin-bottom: 7px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.admin-field input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  padding: 10px 12px;
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
  font-size: 13px;
}
.admin-login-form .ed-button {
  width: 100%;
  justify-content: space-between;
  margin-top: 5px;
}
.admin-login-error {
  font-size: 12px;
  color: var(--color-accent);
  line-height: 1.8;
}
@media (max-width: 650px) {
  .admin-login-layout {
    display: block;
    padding: 35px 20px;
  }
  .admin-login-intro {
    margin-bottom: 27px;
  }
  .admin-login-intro h1 {
    font-size: 29px;
  }
  .admin-login-form {
    padding: 22px;
  }
}
</style>
