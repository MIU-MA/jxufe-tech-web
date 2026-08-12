import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Article } from "./entities/article.entity";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";

@ApiTags("文章管理")
@Controller("api/articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: "获取所有文章" })
  @ApiResponse({ status: 200, description: "文章列表", type: [Article] })
  getAll() {
    return this.articlesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "获取单篇文章" })
  @ApiResponse({ status: 200, description: "文章详情", type: Article })
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建文章（需登录）" })
  @ApiResponse({ status: 201, description: "创建成功", type: Article })
  create(@Body() body: CreateArticleDto) {
    return this.articlesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新文章（需登录）" })
  @ApiResponse({ status: 200, description: "更新成功", type: Article })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除文章（需登录）" })
  @ApiResponse({ status: 200, description: "删除成功" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
