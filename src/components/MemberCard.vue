<script setup>
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
  background: white;
  position: relative;
  border-radius: 16px;
  padding: 40px 20px 30px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 58, 122, 0.05), 0 10px 15px -3px rgba(0, 58, 122, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.member-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 58, 122, 0.15);
}

.position-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #003a7a 0%, #0056b3 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 16px 0 16px 0;
  font-size: 0.85em;
  font-weight: 600;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.member-card h3 {
  color: #003a7a;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.member-role {
  color: #ff6f00;
  font-weight: 700;
  display: block;
  margin-bottom: 15px;
  font-size: 0.95em;
}

.member-bio {
  padding: 15px;
  font-size: 0.92em;
  color: #475569;
  line-height: 1.6;
  background-color: #f8fafc;
  border-radius: 8px;
  text-align: center;
}
</style>
