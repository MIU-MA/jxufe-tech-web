<script setup lang="ts">
defineProps({
  img: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: '' },
  bio: { type: String, default: '' },
  badge: { type: String, default: '' }
})
</script>

<template>
  <div class="member-card">
    <div v-if="badge" class="position-badge">{{ badge }}</div>

    <img :src="img" :alt="name + ' 肖像'" class="member-photo">

    <h3>{{ name }}</h3>
    <span v-if="role" class="member-role">{{ role }}</span>
    <p v-if="bio" class="member-bio">{{ bio }}</p>
  </div>
</template>

<style scoped>
.member-card {
  background: var(--color-bg-card);
  position: relative;
  border-radius: 16px;
  padding: 40px 20px 30px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px var(--color-shadow), 0 10px 15px -3px var(--color-shadow);
  border: 1px solid var(--color-border-light);
}

.member-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px var(--color-shadow);
}

.position-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 16px 0 16px 0;
  font-size: 0.85em;
  font-weight: 600;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.member-card h3 {
  color: var(--color-text-heading);
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.member-role {
  color: var(--color-accent);
  font-weight: 700;
  display: block;
  margin-bottom: 15px;
  font-size: 0.95em;
}

.member-bio {
  padding: 15px;
  font-size: 0.92em;
  color: var(--color-text-secondary);
  line-height: 1.6;
  background-color: var(--color-bg-alt);
  border-radius: 8px;
  text-align: center;
}
</style>
