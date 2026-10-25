<script setup lang="ts">
import EditorialPage from '../components/EditorialPage.vue'

import { RouterLink } from 'vue-router'
import { useAssistant } from '../composables/useAssistant'
const assistant = useAssistant()
</script>

<template>
  <EditorialPage
    :title="$t('nav.joinUs')"
    eyebrow="COMMUNITY / JOIN US"
    :description="$t('welcome.text2')"
  >
    <section class="ed-section" aria-labelledby="join-intro">
      <div class="ed-section-title">
        <span>01</span>
        <h2 id="join-intro">{{ $t('site.meetUs') }}</h2>
      </div>
      <p class="ed-text">{{ $t('details.aboutIntro') }}</p>
      <div class="ed-link-row">
        <RouterLink to="/details" class="ed-link">{{ $t('nav.aboutUs') }} →</RouterLink
        ><button type="button" class="ed-link bg-transparent border-none p-0 cursor-pointer" @click="assistant.open()">{{ $t('assistant.title') }} ↗</button>
      </div>
    </section>
    <section class="ed-section" aria-labelledby="join-poster">
      <div class="ed-section-title">
        <span>02</span>
        <h2 id="join-poster">{{ $t('site.poster') }}</h2>
      </div>
      <figure class="ed-poster">
        <a
          href="/images/welcome.jpg"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('site.fullPoster')"
          ><img src="/images/welcome.jpg" :alt="$t('welcome.title')"
        /></a>
        <figcaption>
          <span>{{ $t('welcome.title') }}</span
          ><a href="/images/welcome.jpg" target="_blank" rel="noopener noreferrer"
            >{{ $t('site.fullPoster') }} ↗</a
          >
        </figcaption>
      </figure>
    </section>
  </EditorialPage>
</template>
