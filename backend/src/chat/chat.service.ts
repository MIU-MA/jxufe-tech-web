import { Injectable, Logger } from '@nestjs/common'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ==================== 手动加载 .env（零依赖） ====================
function loadEnvFile(): Record<string, string> {
  const envPath = resolve(__dirname, '../../.env')
  try {
    const content = readFileSync(envPath, 'utf-8')
    const result: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      result[key] = value
    }
    return result
  } catch {
    return {}
  }
}

const env = { ...process.env, ...loadEnvFile() }

// ==================== 配置 ====================
const API_URL = 'https://api.deepseek.com/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 30_000   // 单次请求超时
const MAX_RETRIES = 1               // 网络错误重试次数

// ==================== 判断是否为可重试的网络错误 ====================
function isRetryableError(err: unknown): boolean {
  const msg = (err as Error).message?.toLowerCase() || ''
  const cause = (err as { cause?: Error })?.cause
  const causeMsg = cause?.message?.toLowerCase() || ''

  // Node.js fetch 在 TCP/DNS/TLS 层面的瞬时故障
  const retryablePatterns = [
    'fetch failed',
    'network error',
    'connection refused',
    'connection reset',
    'timeout',
    'econnrefused',
    'econnreset',
    'etimedout',
    'enotfound',
    'eai_again',
    'undici',
  ]

  return retryablePatterns.some(
    (p) => msg.includes(p) || causeMsg.includes(p),
  )
}

// ==================== 带超时的 fetch ====================
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timer)
  }
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)
  private readonly apiUrl = API_URL
  private readonly apiKey: string

  constructor() {
    this.apiKey = env.DEEPSEEK_API_KEY || ''
    if (!this.apiKey) {
      this.logger.warn(
        'DEEPSEEK_API_KEY 未设置！聊天功能将不可用。请在 backend/.env 中配置 DEEPSEEK_API_KEY',
      )
    } else {
      this.logger.log(
        `DeepSeek API Key 已加载 (${this.apiKey.slice(0, 8)}...)`,
      )
    }
  }

  async chat(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    const body: Record<string, unknown> = {
      model: 'deepseek-chat',
      messages,
      stream: true,
      temperature: 0.8,
      max_tokens: 4096,
    }

    this.logger.log(`发送请求到 DeepSeek API，消息数: ${messages.length}`)

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetchWithTimeout(
          this.apiUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
          },
          REQUEST_TIMEOUT_MS,
        )

        if (!response.ok) {
          const errorBody = await response.text()
          this.logger.error(
            `DeepSeek API 错误: ${response.status} — ${errorBody}`,
          )
          throw new Error(
            `DeepSeek API 返回错误 ${response.status}: ${errorBody}`,
          )
        }

        this.logger.log('DeepSeek 流式响应已建立')
        return response.body!
      } catch (err) {
        lastError = err as Error

        // 结构化日志，方便排查
        const cause = (err as { cause?: Error })?.cause
        this.logger.error(
          `请求失败 (尝试 ${attempt + 1}/${MAX_RETRIES + 1}): ` +
            `${lastError.message}` +
            (cause ? ` [cause: ${cause.message}]` : ''),
        )

        // 非网络错误不重试
        if (!isRetryableError(err)) {
          throw err
        }

        // 最后一次尝试也失败，抛出
        if (attempt === MAX_RETRIES) {
          throw new Error(
            `DeepSeek API 请求失败（已重试 ${MAX_RETRIES} 次）: ${lastError.message}`,
          )
        }

        // 重试前等待一小段时间（指数退避）
        const delay = Math.min(1000 * Math.pow(2, attempt), 3000)
        this.logger.warn(`将在 ${delay}ms 后重试...`)
        await new Promise((r) => setTimeout(r, delay))
      }
    }

    // 理论上不会到这里，但 TypeScript 需要
    throw lastError ?? new Error('未知错误')
  }
}
