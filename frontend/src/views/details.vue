<script setup lang="ts">
import EditorialPage from '../components/EditorialPage.vue'

import { ref } from 'vue'
import { Megaphone, ClipboardList, Monitor } from 'lucide-vue-next'
const contributors = ref([
  {
    name: 'MIUMA',
    img: 'https://avatars.githubusercontent.com/u/249093234?v=4',
    url: 'https://github.com/MIU-MA',
  },
  {
    name: 'TangTangChu',
    img: 'https://avatars.githubusercontent.com/u/61231159?v=4',
    url: 'https://github.com/TangTangChu',
  },
])
</script>

<template>
  <EditorialPage
    :title="$t('details.aboutAssociation')"
    eyebrow="ABOUT / ASSOCIATION"
    :description="$t('home.aboutDesc')"
  >
    <section class="ed-section" aria-labelledby="association">
      <div class="ed-section-title">
        <span>01</span>
        <h2 id="association">{{ $t('details.aboutAssociation') }}</h2>
      </div>
      <p class="ed-text">{{ $t('details.aboutIntro') }}</p>
      <div class="ed-note">
        <p>{{ $t('footer.tagline1') }}<br />{{ $t('footer.tagline2') }}</p>
      </div>
    </section>
    <section class="ed-section" aria-labelledby="departments">
      <div class="ed-section-title">
        <span>02</span>
        <h2 id="departments">{{ $t('details.departmentSetup') }}</h2>
      </div>
      <div
        v-for="department in [
          { name: $t('details.publicDept'), desc: $t('details.publicDeptDesc'), icon: Megaphone },
          { name: $t('details.orgDept'), desc: $t('details.orgDeptDesc'), icon: ClipboardList },
          { name: $t('details.studyDept'), desc: $t('details.studyDeptDesc'), icon: Monitor },
        ]"
        :key="department.name"
        class="ed-department"
      >
        <component :is="department.icon" :size="23" :stroke-width="1.4" aria-hidden="true" />
        <div>
          <h3>{{ department.name }}</h3>
          <p>{{ department.desc }}</p>
        </div>
      </div>
    </section>
    <section class="ed-section" aria-labelledby="contributors">
      <div class="ed-section-title">
        <span>03</span>
        <h2 id="contributors">{{ $t('site.contributors') }}</h2>
      </div>
      <p class="ed-text ed-muted">
        {{ $t('details.contributorsText1') }}{{ $t('details.contributorsText2') }}
      </p>
      <a
        href="https://github.com/MIU-MA/vue3-js-jxufe-tech"
        target="_blank"
        rel="noopener noreferrer"
        class="ed-link"
        >{{ $t('site.viewProject') }} ↗</a
      >
      <div class="ed-contributors">
        <a
          v-for="contributor in contributors"
          :key="contributor.name"
          :href="contributor.url"
          target="_blank"
          rel="noopener noreferrer"
          ><img
            :src="contributor.img"
            :alt="contributor.name"
            loading="lazy"
            width="45"
            height="45"
          /><span>{{ contributor.name }} ↗</span></a
        >
      </div>
    </section>
  </EditorialPage>
</template>
