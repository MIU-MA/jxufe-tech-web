import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User } from "./entities/user.entity";
import { BCRYPT_ROUNDS } from "./auth.constants";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) {
      throw new ConflictException("用户名已存在");
    }

    // 入库前 bcrypt 加盐哈希，永不存明文
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = this.userRepo.create({ username, password: hashedPassword });
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    // 比对哈希值，不触碰明文；bcrypt 自适应 rounds（兼容旧的 10-rounds 哈希）
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
