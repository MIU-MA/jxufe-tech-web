import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { TokenService } from './token.service'

@Module({
  controllers: [ChatController],
  providers: [ChatService, TokenService],
})
export class ChatModule {}
