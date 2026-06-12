import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private repo: Repository<Article>,
  ) {}

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: { title: string; content: string; summary?: string; publishedAt?: string }) {
    const article = this.repo.create({
      title: dto.title,
      content: dto.content,
      summary: dto.summary ?? null,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
    });
    return this.repo.save(article);
  }

  async update(id: number, dto: { title?: string; content?: string; summary?: string | null; publishedAt?: string | null }) {
    const article = await this.repo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('文章不存在');

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.content !== undefined) article.content = dto.content;

    // 允许清空 summary（传 null）
    if ('summary' in dto) {
      article.summary = dto.summary ?? null;
    }

    // 允许清空 publishedAt（传 null 则回退到 createdAt）
    if ('publishedAt' in dto) {
      article.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    return this.repo.save(article);
  }

  async remove(id: number) {
    const article = await this.repo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('文章不存在');
    return this.repo.delete(id);
  }
}
