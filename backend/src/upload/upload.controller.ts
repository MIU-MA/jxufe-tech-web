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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, readdirSync, statSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Music } from '../music/entities/music.entity';

/** 生成唯一文件名 */
function uniqueFileName(file: Express.Multer.File): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}${extname(file.originalname)}`;
}

/** 扫描目录返回文件列表 */
function scanDir(subDir: string): { name: string; size: number; url: string }[] {
  const dir = join('./public', subDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => !f.startsWith('.'))
    .map((name) => {
      const stat = statSync(join(dir, name));
      return { name, size: stat.size, url: `/${subDir}/${name}` };
    })
    .sort((a, b) => b.size - a.size);
}

@ApiTags('文件上传')
@Controller('api/upload')
export class UploadController {
  constructor(
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
    @InjectRepository(Music)
    private musicRepo: Repository<Music>,
  ) {}

  // ══════════════════════════════════════
  // 文件浏览（无需登录）
  // ══════════════════════════════════════

  @Get('images')
  @ApiOperation({ summary: '列出所有已上传的图片' })
  listImages() {
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    return { code: 200, data: scanDir('uploads').filter(f => exts.some(e => f.name.toLowerCase().endsWith(e))) };
  }

  @Get('musics')
  @ApiOperation({ summary: '列出所有已上传的音乐文件' })
  listMusic() {
    return { code: 200, data: scanDir('music') };
  }

  @Get('markdowns')
  @ApiOperation({ summary: '列出所有已上传的 Markdown 文件' })
  listMarkdowns() {
    const all = scanDir('uploads');
    return { code: 200, data: all.filter((f) => f.name.endsWith('.md')) };
  }

  // ══════════════════════════════════════
  // 上传
  // ══════════════════════════════════════

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传图片（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: '图片文件（jpg/png/webp/gif）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => cb(null, uniqueFileName(file)),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return { code: 200, url: `/uploads/${file.filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('music')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传音乐文件（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        music: { type: 'string', format: 'binary', description: '音乐文件（mp3/wav/ogg/flac）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('music', {
      storage: diskStorage({
        destination: './public/music',
        filename: (req, file, cb) => cb(null, uniqueFileName(file)),
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadMusic(@UploadedFile() file: Express.Multer.File) {
    // Windows 上 multer 的 originalname 可能是 latin1 编码，需转为 utf8
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const title = originalName.replace(/\.[^.]+$/, '');
    const music = this.musicRepo.create({
      title,
      artist: '未知',
      audioUrl: `/music/${file.filename}`,
    });
    await this.musicRepo.save(music);
    return { code: 200, url: `/music/${file.filename}`, title };
  }

  @UseGuards(JwtAuthGuard)
  @Post('markdown')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传 Markdown 文件，自动创建文章（需登录）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Markdown 文件（.md）' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => cb(null, uniqueFileName(file)),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadMarkdown(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择 .md 文件');
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = extname(originalName).toLowerCase();
    if (ext !== '.md') throw new BadRequestException('只支持 .md 文件');

    const filePath = join('./public/uploads', file.filename);
    const content = readFileSync(filePath, 'utf-8');
    const title = originalName.replace(/\.md$/i, '');
    const article = this.articleRepo.create({ title, content, publishedAt: new Date() });
    const saved = await this.articleRepo.save(article);
    return { code: 200, article: saved, message: `文章「${title}」已创建` };
  }

  // ══════════════════════════════════════
  // 删除
  // ══════════════════════════════════════

  @UseGuards(JwtAuthGuard)
  @Delete('image/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除图片（需登录）' })
  deleteImage(@Param('filename') filename: string) {
    const filePath = join('./public/uploads', filename);
    if (!existsSync(filePath)) throw new NotFoundException('文件不存在');
    unlinkSync(filePath);
    return { code: 200, message: '已删除' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('music/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除音乐文件（需登录）' })
  deleteMusic(@Param('filename') filename: string) {
    const filePath = join('./public/music', filename);
    if (!existsSync(filePath)) throw new NotFoundException('文件不存在');
    unlinkSync(filePath);
    return { code: 200, message: '已删除' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('markdown/:filename')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除 Markdown 文件（需登录）' })
  deleteMarkdown(@Param('filename') filename: string) {
    const filePath = join('./public/uploads', filename);
    if (!existsSync(filePath)) throw new NotFoundException('文件不存在');
    unlinkSync(filePath);
    return { code: 200, message: '已删除' };
  }
}
