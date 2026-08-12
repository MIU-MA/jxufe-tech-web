import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Article } from "./entities/article.entity";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { RebuildService } from "../rebuild/rebuild.service";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private repo: Repository<Article>,
    private readonly rebuildService: RebuildService,
  ) {}

  /** 文章变更后触发前端 SSG 重建（异步，不阻塞响应；未配置令牌则跳过）。 */
  private triggerRebuild(): void {
    void this.rebuildService
      .trigger("cms-article-updated")
      .catch(() => undefined);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateArticleDto) {
    const article = this.repo.create({
      title: dto.title,
      content: dto.content,
      summary: dto.summary ?? null,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
    });
    const saved = await this.repo.save(article);
    this.triggerRebuild();
    return saved;
  }

  async update(id: number, dto: UpdateArticleDto) {
    const article = await this.repo.findOne({ where: { id } });
    if (!article) throw new NotFoundException("文章不存在");

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.content !== undefined) article.content = dto.content;

    // 允许清空 summary（传 null）
    if ("summary" in dto) {
      article.summary = dto.summary ?? null;
    }

    // 允许清空 publishedAt（传 null 则回退到 createdAt）
    if ("publishedAt" in dto) {
      article.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    const saved = await this.repo.save(article);
    this.triggerRebuild();
    return saved;
  }

  async remove(id: number) {
    const article = await this.repo.findOne({ where: { id } });
    if (!article) throw new NotFoundException("文章不存在");
    const result = await this.repo.delete(id);
    this.triggerRebuild();
    return result;
  }
}
