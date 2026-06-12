<script setup lang="ts">
import { inject, type Ref } from 'vue'
import ImageUploader from './ImageUploader.vue'

const token = inject<Ref<string>>('token')!
</script>

<template>
  <div>
    <ImageUploader :token="token" />
  </div>
</template>
