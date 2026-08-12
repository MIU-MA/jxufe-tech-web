<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { useLocale } from '../composables/useLocale';
import { Sun, Moon, Home, Link, LayoutDashboard, Languages, MessageCircle } from 'lucide-vue-next';

const router = useRouter();
const { theme, toggleTheme } = useTheme();
const { toggleLocale } = useLocale();

const isMenuOpen = ref(false);
const isDesktopDropdownOpen = ref(false);
const isMobileSubOpen = ref(false);

function closeAll() {
  isMenuOpen.value = false;
  isDesktopDropdownOpen.value = false;
  isMobileSubOpen.value = false;
}

function navigateTo(path: string) {
  closeAll();
  router.push(path);
}
</script>

<template>
  <header
    class="fixed top-0 w-full h-[60px] px-5 md:px-[5%] flex justify-between items-center shadow-md z-[2000] transition-colors duration-300 box-border"
    :style="{ backgroundColor: 'var(--color-bg-header)' }"
  >
    <div  class="flex items-center text-white text-[1.2em] font-medium shrink overflow-hidden whitespace-nowrap text-ellipsis no-underline">
      <img src="/logo.jpg" alt="数智技术协会会徽" class="h-[35px] w-[35px] mr-2 rounded-full bg-white">
      {{ $t('footer.brandName') }}
    </div>

    <ul class="hidden md:flex list-none p-0 m-0 text-center gap-0">
      <li>
        <RouterLink to="/" class="text-white flex items-center gap-1.5 px-[15px] py-2 no-underline opacity-90 hover:opacity-100 rounded">
          <Home :size="18" />{{ $t('nav.home') }}
        </RouterLink>
      </li>
      <li class="relative" @mouseenter="isDesktopDropdownOpen = true" @mouseleave="isDesktopDropdownOpen = false">
        <button
          class="bg-transparent border-none text-white flex items-center gap-1.5 px-[15px] py-2 opacity-90 cursor-pointer hover:opacity-100 rounded"
          style="font-family: inherit; font-size: inherit;"
          @click="isDesktopDropdownOpen = !isDesktopDropdownOpen"
        >
          <LayoutDashboard :size="18" />{{ $t('nav.about') }}
          <span class="text-[0.7em] ml-0.5">&#9662;</span>
        </button>
        <ul
          v-show="isDesktopDropdownOpen"
          class="absolute top-full left-0 min-w-[140px] list-none p-0 m-0 rounded-b-md shadow-lg"
          :style="{ backgroundColor: 'var(--color-bg-header)' }"
        >
          <li><RouterLink to="/presidents" class="text-white block no-underline py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.presidents') }}</RouterLink></li>
          <li><RouterLink to="/members"   class="text-white block no-underline py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.members') }}</RouterLink></li>
          <li><RouterLink to="/details"   class="text-white block no-underline py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.aboutUs') }}</RouterLink></li>
        </ul>
      </li>
      <li>
        <RouterLink to="/chat" class="text-white flex items-center gap-1.5 px-[15px] py-2 no-underline opacity-90 hover:opacity-100 rounded">
          <MessageCircle :size="18" />AI 对话
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/welcome" class="text-white flex items-center gap-1.5 px-[15px] py-2 no-underline opacity-90 hover:opacity-100 rounded">
          <Link :size="18" />{{ $t('nav.joinUs') }}
        </RouterLink>
      </li>
    </ul>

    <div class="flex items-center ml-auto md:ml-0 gap-3">
      <button class="bg-transparent w-9 h-9 flex items-center justify-center cursor-pointer text-[1.1em] p-0 shrink-0 border-none rounded transition-colors hover:bg-white/15" @click="toggleTheme">
        <Sun v-if="theme === 'dark'" :size="18" color="white" />
        <Moon v-else :size="18" color="white" />
      </button>
      <button class="bg-transparent w-9 h-9 flex items-center justify-center cursor-pointer text-[1.1em] p-0 shrink-0 border-none rounded transition-colors hover:bg-white/15" @click="toggleLocale">
        <Languages :size="18" color="white" />
      </button>

      <button
        class="md:hidden bg-transparent border border-white text-white text-[1.5em] cursor-pointer py-[5px] px-2.5 rounded hover:bg-[#002a5a]"
        @click="isMenuOpen = !isMenuOpen; isMobileSubOpen = false"
        aria-label="Toggle Navigation"
        :aria-expanded="isMenuOpen"
      >&#9776;</button>
    </div>
  </header>

  <div
    v-if="isMenuOpen"
    class="md:hidden fixed inset-0 top-[60px] z-[1998] bg-black/30"
    @click="closeAll"
  ></div>

  <div
    v-if="isMenuOpen"
    class="md:hidden fixed top-[60px] right-0 w-[280px] max-w-[85vw] z-[1999] rounded-bl-xl shadow-2xl overflow-y-auto"
    style="max-height: calc(100vh - 60px);"
    :style="{ backgroundColor: 'var(--color-nav-bg)' }"
  >
    <nav class="py-2">
      <RouterLink to="/" @click="closeAll" class="text-white flex items-center gap-2 mx-3 px-4 py-3.5 no-underline rounded-lg hover:bg-white/10">
        <Home :size="18" />{{ $t('nav.home') }}
      </RouterLink>

      <div>
        <button
          class="w-full bg-transparent border-none text-white flex items-center gap-2 mx-3 px-4 py-3.5 cursor-pointer rounded-lg hover:bg-white/10"
          style="font-family: inherit; font-size: inherit;"
          @click="isMobileSubOpen = !isMobileSubOpen"
        >
          <LayoutDashboard :size="18" />{{ $t('nav.about') }}
          <span class="ml-auto text-xs transition-transform duration-200" :style="{ transform: isMobileSubOpen ? 'rotate(180deg)' : 'none' }">&#9662;</span>
        </button>

        <div
          v-if="isMobileSubOpen"
          class="overflow-hidden"
        >
          <div class="mx-3 my-1 rounded-lg overflow-hidden" :style="{ backgroundColor: 'rgba(255,255,255,0.06)' }">
            <RouterLink to="/presidents" @click="closeAll" class="text-white flex items-center gap-2 pl-12 pr-4 py-3 no-underline text-[0.92em] hover:bg-white/10">
              {{ $t('nav.presidents') }}
            </RouterLink>
            <RouterLink to="/members"   @click="closeAll" class="text-white flex items-center gap-2 pl-12 pr-4 py-3 no-underline text-[0.92em] hover:bg-white/10">
              {{ $t('nav.members') }}
            </RouterLink>
            <RouterLink to="/details"   @click="closeAll" class="text-white flex items-center gap-2 pl-12 pr-4 py-3 no-underline text-[0.92em] hover:bg-white/10">
              {{ $t('nav.aboutUs') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <RouterLink to="/chat" @click="closeAll" class="text-white flex items-center gap-2 mx-3 px-4 py-3.5 no-underline rounded-lg hover:bg-white/10">
        <MessageCircle :size="18" />AI 对话
      </RouterLink>

      <RouterLink to="/welcome" @click="closeAll" class="text-white flex items-center gap-2 mx-3 px-4 py-3.5 no-underline rounded-lg hover:bg-white/10">
        <Link :size="18" />{{ $t('nav.joinUs') }}
      </RouterLink>
    </nav>
  </div>
</template>
