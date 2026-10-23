<script setup lang="ts">
defineProps({
  img: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: '' },
  bio: { type: String, default: '' },
  badge: { type: String, default: '' },
})
</script>

<template>
  <article class="member-entry">
    <img :src="img" :alt="name" loading="lazy" width="76" height="90" />
    <div class="member-content">
      <p v-if="badge" class="member-badge">{{ badge }}</p>
      <h3>{{ name }}</h3>
      <p v-if="role" class="member-role">{{ role }}</p>
      <p v-if="bio" class="member-bio">{{ bio }}</p>
    </div>
  </article>
</template>

<style scoped>
.member-entry {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding: 23px 0;
  border-bottom: 1px solid var(--color-border-light);
  min-width: 0;
}
.member-entry > img {
  width: 76px;
  height: 90px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}
.member-content {
  min-width: 0;
  overflow-wrap: anywhere;
}
.member-content h3 {
  margin: 0 0 5px;
  font: 500 21px/1.4 var(--font-display);
  color: var(--color-text-heading);
}
.member-badge {
  display: inline-block;
  margin: 0 0 8px;
  padding: 1px 6px;
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-size: 9px;
  line-height: 1.8;
}
.member-role {
  margin: 0 0 9px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.member-bio {
  margin: 0;
  font-size: 12px;
  line-height: 1.9;
  color: var(--color-text-secondary);
}
@media (max-width: 700px) {
  .member-content h3 {
    font-size: 20px;
  }
}
</style>
