<script setup lang="ts">
import MemberCard from '../components/MemberCard.vue';
</script>

<template>
  <main class="page-container">
    <section class="members-header">
      <h1>历届负责人</h1>
    </section>

    <section class="term-section">
      <div class="term-title">2025届</div>
      <div class="members-grid">
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

<style scoped>
.members-header {
    text-align: center;
    margin-bottom: 40px;
    padding: 20px;
    background-color: var(--color-bg-card);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--color-shadow);
    transition: background-color 0.3s ease;
}

.members-header h1 {
    color: var(--color-accent);
    font-size: 2em;
    margin: 0;
}

.term-section {
    margin-bottom: 30px;
}

.term-title {
    color: var(--color-text-heading);
    font-size: 1.8em;
    border-bottom: 3px solid var(--color-border-light);
    padding-bottom: 10px;
    margin-bottom: 20px;
    font-weight: 700;
    text-align: center;
}

.members-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}
@media (min-width: 768px) {
    .member-card {
        width: 100%;
        max-width: 900px; 
    }

    .members-grid :deep(.member-photo) {
        width: 180px; 
        height: 180px;
    }
    .members-grid :deep(.member-card) {
    padding-top: 20px;    
    padding-bottom: 20px; 
    min-height: auto; 
}
}
</style>
