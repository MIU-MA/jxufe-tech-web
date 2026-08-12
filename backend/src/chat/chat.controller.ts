import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Logger,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { ChatService } from "./chat.service";
import { TokenService } from "./token.service";
import { AiBudgetService } from "./ai-budget.service";
import { ChatRequestDto } from "./dto/chat-request.dto";
import { OriginGuard } from "../common/origin.guard";
import { RateLimit } from "../common/rate-limit.guard";

@ApiTags("AI 聊天")
@Controller("api/chat")
@UseGuards(OriginGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly tokenService: TokenService,
    private readonly aiBudget: AiBudgetService,
  ) {}

  @Get("token")
  @RateLimit({ limit: 30, ttlMs: 60_000 })
  @ApiOperation({ summary: "获取聊天会话令牌（反滥用）" })
  getToken(@Req() req: Request) {
    const token = this.tokenService.generate(req.ip || "unknown");
    return { token };
  }

  @Get("status")
  @ApiOperation({ summary: "查询今日 AI 额度状态" })
  async status() {
    return this.aiBudget.status();
  }

  @Post("reset")
  @RateLimit({ limit: 30, ttlMs: 60_000 })
  @ApiOperation({ summary: "清空会话历史（新对话）" })
  @ApiResponse({ status: 200, description: "会话已重置" })
  @ApiResponse({ status: 403, description: "无效或过期的令牌" })
  reset(@Req() req: Request, @Body() body: { token?: string }) {
    const ip = req.ip || "unknown";
    if (!body?.token || !this.tokenService.validate(ip, body.token)) {
      throw new HttpException("无效或过期的会话令牌", HttpStatus.FORBIDDEN);
    }
    this.tokenService.invalidate(body.token);
    this.chatService.resetSession(body.token);
    return { ok: true };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 30, ttlMs: 60_000 })
  @ApiOperation({ summary: "发送消息（SSE 流式返回）" })
  @ApiResponse({ status: 200, description: "SSE 流" })
  @ApiResponse({ status: 400, description: "消息为空或超长" })
  @ApiResponse({ status: 403, description: "无效或过期的会话令牌" })
  @ApiResponse({ status: 429, description: "今日额度已用完" })
  async chat(
    @Body() body: ChatRequestDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const ip = req.ip || "unknown";
    const token = body.token;

    if (!token || !this.tokenService.validate(ip, token)) {
      res.status(403).json({ error: "无效或过期的会话令牌，请刷新页面后重试" });
      return;
    }

    if (!(await this.aiBudget.check())) {
      res.status(429).json({ error: "今日 AI 使用额度已用完，请明天再试" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    try {
      const stream = await this.chatService.chat(
        body.message,
        token,
        (usage) => {
          void this.aiBudget.record(usage);
        },
      );
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      const push = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              this.chatService.recordAssistantReply(token, assistantText);
              this.logger.log("DeepSeek 流式传输完成");
              res.write("data: [DONE]\n\n");
              res.end();
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                // 累积 assistant 内容供历史上下文
                try {
                  const parsed = JSON.parse(line.slice(6)) as {
                    choices?: { delta?: { content?: unknown } }[];
                  };
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (typeof delta === "string") assistantText += delta;
                } catch {
                  /* 透传即可 */
                }
                res.write(line + "\n");
              }
            }
          }
        } catch (err) {
          this.logger.error(`流读取失败: ${(err as Error).message}`);
          res.end();
        }
      };

      void push();
    } catch (err) {
      const message = (err as Error).message;
      const cause = (err as { cause?: Error })?.cause;

      this.logger.error(
        `请求失败: ${message}` + (cause ? ` [cause: ${cause.message}]` : ""),
      );

      let userMessage = "抱歉，请求 AI 服务时出现了错误，请稍后重试。";
      if (message.includes("timeout") || message.includes("aborted")) {
        userMessage = "AI 服务响应超时（30 秒），请尝试缩短问题后重试。";
      } else if (message.includes("retry") || message.includes("重试")) {
        userMessage = "AI 服务暂时不可达，已自动重试但仍失败，请稍后再试。";
      }

      res.write(`data: ${JSON.stringify({ error: userMessage })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
