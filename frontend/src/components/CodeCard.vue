<script setup lang="ts">
defineProps({
  title: { type: String, default: 'untitled' },
  code:  { type: String, default: '' }
});
</script>

<template>
  <div class="w-[260px] h-[320px] bg-[#24233b] rounded-lg z-[1] shadow-lg overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:z-10">
    <!-- 窗口标题栏 -->
    <div class="flex items-center pl-2.5 h-[30px] bg-[#2e2c45]">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#ff605c] mx-1"></span>
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#ffbd44] mx-1"></span>
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#00ca4e] mx-1"></span>
      <p class="text-[#aaa] text-xs ml-4 font-sans">{{ title }}</p>
    </div>
    <!-- 代码区域 -->
    <div class="flex-1 p-2.5 overflow-auto">
      <pre class="m-0 h-full bg-transparent border-none text-[#a9a9b3] font-mono text-xs leading-relaxed whitespace-pre-wrap">{{ code }}</pre>
    </div>
  </div>
</template>
