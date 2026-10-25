<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import EditorialPage from '../../components/EditorialPage.vue'
import { useAssistant } from '../../composables/useAssistant'
import type { WikiArticle } from '../../utils/wikiArticles'
import { renderWikiMarkdown } from '../../utils/wikiMarkdown'
const route = useRoute()
const { t, tm } = useI18n()
const assistant = useAssistant()
const article = computed(() =>
  (tm('knowledge.articles') as WikiArticle[]).find(
    (a) => a.slug === route.params.slug,
  ),
)
const html = computed(
  () => renderWikiMarkdown(article.value?.body ?? '', 'wiki-article').html,
)
function ask() {
  if (article.value)
    assistant.open(t('knowledge.explainQuestion'), {
      title: article.value.title,
      content: article.value.body,
    })
}
</script>

<template>
  <EditorialPage
    :title="article?.title ?? t('knowledge.missing')"
    eyebrow="KNOWLEDGE / ARTICLE"
    :description="article?.summary"
  >
    <template v-if="article" #meta
      ><div
        class="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted"
      >
        <RouterLink to="/wiki">{{ t('knowledge.title') }}</RouterLink
        ><span>·</span><span>{{ article.category }}</span>
      </div></template
    >
    <article v-if="article" class="mx-auto max-w-[860px] pt-7 md:pt-10">
      <div
        class="prose dark:prose-invert max-w-none text-sm leading-loose md:text-base [--tw-prose-body:var(--color-text)] [--tw-prose-headings:var(--color-text-heading)] [--tw-prose-links:var(--color-primary)] [--tw-prose-bold:var(--color-text-heading)] [--tw-prose-code:var(--color-text)] prose-headings:font-display prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border prose-pre:bg-bg-alt prose-pre:text-text prose-table:block prose-table:overflow-x-auto"
        v-html="html"
      ></div>
      <div
        class="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-border-light pt-5"
      >
        <RouterLink
          class="inline-flex items-center gap-3 text-[13px] text-primary"
          to="/wiki"
          >← {{ t('knowledge.back') }}</RouterLink
        ><button
          class="inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--color-control-bg)] bg-[var(--color-control-bg)] px-4 py-2.5 text-[13px] text-[var(--color-control-text)] cursor-pointer hover:opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
          type="button"
          @click="ask"
        >
          {{ t('knowledge.askArticle') }} ↗
        </button>
      </div>
    </article>
    <div
      v-else
      class="border-b border-border-light px-[18px] py-8 text-[13px] leading-[1.9] text-text-muted [&>p]:mb-3"
    >
      <p>{{ t('knowledge.missingText') }}</p>
      <RouterLink
        class="inline-flex items-center gap-3 text-[13px] text-primary"
        to="/wiki"
        >← {{ t('knowledge.back') }}</RouterLink
      >
    </div>
  </EditorialPage>
</template>
