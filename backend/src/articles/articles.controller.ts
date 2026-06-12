import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Article } from './entities/article.entity';

@ApiTags('文章管理')
@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有文章' })
  @ApiResponse({ status: 200, description: '文章列表', type: [Article] })
  getAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单篇文章' })
  @ApiResponse({ status: 200, description: '文章详情', type: Article })
  getOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章（需登录）' })
  @ApiResponse({ status: 201, description: '创建成功', type: Article })
  create(@Body() body: { title: string; content: string; summary?: string; publishedAt?: string }) {
    return this.articlesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章（需登录）' })
  @ApiResponse({ status: 200, description: '更新成功', type: Article })
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; summary?: string | null; publishedAt?: string | null },
  ) {
    return this.articlesService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章（需登录）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}
