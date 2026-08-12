import { Injectable, Logger } from "@nestjs/common";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { TokenUsage } from "./ai-budget.service";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const SYSTEM_PROMPT = `你是"数智技术协会"的 AI 助手。
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
6. 涉及协会专业问题时，体现技术社团的专业素养`;

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_TURNS = 10;
const MAX_CONTEXT_CHARS = 12_000;

// 已存在的环境变量优先，.env 只回填缺失项（避免文件覆盖真实密钥）
function loadEnvFile(): Record<string, string> {
  const envPath = resolve(__dirname, "../../.env");
  const result: Record<string, string> = {};
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!(key in process.env)) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

const env = { ...process.env, ...loadEnvFile() };

const API_URL = "https://api.deepseek.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

function isRetryableError(err: unknown): boolean {
  const msg = (err as Error).message?.toLowerCase() || "";
  const cause = (err as { cause?: Error })?.cause;
  const causeMsg = cause?.message?.toLowerCase() || "";

  const retryablePatterns = [
    "fetch failed",
    "network error",
    "connection refused",
    "connection reset",
    "timeout",
    "econnrefused",
    "econnreset",
    "etimedout",
    "enotfound",
    "eai_again",
    "undici",
  ];

  return retryablePatterns.some((p) => msg.includes(p) || causeMsg.includes(p));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly apiUrl = API_URL;
  private readonly apiKey: string;

  /** 按 token 维护会话历史（最近 N 轮）。单实例内存实现；多实例可替换为 Redis。 */
  private readonly sessions = new Map<string, ChatMessage[]>();
  private readonly MAX_SESSIONS = 2000;

  constructor() {
    this.apiKey = env.DEEPSEEK_API_KEY || "";
    if (!this.apiKey) {
      this.logger.warn(
        "DEEPSEEK_API_KEY 未设置！聊天功能将不可用。请在 backend/.env 中配置 DEEPSEEK_API_KEY",
      );
    } else {
      this.logger.log(
        `DeepSeek API Key 已加载 (${this.apiKey.slice(0, 8)}...)`,
      );
    }
  }

  appendMessage(token: string, message: string): ChatMessage[] {
    let history = this.sessions.get(token);
    if (!history) {
      history = [];
    }

    history.push({
      role: "user",
      content: message.slice(0, MAX_MESSAGE_CHARS),
    });

    const recent = history.slice(-MAX_HISTORY_TURNS);

    let total = recent.reduce((sum, m) => sum + m.content.length, 0);
    while (recent.length > 1 && total > MAX_CONTEXT_CHARS) {
      total -= recent[0].content.length;
      recent.shift();
    }

    this.sessions.set(token, recent);
    return [{ role: "system", content: SYSTEM_PROMPT }, ...recent];
  }

  recordAssistantReply(token: string, content: string): void {
    if (!content) return;
    const history = this.sessions.get(token) ?? [];
    history.push({
      role: "assistant",
      content: content.slice(0, MAX_MESSAGE_CHARS),
    });
    this.sessions.set(token, history.slice(-MAX_HISTORY_TURNS));

    if (this.sessions.size > this.MAX_SESSIONS) {
      const keys = [...this.sessions.keys()];
      for (const k of keys.slice(0, Math.floor(this.MAX_SESSIONS / 4))) {
        this.sessions.delete(k);
      }
    }
  }

  resetSession(token: string): void {
    this.sessions.delete(token);
  }

  async chat(
    message: string,
    token: string,
    onUsage?: (u: TokenUsage) => void,
  ): Promise<ReadableStream<Uint8Array>> {
    const messages = this.appendMessage(token, message);

    const body: Record<string, unknown> = {
      model: "deepseek-chat",
      messages,
      stream: true,
      temperature: 0.8,
      max_tokens: 1024, // 控制单次调用费用
      stream_options: { include_usage: true }, // 从流末尾取 usage 计入预算
    };

    this.logger.log(`发送请求到 DeepSeek API，消息数: ${messages.length}`);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetchWithTimeout(
          this.apiUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
          },
          REQUEST_TIMEOUT_MS,
        );

        if (!response.ok) {
          const errorBody = await response.text();
          this.logger.error(
            `DeepSeek API 错误: ${response.status} — ${errorBody}`,
          );
          throw new Error(
            `DeepSeek API 返回错误 ${response.status}: ${errorBody}`,
          );
        }

        this.logger.log("DeepSeek 流式响应已建立");
        return this.withUsageCapture(response.body!, onUsage);
      } catch (err) {
        lastError = err as Error;

        const cause = (err as { cause?: Error })?.cause;
        this.logger.error(
          `请求失败 (尝试 ${attempt + 1}/${MAX_RETRIES + 1}): ` +
            `${lastError.message}` +
            (cause ? ` [cause: ${cause.message}]` : ""),
        );

        if (!isRetryableError(err)) {
          throw err;
        }

        if (attempt === MAX_RETRIES) {
          throw new Error(
            `DeepSeek API 请求失败（已重试 ${MAX_RETRIES} 次）: ${lastError.message}`,
          );
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
        this.logger.warn(`将在 ${delay}ms 后重试...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError ?? new Error("未知错误");
  }

  private withUsageCapture(
    source: ReadableStream<Uint8Array>,
    onUsage?: (u: TokenUsage) => void,
  ): ReadableStream<Uint8Array> {
    const reader = source.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const logger = this.logger;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        let lastUsage: TokenUsage | null = null;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6);
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload) as {
                  usage?: {
                    prompt_tokens?: number;
                    completion_tokens?: number;
                  };
                };
                const promptTokens = parsed.usage?.prompt_tokens;
                const completionTokens = parsed.usage?.completion_tokens;
                if (promptTokens != null && completionTokens != null) {
                  lastUsage = {
                    promptTokens,
                    completionTokens,
                  };
                }
              } catch {
                /* 非 JSON 行，忽略 */
              }
            }

            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          if (lastUsage) {
            try {
              onUsage?.(lastUsage);
            } catch (e) {
              logger.error(`登记 usage 失败: ${(e as Error).message}`);
            }
          }
          try {
            controller.close();
          } catch {
            /* 已关闭 */
          }
        }
      },
    });
  }
}
