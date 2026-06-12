import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('music')
export class Music {
  @ApiProperty({ description: '歌曲ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '歌名', example: '晴天' })
  @Column()
  title: string;

  @ApiProperty({ description: '歌手', example: '周杰伦' })
  @Column()
  artist: string;

  @ApiPropertyOptional({ description: '封面图URL', example: '/uploads/cover-123.jpg' })
  @Column({ nullable: true })
  coverUrl: string;

  @ApiProperty({ description: '音频文件URL', example: '/uploads/audio-456.mp3' })
  @Column()
  audioUrl: string;

  @ApiProperty({ description: '上传时间' })
  @CreateDateColumn()
  createdAt: Date;
}
