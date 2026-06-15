import { Controller, Post, Body, Res, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import type { Response } from 'express'
import { ChatService, ChatMessage } from './chat.service'

@ApiTags('AI 聊天')
@Controller('api/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name)

  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: '发送消息（SSE 流式返回）' })
  async chat(@Body() body: { messages: ChatMessage[] }, @Res() res: Response) {
    // 设置 SSE 流式响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // 禁用 Nginx 缓冲

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
            buffer = lines.pop() || '' // 最后一个不完整块，留到下次

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                // 直接转发 DeepSeek 的 SSE 数据块
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

      // 根据错误类型给用户友好的提示
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
