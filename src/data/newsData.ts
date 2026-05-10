export interface NewsItem {
  id: string
  title: string
  date: string
  cover: string | null
  intro: string
}

export const newsData: NewsItem[] = [
  {
    id: 'first',
    title: "数智&数模联合授课：Python 入门",
    date: "2025年11月6日",
    cover: "/images/first.gif",
    intro: "为了帮助协会新同学快速上手，数智技术协会与数模协会强强联手，带来 Python 基础与开发环境配置干货。"
  },
  {
    id: 'dzsm',
    title: "新生电子扫盲",
    date: "2025年9月28日",
    cover: null,
    intro: "扫描二维码加入群聊，开启你的数智探索之旅。"
  },
  {
    id: 'dachuang',
    title: "破局·创新——大创项目申报与实战经验分享会",
    date: "2026年4月10日",
    cover: null,
    intro: "杨波老师主持，多位优秀学生代表分享大创项目实践经验，为有志科研创新的同学指明方向。"
  }
]
