<script setup lang="ts">
import EditorialPage from '../components/EditorialPage.vue'

import MemberCard from '../components/MemberCard.vue'
</script>

<template>
  <EditorialPage
    :title="$t('presidents.title')"
    eyebrow="PEOPLE / LEADERSHIP"
    :description="$t('site.presidentsDesc')"
  >
    <section class="ed-section" aria-labelledby="term-2025">
      <div class="ed-section-title">
        <span>2025</span>
        <h2 id="term-2025">{{ $t('presidents.term2025') }}</h2>
      </div>
      <MemberCard img="/images/jt.jpg" name="MIUMA" role="大数据241" bio="睡觉大王" />
    </section>
    <section class="ed-section" aria-labelledby="term-2026">
      <div class="ed-section-title">
        <span>2026</span>
        <h2 id="term-2026">{{ $t('presidents.term2026') }}</h2>
      </div>
      <MemberCard img="/images/lh.jpg" name="月后小怪" role="大数据252" bio="蓝桥杯国二" />
    </section>
  </EditorialPage>
</template>
