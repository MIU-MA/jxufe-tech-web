<script setup lang="ts">
</script>

<template>
  <main class="max-w-3xl mx-auto px-5 py-10 h-[60vh] bg-bg-card rounded-lg text-center transition-colors duration-300">
    <h1 class="text-4xl font-bold text-text-heading mb-5">{{ $t('welcome.title') }}</h1>
    <p class="text-xl text-text-secondary leading-relaxed">
        {{ $t('welcome.text1') }}
        {{ $t('welcome.text2') }}
    </p>
  </main>
</template>
