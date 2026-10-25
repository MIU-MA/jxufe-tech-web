<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Info,
  Landmark,
  Languages,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  Users,
  X,
} from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'
import { useAssistant } from '../composables/useAssistant'

const route = useRoute()
const assistant = useAssistant()
const { theme, toggleTheme } = useTheme()
const { toggleLocale } = useLocale()
const headerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const aboutTrigger = ref<HTMLButtonElement | null>(null)
const mobileTrigger = ref<HTMLButtonElement | null>(null)
const isMenuOpen = ref(false)
const isAboutOpen = ref(false)
const isMobileAboutOpen = ref(false)
const aboutLinks = [
  { to: '/details', label: 'nav.aboutUs', icon: Info },
  { to: '/members', label: 'nav.members', icon: Users },
  { to: '/presidents', label: 'nav.presidents', icon: Landmark },
]
const aboutActive = computed(() => aboutLinks.some((link) => isActive(link.to)))
const linkBase =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border-0 px-3.5 text-sm whitespace-nowrap no-underline transition-colors hover:no-underline cursor-pointer'
const iconButton =
  'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-text-secondary transition-colors hover:bg-bg-alt hover:text-primary'
function isActive(path: string) {
  return path === '/'
    ? route.path === '/'
    : route.path === path || route.path.startsWith(path + '/')
}
function linkClass(active: boolean) {
  return [
    linkBase,
    active
      ? 'bg-bg-alt text-primary! font-medium'
      : 'bg-transparent text-text-secondary! hover:bg-bg-alt hover:text-primary!',
  ]
}
function mobileLinkClass(active: boolean) {
  return [
    'flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm no-underline transition-colors hover:no-underline',
    active
      ? 'bg-bg-alt text-primary! font-medium'
      : 'text-text-secondary! hover:bg-bg-alt hover:text-primary!',
  ]
}
function closeAll() {
  isMenuOpen.value = false
  isAboutOpen.value = false
  isMobileAboutOpen.value = false
}
function toggleMobile() {
  isMenuOpen.value = !isMenuOpen.value
  isAboutOpen.value = false
  isMobileAboutOpen.value = aboutActive.value
}
function openAssistant() {
  closeAll()
  assistant.open()
}
async function focusAboutLink() {
  isAboutOpen.value = true
  await nextTick()
  dropdownRef.value?.querySelector<HTMLAnchorElement>('a')?.focus()
}
function closeAndFocus() {
  const trigger = isMenuOpen.value
    ? mobileTrigger.value
    : isAboutOpen.value
      ? aboutTrigger.value
      : null
  closeAll()
  trigger?.focus()
}
function handleOutside(event: PointerEvent) {
  const target = event.target as Node | null
  if (target && !headerRef.value?.contains(target)) closeAll()
  else if (target && !dropdownRef.value?.contains(target))
    isAboutOpen.value = false
}
watch(() => route.path, closeAll)
onMounted(() => document.addEventListener('pointerdown', handleOutside))
onBeforeUnmount(() =>
  document.removeEventListener('pointerdown', handleOutside),
)
</script>

<template>
  <div
    ref="headerRef"
    class="sticky top-0 z-100"
    @keydown.esc.stop="closeAndFocus"
  >
    <header
      class="relative h-[68px] border-t-2 border-t-primary-dark border-b border-b-border bg-bg-header shadow-[0_1px_12px_var(--color-shadow)]"
    >
      <div
        class="mx-auto flex h-full max-w-[1160px] items-center justify-between gap-3 px-4 md:px-6"
      >
        <RouterLink
          to="/"
          class="flex min-w-0 shrink-0 items-center gap-3 no-underline hover:no-underline"
          @click="closeAll"
        >
          <img
            src="/logo.jpg"
            alt="数智技术协会会徽"
            class="size-10 shrink-0 rounded-full border border-border-light object-cover p-0.5"
          />
          <span class="flex min-w-0 flex-col gap-1 leading-none">
            <span
              class="font-display text-[17px] font-semibold tracking-[.04em] text-text-heading"
              >数智技术协会</span
            >
            <span class="text-[10px] tracking-[.06em] text-text-muted"
              >DSA Association</span
            >
          </span>
        </RouterLink>

        <nav
          class="hidden items-center gap-1 @[940px]/site:flex"
          :aria-label="$t('nav.mainLabel')"
        >
          <RouterLink
            to="/"
            :class="linkClass(isActive('/'))"
            :aria-current="isActive('/') ? 'page' : undefined"
            >{{ $t('nav.home') }}</RouterLink
          >
          <div ref="dropdownRef" class="relative">
            <button
              ref="aboutTrigger"
              type="button"
              :class="linkClass(aboutActive || isAboutOpen)"
              :aria-expanded="isAboutOpen"
              aria-controls="association-links"
              @click="isAboutOpen = !isAboutOpen"
              @keydown.down.prevent="focusAboutLink"
            >
              {{ $t('nav.about')
              }}<ChevronDown
                :size="13"
                class="text-text-muted transition-transform motion-reduce:transition-none"
                :class="{ 'rotate-180': isAboutOpen }"
                aria-hidden="true"
              />
            </button>
            <div
              v-if="isAboutOpen"
              id="association-links"
              class="absolute top-full left-0 z-10 mt-2 w-52 rounded-lg border border-border bg-bg-card p-1.5 shadow-[0_8px_28px_var(--color-shadow)]"
            >
              <RouterLink
                v-for="link in aboutLinks"
                :key="link.to"
                :to="link.to"
                :class="mobileLinkClass(isActive(link.to))"
                :aria-current="isActive(link.to) ? 'page' : undefined"
                @click="closeAll"
                ><component
                  :is="link.icon"
                  :size="16"
                  :stroke-width="1.6"
                  aria-hidden="true"
                />{{ $t(link.label) }}</RouterLink
              >
            </div>
          </div>
          <RouterLink
            to="/wiki"
            :class="linkClass(isActive('/wiki'))"
            :aria-current="isActive('/wiki') ? 'page' : undefined"
            >{{ $t('knowledge.title') }}</RouterLink
          >
          <button
            type="button"
            :class="linkClass(assistant.isOpen.value)"
            :aria-expanded="assistant.isOpen.value"
            aria-controls="assistant-panel"
            @click="openAssistant"
          >
            <MessageCircle
              :size="15"
              :stroke-width="1.6"
              aria-hidden="true"
            />{{ $t('assistant.title') }}
          </button>
          <RouterLink
            to="/welcome"
            class="ml-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3.5 text-sm whitespace-nowrap text-primary! no-underline transition-colors hover:border-primary hover:bg-bg-alt hover:no-underline"
            :class="{ 'border-primary bg-bg-alt': isActive('/welcome') }"
            :aria-current="isActive('/welcome') ? 'page' : undefined"
            @click="closeAll"
            >{{ $t('nav.joinUs') }}<ArrowUpRight :size="14" aria-hidden="true"
          /></RouterLink>
        </nav>

        <div
          class="flex shrink-0 items-center gap-0.5 @[940px]/site:border-l @[940px]/site:border-border-light @[940px]/site:pl-3"
        >
          <button
            type="button"
            :class="iconButton"
            :aria-label="
              theme === 'dark'
                ? $t('theme.switchLight')
                : $t('theme.switchDark')
            "
            :title="
              theme === 'dark'
                ? $t('theme.switchLight')
                : $t('theme.switchDark')
            "
            @click="toggleTheme"
          >
            <Sun
              v-if="theme === 'dark'"
              :size="17"
              :stroke-width="1.7"
              aria-hidden="true"
            /><Moon v-else :size="17" :stroke-width="1.7" aria-hidden="true" />
          </button>
          <button
            type="button"
            :class="iconButton"
            :aria-label="$t('lang.switch')"
            :title="$t('lang.switch')"
            @click="toggleLocale"
          >
            <Languages :size="17" :stroke-width="1.7" aria-hidden="true" />
          </button>
          <button
            ref="mobileTrigger"
            type="button"
            :class="iconButton"
            class="ml-1 border! border-border! @[940px]/site:hidden"
            :aria-label="$t('nav.toggleLabel')"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-navigation"
            @click="toggleMobile"
          >
            <X v-if="isMenuOpen" :size="19" aria-hidden="true" /><Menu
              v-else
              :size="19"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>

    <nav
      v-if="isMenuOpen"
      id="mobile-navigation"
      class="absolute inset-x-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto border-b border-border bg-bg-header p-3 shadow-[0_8px_20px_var(--color-shadow)] @[940px]/site:hidden"
      :aria-label="$t('nav.mobileLabel')"
    >
      <RouterLink
        to="/"
        :class="mobileLinkClass(isActive('/'))"
        @click="closeAll"
        >{{ $t('nav.home') }}</RouterLink
      >
      <button
        type="button"
        class="cursor-pointer border-0 bg-transparent"
        :class="mobileLinkClass(aboutActive)"
        :aria-expanded="isMobileAboutOpen"
        aria-controls="mobile-association-links"
        @click="isMobileAboutOpen = !isMobileAboutOpen"
      >
        {{ $t('nav.about')
        }}<ChevronDown
          :size="14"
          class="ml-auto transition-transform motion-reduce:transition-none"
          :class="{ 'rotate-180': isMobileAboutOpen }"
          aria-hidden="true"
        />
      </button>
      <div
        v-if="isMobileAboutOpen"
        id="mobile-association-links"
        class="my-1 ml-3 border-l border-border pl-3"
      >
        <RouterLink
          v-for="link in aboutLinks"
          :key="link.to"
          :to="link.to"
          :class="mobileLinkClass(isActive(link.to))"
          @click="closeAll"
          ><component
            :is="link.icon"
            :size="15"
            :stroke-width="1.6"
            aria-hidden="true"
          />{{ $t(link.label) }}</RouterLink
        >
      </div>
      <RouterLink
        to="/wiki"
        :class="mobileLinkClass(isActive('/wiki'))"
        @click="closeAll"
        ><BookOpen :size="16" :stroke-width="1.6" aria-hidden="true" />{{
          $t('knowledge.title')
        }}</RouterLink
      >
      <button
        type="button"
        class="cursor-pointer border-0 bg-transparent"
        :class="mobileLinkClass(assistant.isOpen.value)"
        :aria-expanded="assistant.isOpen.value"
        aria-controls="assistant-panel"
        @click="openAssistant"
      >
        <MessageCircle :size="16" :stroke-width="1.6" aria-hidden="true" />{{
          $t('assistant.title')
        }}
      </button>
      <div class="mt-2 border-t border-border-light pt-2">
        <RouterLink
          to="/welcome"
          :class="mobileLinkClass(isActive('/welcome'))"
          @click="closeAll"
          >{{ $t('nav.joinUs')
          }}<ArrowUpRight
            :size="15"
            class="ml-auto text-primary"
            aria-hidden="true"
        /></RouterLink>
      </div>
    </nav>
  </div>
</template>
