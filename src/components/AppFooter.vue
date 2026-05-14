<script setup lang="ts">
import { ref } from 'vue';

// 定义相关链接数据
const friendLinks = ref([
    {
      name: "程序设计协会",
      url: "https://jxufe-acm.cn",
      logo: "https://jxufe-acm.cn/images/logo.png"
    },
    {
      name: "计算机协会",
      url: "https://qm.qq.com/q/vh2EE5qytM",
      logo: "https://jxufe-acm.cn/images/jsjxh.png"
    },
    {
      name: "网络安全协会",
      url: "https://csec.jxufe.edu.cn",
      logo: "https://csec.jxufe.edu.cn/favicon.svg"
    },
    {
      name: "江西财经大学",
      url: "https://www.jxufe.edu.cn/",
      logo: "https://jxufe-acm.cn/jxufe.png"
    }
]);

const contactInfo = {
  email: "2117410945@qq.com",
  address: "江西省南昌市昌北经济技术开发区双港东大街169号",
  school: "信息管理与数学学院"
};
</script>

<template>
  <footer class="site-footer">
    
    <div class="footer-main">
      <div class="page-container footer-grid">
        
        <div class="footer-col brand-col">
          <div class="brand-header">
            <img src="/logo.jpg" alt="Logo" class="footer-logo-img" />
            <span class="brand-name">数智技术协会</span>
          </div>
          <p class="brand-desc">
            立足校园，探索前沿。<br>
            我们致力于打造全校最专业的数据科学与人工智能交流平台，激发每一位同学的技术潜能。
          </p>
        </div>

        <div class="footer-col contact-col">
          <h4 class="footer-heading">联系我们</h4>
          <ul class="contact-list">
            <li>
              <span class="icon">📧</span>
              <a :href="`mailto:${contactInfo.email}`">{{ contactInfo.email }}</a>
            </li>
            <li>
              <span class="icon">🏫</span>
              <span>{{ contactInfo.school }}</span>
            </li>
            <li>
              <span class="icon">📍</span>
              <span>{{ contactInfo.address }}</span>
            </li>
          </ul>
        </div>

        <div class="footer-col links-col">
          <h4 class="footer-heading">友情链接</h4>
          <div class="vertical-links">
            <a 
              v-for="(item, index) in friendLinks" 
              :key="index" 
              :href="item.url" 
              class="link-row" 
              target="_blank"
            >
              <img :src="item.logo" :alt="item.name">
              <span>{{ item.name }}</span>
            </a>
          </div>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
     
        <p>&copy; {{ new Date().getFullYear() }} 江西财经大学 数智技术协会. All Rights Reserved.</p>
        <div class="beian-row">
          <a href="https://beian.miit.gov.cn/" target="_blank">赣ICP备2025074452号</a>
          <span class="divider">|</span>
          <a href="https://beian.mps.gov.cn/" target="_blank" class="police-link">
            <img src="https://www.beian.gov.cn/img/ghs.png" alt="公安备案">
            赣公网安备36010602000365号
          </a>

      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  width: 100%;
  background-color: var(--color-bg-footer);
  color: var(--color-text-footer);
  border-top: 1px solid var(--color-border-light);
  margin-top: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 1. 主要内容区布局 */
.footer-main {
  padding: 60px 0 50px;
}

.footer-grid {
  display: grid;
  /* PC端三列布局：左侧宽，中间和右侧自适应 */
  grid-template-columns: 2fr 1.5fr 1fr; 
  gap: 40px;
}

/* --- 第一栏--- */
.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-heading);
}

.brand-desc {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-muted);
  max-width: 90%;
}

/* --- 通用标题样式 --- */
.footer-heading {
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 25px;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

/* 标题左侧的装饰竖线 */
.footer-heading::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  background-color: var(--color-accent);
  border-radius: 2px;
}

/* --- 第二栏：联系我们 --- */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.contact-list .icon {
  font-size: 1.1rem;
  opacity: 0.8;
}

.contact-list a {
  color: var(--color-text-footer);
  text-decoration: none;
  transition: color 0.2s;
}

.contact-list a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* --- 第三栏：友情链接 --- */
.vertical-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-row {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text-footer);
  font-size: 0.95rem;
  padding: 8px 12px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.link-row img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 50%;
  filter: none;
}

.link-row:hover {
  background-color: var(--color-bg-card);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateX(5px);
  box-shadow: 0 2px 8px var(--color-shadow);
}

/* 2. 底部版权条 */
.footer-bottom {
  background-color: var(--color-bg-footer-bottom);
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 20px;
  font-size: 0.85rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  transition: background-color 0.3s ease;
}

.beian-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.beian-row a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}

.beian-row a:hover {
  color: #fff;
}

.police-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}
.police-link:hover {
  color: #fff;
}
.police-link img {
  height: 16px;
  margin-right: 4px;
}

.divider {
  opacity: 0.4;
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .brand-desc {
    max-width: 100%;
  }
}
</style>