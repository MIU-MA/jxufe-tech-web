import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RateLimit } from "../common/rate-limit.guard";
import { OriginGuard } from "../common/origin.guard";

@ApiTags("认证")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(OriginGuard)
  @RateLimit({
    limit: 5,
    ttlMs: 10 * 60 * 1000, // 每个 IP + 用户名 10 分钟内最多 5 次
    keyBy: (req) => {
      const username =
        (req.body as { username?: string } | undefined)?.username ?? "";
      return `${req.ip}:${username}`;
    },
  })
  @ApiOperation({ summary: "用户登录" })
  @ApiResponse({ status: 200, description: "登录成功，返回 token" })
  @ApiResponse({ status: 401, description: "用户名或密码错误" })
  @ApiResponse({ status: 429, description: "尝试过于频繁" })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }
}
