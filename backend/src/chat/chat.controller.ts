import { Controller, Post, Get, Body, Res, Req, Logger, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { ChatService, ChatMessage } from './chat.service'
import { TokenService } from './token.service'
import { AntiAbuseGuard } from '../common/anti-abuse.guard'

@ApiTags('AI 聊天')
@Controller('api/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name)

  constructor(
    private readonly chatService: ChatService,
    private readonly tokenService: TokenService,
  ) {}

  private getIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || (req.headers['x-real-ip'] as string)
      || req.ip
      || 'unknown';
  }

  @Get('token')
  @ApiOperation({ summary: '获取聊天会话令牌（反滥用）' })
  getToken(@Req() req: Request) {
    const ip = this.getIp(req);
    const token = this.tokenService.generate(ip);
    return { token };
  }

  @Post()
  @UseGuards(AntiAbuseGuard)
  @ApiOperation({ summary: '发送消息（SSE 流式返回）' })
  async chat(
    @Body() body: { messages: ChatMessage[]; token?: string },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const ip = this.getIp(req);

    if (!body.token || !this.tokenService.validate(ip, body.token)) {
      res.status(403).json({ error: '无效或过期的会话令牌，请刷新页面后重试' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    try {
      const stream = await this.chatService.chat(body.messages)
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const push = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              this.logger.log('DeepSeek 流式传输完成')
              res.write('data: [DONE]\n\n')
              res.end()
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                res.write(line + '\n')
              }
            }
          }
        } catch (err) {
          this.logger.error(`流读取失败: ${(err as Error).message}`)
          res.end()
        }
      }

      push()
    } catch (err) {
      const message = (err as Error).message
      const cause = (err as { cause?: Error })?.cause

      this.logger.error(
        `请求失败: ${message}` +
          (cause ? ` [cause: ${cause.message}]` : ''),
      )

      let userMessage = '抱歉，请求 AI 服务时出现了错误，请稍后重试。'
      if (message.includes('timeout') || message.includes('aborted')) {
        userMessage = 'AI 服务响应超时（30 秒），请尝试缩短问题后重试。'
      } else if (message.includes('retry') || message.includes('重试')) {
        userMessage = 'AI 服务暂时不可达，已自动重试但仍失败，请稍后再试。'
      }

      res.write(
        `data: ${JSON.stringify({ error: userMessage })}\n\n`,
      )
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}
