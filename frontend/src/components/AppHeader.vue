<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { useLocale } from '../composables/useLocale';
import { Sun, Moon, Languages } from 'lucide-vue-next';

const route = useRoute();
const { theme, toggleTheme } = useTheme();
const { toggleLocale } = useLocale();

const isMenuOpen = ref(false);
const isDesktopDropdownOpen = ref(false);
const isMobileSubOpen = ref(false);

const aboutActive = computed(() =>
  ['/presidents', '/members', '/details'].some((p) => route.path.startsWith(p)),
);

function isActive(path: string): boolean {
  return path === '/' ? route.path === '/' : route.path.startsWith(path);
}

function closeAll() {
  isMenuOpen.value = false;
  isDesktopDropdownOpen.value = false;
  isMobileSubOpen.value = false;
}

const navBase = 'relative flex items-center px-4 h-full text-[15px] no-underline hover:no-underline transition-colors';
const navIdle = 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]';
const navActive = 'text-[var(--color-primary)] after:content-[\'\'] after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-[var(--color-primary)]';
const joinIdle = 'text-[var(--color-accent)] hover:text-[var(--color-accent)]';
const joinActive = 'text-[var(--color-accent)] after:content-[\'\'] after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-[var(--color-accent)]';

function navClass(on: boolean, join = false): string {
  if (join) return `${navBase} ${on ? joinActive : joinIdle}`;
  return `${navBase} ${on ? navActive : navIdle}`;
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 w-full h-[60px] z-[100] box-border transition-colors duration-300 bg-[var(--color-bg-header)] border-t-4 border-t-[var(--color-primary-dark)] border-b border-b-[var(--color-border)]"
  >
    <div class="max-w-[1160px] mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-3 shrink no-underline hover:no-underline" @click="closeAll">
        <img src="/logo.jpg" alt="数智技术协会会徽" class="h-10 w-10 rounded-full object-cover">
        <span class="flex flex-col leading-tight">
          <span class="font-display text-[17px] tracking-wide text-[var(--color-text-heading)]">数智技术协会</span>
          <span class="text-[11px] tracking-[0.08em] text-[var(--color-text-muted)]">DSA Association</span>
        </span>
      </RouterLink>

      <nav class="hidden md:flex items-center gap-1 h-full" aria-label="主导航">
        <RouterLink to="/" :class="navClass(isActive('/'))">{{ $t('nav.home') }}</RouterLink>

        <div class="relative h-full flex items-center" @mouseenter="isDesktopDropdownOpen = true" @mouseleave="isDesktopDropdownOpen = false">
          <button
            :class="navClass(aboutActive || isDesktopDropdownOpen)"
            font-[inherit]
            @click="isDesktopDropdownOpen = !isDesktopDropdownOpen"
            aria-haspopup="true"
            :aria-expanded="isDesktopDropdownOpen"
          >
            {{ $t('nav.about') }}
            <span class="text-[0.72em] opacity-70">&#9662;</span>
          </button>
          <ul
            v-show="isDesktopDropdownOpen"
            class="absolute top-full left-0 min-w-[150px] list-none p-0 m-0 border bg-[var(--color-bg-card)] border-[var(--color-border)] transition-colors duration-300"
          >
            <li>
              <RouterLink to="/presidents" class="block px-5 py-3 text-[0.9em] no-underline hover:no-underline transition-colors text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]" @click="closeAll">
                {{ $t('nav.presidents') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/members" class="block px-5 py-3 text-[0.9em] no-underline hover:no-underline transition-colors text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]" @click="closeAll">
                {{ $t('nav.members') }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/details" class="block px-5 py-3 text-[0.9em] no-underline hover:no-underline transition-colors text-[var(--color-text)] hover:bg-[var(--color-bg-alt)]" @click="closeAll">
                {{ $t('nav.aboutUs') }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <RouterLink to="/chat" :class="navClass(isActive('/chat'))">AI 助手</RouterLink>
        <RouterLink to="/welcome" :class="navClass(isActive('/welcome'), true)">{{ $t('nav.joinUs') }}</RouterLink>
      </nav>

      <div class="flex items-center gap-1.5">
        <button
          class="w-9 h-9 flex items-center justify-center cursor-pointer p-0 shrink-0 border-none rounded transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
          @click="toggleTheme"
          :title="theme === 'dark' ? $t('theme.switchLight') : $t('theme.switchDark')"
        >
          <Sun v-if="theme === 'dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <button
          class="w-9 h-9 flex items-center justify-center cursor-pointer p-0 shrink-0 border-none rounded transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)]"
          @click="toggleLocale"
          :title="$t('lang.switch')"
        >
          <Languages :size="18" />
        </button>

        <button
          class="md:hidden w-9 h-9 flex items-center justify-center cursor-pointer border text-[1.4em] leading-none transition-colors text-[var(--color-text)] border-[var(--color-border)]"
          @click="isMenuOpen = !isMenuOpen; isMobileSubOpen = false"
          aria-label="Toggle Navigation"
          :aria-expanded="isMenuOpen"
        >&#9776;</button>
      </div>
    </div>
  </header>

  <div
    v-if="isMenuOpen"
    class="md:hidden fixed inset-0 top-[60px] z-[90] bg-[rgba(16,52,95,0.35)]"
    @click="closeAll"
  ></div>

  <div
    v-if="isMenuOpen"
    class="md:hidden fixed top-[60px] right-0 w-[280px] max-w-[85vw] z-[91] border-l border-l-[var(--color-border)] overflow-y-auto transition-colors duration-300 bg-[var(--color-bg-header)]"
  >
    <nav class="py-3" aria-label="移动端导航">
      <RouterLink to="/" @click="closeAll" class="flex items-center mx-3 px-4 py-3.5 no-underline hover:no-underline text-[0.95em] text-[var(--color-text)]">
        {{ $t('nav.home') }}
      </RouterLink>

      <div>
        <button
          class="w-full flex items-center gap-2 mx-3 px-4 py-3.5 cursor-pointer border-none bg-transparent text-[0.95em] text-[var(--color-text)]"
          font-[inherit]
          @click="isMobileSubOpen = !isMobileSubOpen"
        >
          {{ $t('nav.about') }}
          <span class="ml-auto text-xs transition-transform duration-200" :class="{ 'rotate-180': isMobileSubOpen }">&#9662;</span>
        </button>
        <div v-if="isMobileSubOpen" class="overflow-hidden">
          <div class="mx-3 my-1 border-l-2 border-l-[var(--color-border)]">
            <RouterLink to="/presidents" @click="closeAll" class="flex items-center pl-6 pr-4 py-3 no-underline hover:no-underline text-[0.92em] text-[var(--color-text-secondary)]">
              {{ $t('nav.presidents') }}
            </RouterLink>
            <RouterLink to="/members" @click="closeAll" class="flex items-center pl-6 pr-4 py-3 no-underline hover:no-underline text-[0.92em] text-[var(--color-text-secondary)]">
              {{ $t('nav.members') }}
            </RouterLink>
            <RouterLink to="/details" @click="closeAll" class="flex items-center pl-6 pr-4 py-3 no-underline hover:no-underline text-[0.92em] text-[var(--color-text-secondary)]">
              {{ $t('nav.aboutUs') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <RouterLink to="/chat" @click="closeAll" class="flex items-center mx-3 px-4 py-3.5 no-underline hover:no-underline text-[0.95em] text-[var(--color-text)]">
        AI 助手
      </RouterLink>

      <RouterLink to="/welcome" @click="closeAll" class="flex items-center mx-3 px-4 py-3.5 no-underline hover:no-underline text-[0.95em] text-[var(--color-text-secondary)]">
        {{ $t('nav.joinUs') }}
      </RouterLink>
    </nav>
  </div>
</template>
