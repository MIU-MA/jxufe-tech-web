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
  <main class="page-container">
      <div class="members-header fade-in-on-scroll">
        <div class="title-wrap">
          <h1>MEMBERS</h1>
        </div>
      </div>
    <div class="members-grid fade-in-on-scroll">
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

<style scoped>
.title-wrap { text-align: center; }

.title-wrap h1 {
  color: #ff6f00;
  font-size: 2.5em;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.title-wrap .accent { color: #334155; font-weight: 300; }

.members-header {
    text-align: center;
    margin-bottom: 50px;
    padding: 30px;
    background-color: var(--color-bg-card);
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: background-color 0.3s ease;
}

.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    padding-bottom: 60px;
}

@media (max-width: 768px) {
    .members-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .members-header h1 {
        font-size: 2em;
    }
}
</style>
