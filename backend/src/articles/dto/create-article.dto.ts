import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsISO8601,
  MaxLength,
} from "class-validator";

export class CreateArticleDto {
  @ApiProperty({ description: "标题", example: "我的第一篇博客" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: "正文内容（Markdown）",
    example: "这是文章内容...",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500_000)
  content!: string;

  @ApiPropertyOptional({ description: "摘要" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiPropertyOptional({ description: "发布时间（ISO 8601）" })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}
