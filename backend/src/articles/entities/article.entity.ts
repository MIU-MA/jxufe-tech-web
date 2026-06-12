import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('articles')
export class Article {
  @ApiProperty({ description: '文章ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '标题', example: '我的第一篇博客' })
  @Column()
  title: string;

  @ApiProperty({ description: '正文内容（Markdown）', example: '这是文章内容...' })
  @Column('text')
  content: string;

  @ApiPropertyOptional({ description: '摘要（不填则前端自动截取正文前100字）' })
  @Column({ type: 'text', nullable: true, default: null })
  summary: string | null;

  @ApiPropertyOptional({ description: '发布时间（不填则使用 createdAt）' })
  @Column({ type: 'datetime', nullable: true, default: null })
  publishedAt: Date | null;

  @ApiProperty({ description: '创建时间（数据库自动生成）' })
  @CreateDateColumn()
  createdAt: Date;
}
