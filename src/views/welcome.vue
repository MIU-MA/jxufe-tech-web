<script setup>
</script>

<template>
  <main class="welcome-container">
    <h1 class="welcome-title">欢迎来到数智技术协会！</h1>
    <p class="welcome-text">
        招新群会等到新的一年再建立哦~
        我们随时欢迎你的到来！
    </p>
  </main>
</template>

<style scoped>
.welcome-container {
  max-width: 800px;
  height: 60vh;
  margin: 0 auto;
  padding: 40px 20px;
  background: var(--color-bg-card);
  border-radius: 8px;
  text-align: center;
  transition: background-color 0.3s ease;
}
.welcome-title {
  font-size: 2.5rem;
  color: var(--color-text-heading);
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.welcome-text {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
</style>