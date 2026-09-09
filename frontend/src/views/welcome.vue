<script setup lang="ts">
</script>

<template>
  <main class="min-h-[calc(100vh-60px)] flex items-center justify-center">
    <section class="max-w-[620px] mx-auto px-4 md:px-6 py-20 text-center">
      <h1 class="font-display text-[2em] md:text-[2.3em] leading-snug mb-6 text-[var(--color-text-heading)]">
        {{ $t('welcome.title') }}
      </h1>
      <img  src="/images/welcome.jpg"
        alt="数智技术协会"
        class="mx-auto mb-6 rounded-lg shadow-md max-h-[400px] object-cover"  >
      
    </section>
  </main>
</template>
