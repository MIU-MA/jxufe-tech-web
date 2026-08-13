<script setup lang="ts">
</script>

<template>
  <main class="min-h-[calc(100vh-60px)] flex items-center justify-center">
    <section class="max-w-[620px] mx-auto px-4 md:px-6 py-20 text-center">
      <h1 class="font-display text-[2em] md:text-[2.3em] leading-snug mb-6 text-[var(--color-text-heading)]">
        {{ $t('welcome.title') }}
      </h1>
      <p class="text-[1.05em] leading-relaxed text-[var(--color-text-secondary)]">
        {{ $t('welcome.text1') }}
      </p>
      <p class="text-[1.05em] leading-relaxed text-[var(--color-text-secondary)]">
        {{ $t('welcome.text2') }}
      </p>
    </section>
  </main>
</template>
