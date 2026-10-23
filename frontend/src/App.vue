<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
const route = useRoute();
</script>

<template>
  <AppHeader />

  <div class="pt-15">
    <Suspense>
      <RouterView />
    </Suspense>
  </div>

  <AppFooter v-if="route.path !== '/chat'" />
</template>
