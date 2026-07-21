import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('认证')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 注：注册接口已移除。公开注册对一个"仅管理员发文章"的站点是安全风险
  // （任何人都能创建账号）。管理员账号由 SeedService 在启动时创建。
  // 如需新增管理员，请通过服务端 seed 脚本或受保护的管理接口。

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回 token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }
}
