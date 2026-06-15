<script setup lang="ts">
</script>

<template>
  <div class="hero-bg-wrapper" aria-hidden="true">
    <ul class="floating-icons-bg">
      <li v-for="n in 15" :key="n"></li>
    </ul>
  </div>
</template>

<style scoped>
.hero-bg-wrapper {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.floating-icons-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1; margin: 0; padding: 0;
}

.floating-icons-bg li {
  position: absolute; display: block; list-style: none;
  color: rgba(0, 58, 122, 0.08);
  bottom: -100px; animation: floatUp 20s linear infinite;
  font-weight: bold; font-size: 1.5em;
}
html.dark .floating-icons-bg li {
  color: rgba(148, 163, 184, 0.08);
}

@keyframes floatUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-120vh); opacity: 0; }
}

.floating-icons-bg li:nth-child(1) { left: 25%; animation-duration: 18s; }
.floating-icons-bg li:nth-child(2) { left: 10%; width: 30px; height: 30px; animation-duration: 10s; }
.floating-icons-bg li:nth-child(3) { left: 70%; width: 25px; height: 25px; animation-duration: 22s; }
.floating-icons-bg li:nth-child(4) { left: 40%; width: 15px; height: 15px; animation-duration: 9s; }
.floating-icons-bg li:nth-child(5) { left: 65%; animation-duration: 16s; }
.floating-icons-bg li:nth-child(6) { left: 75%; width: 40px; height: 40px; animation-duration: 28s; }
.floating-icons-bg li:nth-child(7) { left: 35%; animation-duration: 12s; }
.floating-icons-bg li:nth-child(8) { left: 50%; width: 20px; height: 20px; animation-duration: 20s; }
.floating-icons-bg li:nth-child(9) { left: 20%; width: 10px; height: 10px; animation-duration: 10s; }
.floating-icons-bg li:nth-child(10) { left: 85%; width: 35px; height: 35px; animation-duration: 14s; }
.floating-icons-bg li:nth-child(11) { left: 5%; animation-duration: 21s; }
.floating-icons-bg li:nth-child(12) { left: 90%; width: 28px; height: 28px; animation-duration: 17s; }
.floating-icons-bg li:nth-child(13) { left: 15%; width: 18px; height: 18px; animation-duration: 13s; }
.floating-icons-bg li:nth-child(14) { left: 80%; width: 22px; height: 22px; animation-duration: 26s; }
.floating-icons-bg li:nth-child(15) { left: 55%; width: 32px; height: 32px; animation-duration: 15s; }

.floating-icons-bg li:nth-child(1)::before { content: '{ }'; }
.floating-icons-bg li:nth-child(2)::before { content: '</>'; }
.floating-icons-bg li:nth-child(3)::before { content: 'AI'; }
.floating-icons-bg li:nth-child(4)::before { content: 'Σ'; }
.floating-icons-bg li:nth-child(5)::before { content: 'β'; }
.floating-icons-bg li:nth-child(6)::before { content: '01'; }
.floating-icons-bg li:nth-child(7)::before { content: 'λ'; }
.floating-icons-bg li:nth-child(8)::before { content: '=>'; }
.floating-icons-bg li:nth-child(9)::before { content: 'π'; }
.floating-icons-bg li:nth-child(10)::before { content: '#'; }
.floating-icons-bg li:nth-child(11)::before { content: 'JS'; }
.floating-icons-bg li:nth-child(12)::before { content: 'α'; }
.floating-icons-bg li:nth-child(13)::before { content: '++'; }
.floating-icons-bg li:nth-child(14)::before { content: 'CSS'; }
.floating-icons-bg li:nth-child(15)::before { content: 'Py'; }
</style>