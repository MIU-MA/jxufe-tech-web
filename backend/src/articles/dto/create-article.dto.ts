import { IsString, IsNotEmpty, IsOptional, IsISO8601 } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsISO8601()
  publishedAt?: string;
}
