<script setup lang="ts">
const icons = [
  { left: '25%', w: null, h: null, dur: '18s', text: '{ }' },
  { left: '10%', w: '30px', h: '30px', dur: '10s', text: '</>' },
  { left: '70%', w: '25px', h: '25px', dur: '22s', text: 'AI' },
  { left: '40%', w: '15px', h: '15px', dur: '9s',  text: 'Σ'  },
  { left: '65%', w: null, h: null, dur: '16s', text: 'β'  },
  { left: '75%', w: '40px', h: '40px', dur: '28s', text: '01' },
  { left: '35%', w: null, h: null, dur: '12s', text: 'λ'  },
  { left: '50%', w: '20px', h: '20px', dur: '20s', text: '=>' },
  { left: '20%', w: '10px', h: '10px', dur: '10s', text: 'π'  },
  { left: '85%', w: '35px', h: '35px', dur: '14s', text: '#'  },
  { left: '5%',  w: null, h: null, dur: '21s', text: 'JS' },
  { left: '90%', w: '28px', h: '28px', dur: '17s', text: 'α'  },
  { left: '15%', w: '18px', h: '18px', dur: '13s', text: '++' },
  { left: '80%', w: '22px', h: '22px', dur: '26s', text: 'CSS' },
  { left: '55%', w: '32px', h: '32px', dur: '15s', text: 'Py' },
]
</script>

<template>
  <div class="absolute inset-0 overflow-hidden z-0 pointer-events-none" aria-hidden="true">
    <ul class="floating-icons-bg absolute inset-0 z-[1] m-0 p-0">
      <li
        v-for="(icon, n) in icons"
        :key="n"
        class="absolute block text-[1.5em] font-bold"
        :style="{
          left: icon.left,
          width: icon.w || 'auto',
          height: icon.h || 'auto',
          bottom: '-100px',
          animationName: 'floatUp',
          animationDuration: icon.dur,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }"
      >{{ icon.text }}</li>
    </ul>
  </div>
</template>

<style>
.floating-icons-bg li {
  color: rgba(0, 58, 122, 0.08);
}
html.dark .floating-icons-bg li {
  color: rgba(148, 163, 184, 0.08);
}
</style>
