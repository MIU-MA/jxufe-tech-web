<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { useLocale } from '../composables/useLocale';
import { Sun, Moon, Home, Link, LayoutDashboard, Languages } from 'lucide-vue-next';

const { theme, toggleTheme } = useTheme();
const { toggleLocale } = useLocale();

const isMenuOpen = ref(false);
const isDropdownOpen = ref(false);

const closeAll = () => { isMenuOpen.value = false; isDropdownOpen.value = false; };
</script>

<template>
  <nav
    class="fixed top-0 w-full h-[60px] px-5 md:px-[5%] flex justify-between items-center shadow-md z-[2000] transition-colors duration-300 box-border"
    :style="{ backgroundColor: 'var(--color-bg-header)' }"
  >
    <!-- Logo -->
    <div class="flex items-center text-white text-[1.2em] font-medium shrink overflow-hidden whitespace-nowrap text-ellipsis">
      <img src="/logo.jpg" alt="数智技术协会会徽" class="h-[35px] w-[35px] mr-2 rounded-full bg-white">
      {{ $t('footer.brandName') }}
    </div>

    <!-- ==================== PC 端导航 ==================== -->
    <ul class="hidden md:flex list-none p-0 m-0 text-center gap-0">
      <li>
        <RouterLink to="/" class="text-white flex items-center gap-1.5 px-[15px] opacity-90 hover:opacity-100">
          <Home :size="18" />{{ $t('nav.home') }}
        </RouterLink>
      </li>
      <li class="relative" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
        <a href="#" class="text-white flex items-center gap-1.5 px-[15px] opacity-90 cursor-pointer hover:opacity-100" @click.prevent="isDropdownOpen = !isDropdownOpen">
          <LayoutDashboard :size="18" />{{ $t('nav.about') }}
          <span class="text-[0.7em] ml-0.5">&#9662;</span>
        </a>
        <ul
          v-show="isDropdownOpen"
          class="absolute top-full left-0 min-w-[140px] list-none p-0 m-0 rounded-b-md shadow-lg"
          :style="{ backgroundColor: 'var(--color-bg-header)' }"
        >
          <li><RouterLink to="/presidents" class="text-white block py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.presidents') }}</RouterLink></li>
          <li><RouterLink to="/members"   class="text-white block py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.members') }}</RouterLink></li>
          <li><RouterLink to="/details"   class="text-white block py-3 px-5 text-[0.88em] whitespace-nowrap hover:bg-[#002a5a]">{{ $t('nav.aboutUs') }}</RouterLink></li>
        </ul>
      </li>
      <li>
        <RouterLink to="/welcome" class="text-white flex items-center gap-1.5 px-[15px] opacity-90 hover:opacity-100">
          <Link :size="18" />{{ $t('nav.joinUs') }}
        </RouterLink>
      </li>
    </ul>

    <!-- ==================== 主题 & 语言 ==================== -->
    <div class="flex items-center ml-auto md:ml-0 gap-3">
      <button class="bg-transparent w-9 h-9 flex items-center justify-center cursor-pointer text-[1.1em] p-0 shrink-0 transition-colors hover:bg-white/15" @click="toggleTheme">
        <Sun v-if="theme === 'dark'" :size="18" color="white" />
        <Moon v-else :size="18" color="white" />
      </button>
      <button class="bg-transparent w-9 h-9 flex items-center justify-center cursor-pointer text-[1.1em] p-0 shrink-0 transition-colors hover:bg-white/15" @click="toggleLocale">
        <Languages :size="18" color="white" />
      </button>

      <!-- ======= 移动端汉堡按钮 ======= -->
      <button
        class="md:hidden bg-transparent border border-white text-white text-[1.5em] cursor-pointer py-[5px] px-2.5 rounded hover:bg-[#002a5a]"
        @click="isMenuOpen = !isMenuOpen"
        aria-label="Toggle Navigation"
        :aria-expanded="isMenuOpen"
      >&#9776;</button>
    </div>
  </nav>

  <!-- ==================== 移动端下拉菜单 ==================== -->
  <div
    v-show="isMenuOpen"
    class="md:hidden fixed top-[60px] right-0 w-full max-w-[300px] z-[1999] rounded-bl-lg shadow-lg"
    :style="{ backgroundColor: 'var(--color-nav-bg)' }"
  >
    <ul class="list-none p-0 m-0 text-center">
      <li>
        <RouterLink to="/" @click="closeAll" class="text-white flex items-center justify-center gap-1.5 py-[15px] px-[15px] hover:bg-[#002a5a] border-b border-[#002a5a]">
          <Home :size="18" />{{ $t('nav.home') }}
        </RouterLink>
      </li>
      <li>
        <a href="#" class="text-white flex items-center justify-center gap-1.5 py-[15px] px-[15px] cursor-pointer hover:bg-[#002a5a] border-b border-[#002a5a]" @click.prevent="isDropdownOpen = !isDropdownOpen">
          <LayoutDashboard :size="18" />{{ $t('nav.about') }}
          <span class="text-[0.7em] ml-0.5">&#9662;</span>
        </a>
        <ul v-show="isDropdownOpen" class="list-none p-0 m-0 max-w-[220px] mx-auto" :style="{ backgroundColor: 'var(--color-bg-header)' }">
          <li><RouterLink to="/presidents" @click="closeAll" class="text-white block py-2 px-[30px] text-[0.88em] hover:bg-[#002a5a] border-b border-[#002a5a]">{{ $t('nav.presidents') }}</RouterLink></li>
          <li><RouterLink to="/members"   @click="closeAll" class="text-white block py-2 px-[30px] text-[0.88em] hover:bg-[#002a5a] border-b border-[#002a5a]">{{ $t('nav.members') }}</RouterLink></li>
          <li><RouterLink to="/details"   @click="closeAll" class="text-white block py-2 px-[30px] text-[0.88em] hover:bg-[#002a5a] border-b border-[#002a5a]">{{ $t('nav.aboutUs') }}</RouterLink></li>
        </ul>
      </li>
      <li>
        <RouterLink to="/welcome" @click="closeAll" class="text-white flex items-center justify-center gap-1.5 py-[15px] px-[15px] hover:bg-[#002a5a]">
          <Link :size="18" />{{ $t('nav.joinUs') }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
