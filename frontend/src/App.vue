<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
</script>

<template>
  <AppHeader />

  <div class="pt-15">
    <RouterView />
  </div>

  <AppFooter />
</template>