import { ref, nextTick } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const STORAGE_KEY = 'jxufe-chat-history'
const TOKEN_KEY = 'jxufe-chat-token'

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

function loadToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function saveToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {}
}

function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {}
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

let chatToken = loadToken()

export interface ChatBudgetStatus {
  enabled: boolean
  requests: number
  requestLimit: number
  tokensUsed: number
  tokenBudget: number
}

async function fetchToken(): Promise<string> {
  try {
    const res = await fetch('/api/chat/token')
    if (!res.ok) throw new Error('获取令牌失败')
    const data = await res.json()
    const token = data.token || ''
    chatToken = token
    if (isBrowser()) saveToken(token)
    return token
  } catch {
    return ''
  }
}

export function useChat() {
  const messages = ref<ChatMessage[]>(isBrowser() ? loadHistory() : [])
  const isThinking = ref(false)
  const budget = ref<ChatBudgetStatus | null>(null)
  const containerRef = ref<HTMLElement | null>(null)
  let abortController: AbortController | null = null

  async function scrollToBottom() {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  }

  async function loadStatus() {
    try {
      const res = await fetch('/api/chat/status')
      if (res.ok) budget.value = await res.json()
    } catch {}
  }

  function clearMessages() {
    messages.value = []
    if (isBrowser()) saveHistory([])

    const oldToken = chatToken
    chatToken = ''
    if (isBrowser()) clearStoredToken()

    if (oldToken) {
      fetch('/api/chat/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: oldToken }),
      }).catch(() => {})
    }
  }

  async function send(content: string) {
    const text = content.trim()
    if (!text || isThinking.value) return

    if (!chatToken) {
      chatToken = await fetchToken()
      if (!chatToken) {
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: '出错了: 无法获取会话令牌，请稍后重试。',
          timestamp: Date.now(),
        }
        messages.value.push(errMsg)
        return
      }
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    messages.value.push(userMsg)
    if (isBrowser()) saveHistory(messages.value)
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

    async function attemptSend(): Promise<'ok' | 'retry'> {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, token: chatToken }),
        signal: abortController?.signal,
      })

      if (response.status === 403) {
        chatToken = await fetchToken()
        if (!chatToken) throw new Error('会话验证失败，请刷新页面后重试')
        return 'retry'
      }
      if (response.status === 429) {
        budget.value = { ...(budget.value ?? { requests: 0, requestLimit: 0, tokensUsed: 0, tokenBudget: 0 }), enabled: false }
        throw new Error('今日 AI 使用额度已用完，请明天再试')
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
                if (isBrowser()) saveHistory(messages.value)
                lastSave = now
              }
              await scrollToBottom()
            }
          } catch {}
        }
      }

      if (isBrowser()) saveHistory(messages.value)
      return 'ok'
    }

    try {
      abortController = new AbortController()

      let retried = false
      for (;;) {
        const result = await attemptSend()
        if (result === 'ok') break
        if (retried) throw new Error('会话验证失败，请稍后重试')
        retried = true
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        if (!aiMsg.content) {
          messages.value.pop()
        }
      } else {
        aiMsg.content = `出错了: ${(err as Error).message}\n\n请稍后重试，或检查网络连接。`
        console.error('Chat API error:', err)
      }
      if (isBrowser()) saveHistory(messages.value)
    } finally {
      isThinking.value = false
      abortController = null
    }
  }

  if (isBrowser()) loadStatus()

  return { messages, isThinking, budget, containerRef, send, clearMessages }
}
