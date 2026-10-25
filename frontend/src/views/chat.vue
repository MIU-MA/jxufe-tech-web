<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAssistant } from "../composables/useAssistant";
const router = useRouter();
const assistant = useAssistant();
onMounted(() => {
  assistant.open();
  void router.replace("/wiki");
});
</script>
<template>
  <div class="ed-layout py-12">
    <RouterLink to="/wiki">{{ $t("knowledge.title") }} →</RouterLink>
  </div>
</template>
