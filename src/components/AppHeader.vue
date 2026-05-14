<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { Sun, Moon, Home, Link, LayoutDashboard } from 'lucide-vue-next';

const { theme, toggleTheme } = useTheme();

// 控制移动端菜单开关的状态
const isMenuOpen = ref(false);

// 切换菜单
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 控制下拉菜单
const isDropdownOpen = ref(false);

const openDropdown = () => {
  if (window.innerWidth > 768) {
    isDropdownOpen.value = true;
  }
};

const closeDropdown = () => {
  if (window.innerWidth > 768) {
    isDropdownOpen.value = false;
  }
};

const toggleDropdown = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 点击链接后自动关闭菜单（移动端体验优化）
const closeMenu = () => {
  if (window.innerWidth <= 768) {
    isMenuOpen.value = false;
    isDropdownOpen.value = false;
  }
};
</script>

<template>
  <header>
    <div class="logo">
      <img src="/logo.jpg" alt="数智技术协会会徽">
      江西财经大学数智技术协会
    </div>
    
    <button 
      class="menu-toggle" 
      @click="toggleMenu" 
      aria-label="Toggle Navigation" 
      :aria-expanded="isMenuOpen"
    >
      &#9776;
    </button>

    <nav :class="{ 'menu-open': isMenuOpen }">
      <ul>
        <li><RouterLink to="/" @click="closeMenu" class="nav-link"><Home :size="18" />首页</RouterLink></li>
        <li
          class="dropdown-trigger"
          @mouseenter="openDropdown"
          @mouseleave="closeDropdown"
        >
          <a href="#" class="dropdown-label nav-link" @click="toggleDropdown">
            <LayoutDashboard :size="18" />协会简介
            <span class="arrow">&#9662;</span>
          </a>
          <ul class="dropdown-menu" :class="{ 'dropdown-open': isDropdownOpen }">
            <li><RouterLink to="/presidents" @click="closeMenu">历届负责人</RouterLink></li>
            <li><RouterLink to="/members" @click="closeMenu">优秀成员</RouterLink></li>
            <li><RouterLink to="/details" @click="closeMenu">关于协会</RouterLink></li>
          </ul>
        </li>
        <li><RouterLink to="/welcome" @click="closeMenu"class="nav-link"><Link :size="18" />加入我们</RouterLink></li>
       
      </ul>
    </nav>

     <button class="theme-toggle" @click="toggleTheme" :aria-label="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'">
        <Sun v-if="theme === 'dark'" :size="18"color="white" />
        <Moon v-else :size="18" color="white" />
      </button>
        
  </header>
</template>

<style scoped>
header {
    background-color: var(--color-bg-header);
    position: fixed;
    top: 0;
    width: 100%;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    height: 60px;
    transition: background-color 0.3s ease;
}
header .logo {
    display: flex;
    align-items: center;
    font-size: 1.2em; 
    font-weight: 500;
    color: white;
    flex-shrink: 1; 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
header .logo img {
    height: 35px; 
    width: 35px;
    margin-right: 8px;
    border-radius: 50%;
    background-color: white;
}
.menu-toggle {
    display: block; 
    background: none;
    border: 1px solid white;
    color: white;
    font-size: 1.5em; 
    cursor: pointer;
    padding: 5px 10px;
    line-height: 1;
    border-radius: 4px;
    margin-left: auto;
}
.menu-toggle:hover { background-color: #002a5a; }

/* 移动端菜单 */
header nav {
    position: absolute;
    top: 60px; right: 0; width: 100%;
    max-height: 0; overflow: hidden;
    background-color: var(--color-nav-bg);
    transition: max-height 0.3s ease-in-out, background-color 0.3s ease;
    border-radius: 0 0 8px 8px;
    max-width: 300px;
}
header nav.menu-open {
    max-height: 500px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 8px rgba(0, 58, 122, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2); 
    border-radius: 0 0 8px 8px;
    max-width: 300px; 
}
header nav.menu-open { max-height: 500px;  }
header nav ul { list-style: none; padding: 0; margin: 0; text-align: center; }
header nav ul li a {
    color: white; display: block; padding: 15px;
    border-bottom: 1px solid #002a5a;
}
header nav ul li a:hover { background-color: #002a5a; }
.nav-link {
    display: inline-flex !important;
    align-items: center;
    gap: 6px;
}

/* 下拉菜单（移动端） */
.dropdown-trigger {
  position: relative;
}
.dropdown-label {
  cursor: pointer;
}
.dropdown-label .arrow {
  font-size: 0.7em;
  margin-left: 2px;
  display: inline-block;
}
.dropdown-menu {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 220px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}
.dropdown-menu.dropdown-open {
  max-height: 200px;
}
.dropdown-menu li a {
  padding: 8px 15px 8px 30px !important;
  font-size: 0.88em;
}

/* PC 端适配 */
@media (min-width: 768px) {
    header { padding: 0 5%; }
    .menu-toggle { display: none; }
    header nav {
        position: static; max-height: none; overflow: visible;
        background: transparent;
        box-shadow: none; flex: 1; display: flex; justify-content: center;
    }
    header nav ul { display: flex; }
    header nav ul li { white-space: nowrap; }
    header nav ul li a { border: none; padding: 0 15px; opacity: 0.9; }
    header nav ul li a:hover { background: transparent; opacity: 1; }
    header nav ul li a.router-link-exact-active,
    header nav ul li a.router-link-active { background: linear-gradient(135deg, #17589d, #005a9a); border-radius: 4px; }

    /* PC 端下拉菜单 */
    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      min-width: 140px;
      background-color: var(--color-bg-header);
      border-radius: 0 0 6px 6px;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
      max-height: none;
      overflow: visible;
    }
    .dropdown-menu.dropdown-open {
      display: block;
    }
    .dropdown-menu li a {
      padding: 12px 20px !important;
      white-space: nowrap;
    }
    .dropdown-menu li a:hover {
      background-color: #002a5a;
    }
}

/* 主题切换按钮 */
.theme-toggle {
  background: none;

  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1em;
  line-height: 1;
  padding: 0;
  margin-left: 12px;
  flex-shrink: 0;
  transition: background-color 0.3s;
}
.theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>