import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { Music } from './entities/music.entity';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private repo: Repository<Music>,
  ) {}

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: { title: string; artist: string; coverUrl?: string; audioUrl: string }) {
    const music = this.repo.create(data);
    return this.repo.save(music);
  }

  async update(id: number, dto: { title?: string; artist?: string; coverUrl?: string }) {
    const music = await this.repo.findOne({ where: { id } });
    if (!music) throw new NotFoundException('音乐不存在');
    if (dto.title !== undefined) music.title = dto.title;
    if (dto.artist !== undefined) music.artist = dto.artist;
    if (dto.coverUrl !== undefined) music.coverUrl = dto.coverUrl;
    return this.repo.save(music);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  /**
   * 扫描 public/music 目录，将未入库的文件自动补建数据库记录。
   * 返回本次新增的数量。
   */
  async syncFromDisk(): Promise<{ created: number; total: number }> {
    const dir = join('./public', 'music');
    if (!existsSync(dir)) return { created: 0, total: 0 };

    // 获取磁盘上所有音频文件
    const files = readdirSync(dir).filter(
      (f) => !f.startsWith('.') && /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f),
    );
    if (files.length === 0) return { created: 0, total: 0 };

    // 查询已有记录的 url，避免重复
    const existing = await this.repo.find({ select: { audioUrl: true } });
    const existingUrls = new Set(existing.map((e) => e.audioUrl));

    let created = 0;
    for (const filename of files) {
      const url = `/music/${filename}`;
      if (existingUrls.has(url)) continue;

      const title = filename.replace(/\.[^.]+$/, ''); // 去扩展名当歌名
      const music = this.repo.create({
        title,
        artist: '本地文件',
        audioUrl: url,
      });
      await this.repo.save(music);
      created++;
    }

    return { created, total: files.length };
  }
}
