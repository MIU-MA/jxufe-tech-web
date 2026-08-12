import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { TokenService } from "./token.service";
import { AiBudgetService } from "./ai-budget.service";
import { AiUsage } from "./entities/ai-usage.entity";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([AiUsage])],
  controllers: [ChatController],
  providers: [ChatService, TokenService, AiBudgetService],
})
export class ChatModule {}
