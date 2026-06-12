import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '用户名', example: 'admin' })
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ApiProperty({ description: '注册时间' })
  @CreateDateColumn()
  createdAt: Date;
}
