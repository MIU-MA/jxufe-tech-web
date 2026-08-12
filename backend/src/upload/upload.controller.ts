import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  existsSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { join } from "path";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Article } from "../articles/entities/article.entity";
import { safeResolveUploadPath, PUBLIC_DIR } from "../common/path-guard";
import {
  detectImageType,
  makeServerFilename,
  validateMarkdownContent,
  imageFileFilter,
  markdownFileFilter,
} from "./upload-utils";

function scanDir(
  subDir: string,
): { name: string; size: number; url: string }[] {
  const dir = join(PUBLIC_DIR, subDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .map((name) => {
      const stat = statSync(join(dir, name));
      return { name, size: stat.size, url: `/${subDir}/${name}` };
    })
    .sort((a, b) => b.size - a.size);
}

function writeUpload(subDir: string, filename: string, buffer: Buffer): void {
  const dir = join(PUBLIC_DIR, subDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), buffer);
}

function originalTitle(file: Express.Multer.File, dropExt: boolean): string {
  const originalName = Buffer.from(file.originalname, "latin1").toString(
    "utf8",
  );
  return dropExt ? originalName.replace(/\.[^.]+$/, "") : originalName;
}

@ApiTags("文件上传")
@Controller("api/upload")
export class UploadController {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
  ) {}

  @Get("images")
  @ApiOperation({ summary: "列出所有已上传的图片" })
  listImages() {
    const exts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"];
    return {
      code: 200,
      data: scanDir("uploads").filter((f) =>
        exts.some((e) => f.name.toLowerCase().endsWith(e)),
      ),
    };
  }

  @Get("markdowns")
  @ApiOperation({ summary: "列出所有已上传的 Markdown 文件" })
  listMarkdowns() {
    const all = scanDir("uploads");
    return { code: 200, data: all.filter((f) => f.name.endsWith(".md")) };
  }

  @UseGuards(JwtAuthGuard)
  @Post("image")
  @ApiBearerAuth()
  @ApiOperation({ summary: "上传图片（需登录）" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
          description: "图片文件（jpg/png/webp/gif/bmp，拒绝 SVG）",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("请选择图片文件");

    const ext = detectImageType(file.buffer);
    if (!ext) {
      throw new BadRequestException("文件内容与图片格式不符");
    }

    const filename = makeServerFilename(ext);
    writeUpload("uploads", filename, file.buffer);
    return { code: 200, url: `/uploads/${filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Post("markdown")
  @ApiBearerAuth()
  @ApiOperation({ summary: "上传 Markdown 文件，自动创建文章（需登录）" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Markdown 文件（.md）",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: markdownFileFilter,
    }),
  )
  async uploadMarkdown(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("请选择 .md 文件");

    if (!validateMarkdownContent(file.buffer)) {
      throw new BadRequestException(
        "Markdown 文件内容不合法（应为 UTF-8 文本）",
      );
    }

    const originalName = originalTitle(file, false);
    const filename = makeServerFilename("md");
    const content = file.buffer.toString("utf-8");
    const title = originalName.replace(/\.md$/i, "");

    writeUpload("uploads", filename, file.buffer);
    try {
      const article = this.articleRepo.create({
        title,
        content,
        publishedAt: new Date(),
      });
      const saved = await this.articleRepo.save(article);
      return { code: 200, article: saved, message: `文章「${title}」已创建` };
    } catch (err) {
      try {
        unlinkSync(join(PUBLIC_DIR, "uploads", filename));
      } catch {
        /* 忽略回滚失败 */
      }
      throw err;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete("image/:filename")
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除图片（需登录）" })
  deleteImage(@Param("filename") filename: string) {
    const filePath = safeResolveUploadPath("uploads", filename, [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".bmp",
    ]);
    unlinkSync(filePath);
    return { code: 200, message: "已删除" };
  }

  @UseGuards(JwtAuthGuard)
  @Delete("markdown/:filename")
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除 Markdown 文件（需登录）" })
  deleteMarkdown(@Param("filename") filename: string) {
    const filePath = safeResolveUploadPath("uploads", filename, [".md"]);
    unlinkSync(filePath);
    return { code: 200, message: "已删除" };
  }
}
