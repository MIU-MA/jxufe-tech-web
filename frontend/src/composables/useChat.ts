import { ref, nextTick } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ApiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'jxufe-chat-history'

const SYSTEM_PROMPT = `你是"数智技术协会"的 AI 助手。
协会隶属于江西财经大学信息管理与数学学院，专注于数据科学、人工智能和项目开发实践。

协会下设三个部门：
- 宣传部：负责社团形象塑造与推广，制作海报和宣传物料
- 组织部：策划并执行讲座、分享会、比赛等活动
- 学习部：研究前沿技术，组织技术分享和培训

预设问答（用户提问涉及以下话题时，严格按此回复）：
- 想看分数线 → 可以前往江西财经大学网络安全协会查询历年录取分数线：https://csec.jxufe.edu.cn/gaokao
- 想了解大学/新生必备/大学软件 → 回复：
  学习类：学习通（上课签到/提交作业）、中国大学MOOC（网课）、PU口袋校园（活动）、喜鹊儿（教务：课表/考试/成绩）、U校园（英语课）、知到（网课）、创高体育（校园跑）、大学搜题酱（搜答案）
  生活类：菜鸟（取快递）、U净（扫码洗衣）、慧生活798（直饮水）、中国工商银行（学校统一办卡）、微信智慧江财小程序（请假/销假/图书馆预约/信息查询）、铁路12306（购票，新生凭录取通知书可买学生票）
- 想了解协会/协会是什么 → 协会隶属于江西财经大学信息管理与数学学院，专注于数据科学、人工智能和项目开发实践。

你的职责：
1. 回答关于 Python、AI、Web 开发等技术问题，给出具体可操作的代码和建议
2. 介绍协会情况、部门设置、加入方式
3. 用友好、专业、不过分卖萌的语气回复
4. 代码用 Markdown 格式输出，注释用中文
5. 回复简洁有力，不要长篇大论（控制在 100 字以内）
6. 涉及协会专业问题时，体现技术社团的专业素养`

function loadHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveHistory(messages: readonly ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {}
}

let chatToken = ''

async function fetchToken(): Promise<string> {
  try {
    const res = await fetch('/api/chat/token')
    if (!res.ok) throw new Error('获取令牌失败')
    const data = await res.json()
    return data.token || ''
  } catch {
    return ''
  }
}

export function useChat() {
  const messages = ref<ChatMessage[]>(loadHistory())
  const isThinking = ref(false)
  const containerRef = ref<HTMLElement | null>(null)
  let abortController: AbortController | null = null

  if (!chatToken) {
    fetchToken().then(t => { chatToken = t })
  }

  async function scrollToBottom() {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  }

  function clearMessages() {
    messages.value = []
    saveHistory([])
  }

  function buildApiMessages(): ApiMessage[] {
    const recent = messages.value.slice(-20)
    const apiMessages: ApiMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]
    for (const msg of recent) {
      apiMessages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    }
    return apiMessages
  }

  async function send(content: string) {
    const text = content.trim()
    if (!text || isThinking.value) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    messages.value.push(userMsg)
    saveHistory(messages.value)
    await scrollToBottom()

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    messages.value.push(aiMsg)
    isThinking.value = true
    await scrollToBottom()

    try {
      abortController = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: buildApiMessages(), token: chatToken }),
        signal: abortController.signal,
      })

      if (response.status === 403) {
        chatToken = await fetchToken()
        if (!chatToken) throw new Error('会话验证失败，请刷新页面后重试')
        throw new Error('令牌已刷新，请重新发送消息')
      }
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('响应体为空')

      const decoder = new TextDecoder()
      let buffer = ''
      let lastSave = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)

          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed?.choices?.[0]?.delta?.content
            if (delta) {
              aiMsg.content += delta
              const now = Date.now()
              if (now - lastSave > 200) {
                saveHistory(messages.value)
                lastSave = now
              }
              await scrollToBottom()
            }
          } catch {}
        }
      }

      saveHistory(messages.value)
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        if (!aiMsg.content) {
          messages.value.pop()
        }
      } else {
        aiMsg.content = `出错了: ${(err as Error).message}\n\n请稍后重试，或检查网络连接。`
        console.error('Chat API error:', err)
      }
      saveHistory(messages.value)
    } finally {
      isThinking.value = false
      abortController = null
    }
  }

  return { messages, isThinking, containerRef, send, clearMessages }
}
