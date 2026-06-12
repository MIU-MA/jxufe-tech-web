import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Music } from './entities/music.entity';

@ApiTags('音乐管理')
@Controller('api/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  @ApiOperation({ summary: '获取所有音乐' })
  @ApiResponse({ status: 200, description: '音乐列表', type: [Music] })
  getAll() {
    return this.musicService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单首音乐' })
  @ApiResponse({ status: 200, description: '音乐详情', type: Music })
  getOne(@Param('id') id: string) {
    return this.musicService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加音乐（需登录）' })
  @ApiResponse({ status: 201, description: '添加成功', type: Music })
  create(
    @Body()
    body: { title: string; artist: string; coverUrl?: string; audioUrl: string },
  ) {
    return this.musicService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改音乐信息（需登录）' })
  @ApiResponse({ status: 200, description: '修改成功', type: Music })
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; artist?: string; coverUrl?: string },
  ) {
    return this.musicService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除音乐（需登录）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.musicService.remove(+id);
  }

  /** 扫描 public/music 目录，补建缺失的数据库记录 */
  @UseGuards(JwtAuthGuard)
  @Post('sync')
  @ApiBearerAuth()
  @ApiOperation({ summary: '同步本地音乐文件到数据库（需登录）' })
  sync() {
    return this.musicService.syncFromDisk();
  }
}
