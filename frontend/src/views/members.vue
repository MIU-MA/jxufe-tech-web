<script setup lang="ts">
import { ref } from 'vue';
import MemberCard from '../components/MemberCard.vue';
import { useScrollReveal } from '../composables/useScrollReveal';

const members = ref([
  { name: "y_iiiz", role: "大数据241", badge: "团支书", bio: "协会苦力1", img: "/images/gzm.jpg" },
  { name: "NLH", role: "信计241", badge: "学习部部长", bio: "协会苦力2", img: "/images/nlh.jpg" },
  { name: "高锰酸钾.", role: "量化241", badge: "组织部部长", bio: "演辩协驻数智协会成员之一，专攻辩论数智化分析方向", img: "/images/yjx.jpg" },
  { name: "Camellia", role: "信管241", badge: "宣传部部长", bio: "吃干饭的", img: "/images/wkd.jpg" },
  { name: "趋虞平雷", role: "信管221", badge: "摄政王", bio: "保研至西安电子科技大学计算机科学与技术专业，2025蓝桥杯省一，国家奖学金", img: "/images/wsy.jpg" },
  { name: "有毒的🐏", role: "大数据241", badge: "技术先锋", bio: "蓝桥杯省二，睿抗国三", img: "/images/yzn.jpg" },
  { name: "job", role: "信计241", badge: "学习部成员", bio: "加权王，蓝桥杯省二，华数杯国三", img: "/images/zb.jpg" },
  { name: "一只锦鲤", role: "信计241", badge: "学习部成员", bio: "院学习部部长", img: "/images/lyf.jpg" },
  { name: "远", role: "计算机拔尖班", badge: "学习部成员", bio: "睿抗国一，蓝桥杯省三", img: "/images/yhy.jpg" }
]);

useScrollReveal();
</script>

<template>
  <main class="max-w-6xl mx-auto px-5 pt-20 pb-10 min-h-[calc(100vh-350px)]">
    <div
      class="fade-in-on-scroll text-center mb-12 p-8 rounded-xl shadow-md transition-colors duration-300"
      :style="{ backgroundColor: 'var(--color-bg-card)', boxShadow: '0 4px 12px var(--color-shadow)' }"
    >
      <h1 class="text-[2.5em] md:text-[2em] font-bold m-0 mb-2.5" style="color: #ff6f00">{{ $t('members.title') }}</h1>
    </div>
    <div class="fade-in-on-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-auto-fill gap-8 pb-16"
      style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))">
      <MemberCard v-for="(member, index) in members" :key="index"
        :img="member.img"
        :name="member.name"
        :role="member.role"
        :bio="member.bio"
        :badge="member.badge"
      />
    </div>
  </main>
</template>
