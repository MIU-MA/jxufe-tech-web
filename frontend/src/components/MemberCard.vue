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
  <div
    class="relative rounded-2xl pt-10 pb-8 px-5 text-center border transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl bg-[var(--color-bg-card)] [box-shadow:0_4px_6px_-1px_var(--color-shadow),0_10px_15px_-3px_var(--color-shadow)] border-[var(--color-border-light)]"
  >
    <div
      v-if="badge"
      class="absolute top-0 left-0 text-white py-1.5 px-4 rounded-tl-2xl rounded-br-2xl text-sm font-semibold bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-light))]"
    >
      {{ badge }}
    </div>

    <img
      :src="img" :alt="name + ' 肖像'"
      class="w-[140px] h-[140px] rounded-full object-cover mx-auto mb-5 border-4 shadow-md transition-all duration-300 hover:scale-105 border-[var(--color-border-light)]"
    >

    <h3 class="text-2xl mb-2 text-[var(--color-text-heading)]">{{ name }}</h3>
    <span v-if="role" class="font-bold block mb-4 text-[0.95em] text-[var(--color-accent)]">{{ role }}</span>
    <p
      v-if="bio"
      class="text-[0.92em] leading-relaxed rounded-lg p-4 text-center bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
    >{{ bio }}</p>
  </div>
</template>
