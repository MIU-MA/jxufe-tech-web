<script setup lang="ts">
import MemberCard from '../components/MemberCard.vue';
</script>

<template>
  <main class="max-w-6xl mx-auto px-5 pt-20 pb-10 min-h-[calc(100vh-350px)]">
    <section
      class="text-center mb-10 p-5 rounded-lg shadow-sm transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 2px 4px var(--color-shadow)' }"
    >
      <h1 class="text-3xl font-bold m-0" :style="{ color: 'var(--color-accent)' }">{{ $t('presidents.title') }}</h1>
    </section>

    <section class="mb-8">
      <div
        class="text-[1.8em] font-bold text-center pb-2.5 mb-5 border-b-[3px]"
        :style="{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-light)' }"
      >
        {{ $t('presidents.term2025') }}
      </div>
      <div class="flex flex-wrap justify-center gap-5 mt-5">
        <MemberCard
          img="/images/jt.jpg"
          name="MIUMA"
          role="大数据241"
          bio="睡觉大王"
        />
      </div>
    </section>
  </main>
</template>
