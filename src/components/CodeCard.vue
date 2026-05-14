<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'untitled'
  },
  code: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div class="card">
    <div class="header">
      <div class="top">
        <div class="circle">
          <span class="red circle2"></span>
        </div>
        <div class="circle">
          <span class="yellow circle2"></span>
        </div>
        <div class="circle">
          <span class="green circle2"></span>
        </div>
        <div class="title">
          <p class="card-title-text">{{ title }}</p>
        </div>
      </div>
    </div>
    <div class="code-container">
      <pre><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 260px;
  height: 320px;
  background-color: #24233b;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0px 10px 20px rgba(0,0,0,0.3);
  transition: 0.5s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-7px) scale(1.05);
  box-shadow: 0px 15px 25px rgba(0,0,0,0.5);
  z-index: 10;
}

.top {
  display: flex;
  align-items: center;
  padding-left: 10px;
  height: 30px;
  background-color: #2e2c45;
}

.circle { padding: 0 4px; }
.circle2 { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
.red { background-color: #ff605c; }
.yellow { background-color: #ffbd44; }
.green { background-color: #00ca4e; }

.card-title-text {
  color: #aaa;
  font-size: 12px;
  margin-left: 15px;
  font-family: sans-serif;
}

.code-container {
  flex: 1;
  padding: 10px;
  overflow: auto;
}

.code-container pre {
  margin: 0;
  height: 100%;
  background-color: transparent;
  border: none;
  color: #a9a9b3;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>