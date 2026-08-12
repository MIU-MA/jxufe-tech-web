import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class ChatRequestDto {
  @ApiProperty({ description: "本次用户输入", example: "介绍一下数智技术协会" })
  @IsString()
  @Length(1, 2000)
  message!: string;

  @ApiPropertyOptional({ description: "会话令牌" })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  token?: string;
}
