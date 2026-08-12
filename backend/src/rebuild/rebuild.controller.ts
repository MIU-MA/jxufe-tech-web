import {
  Controller,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RebuildService } from "./rebuild.service";

@ApiTags("运维")
@Controller("api/rebuild")
@UseGuards(JwtAuthGuard)
export class RebuildController {
  constructor(private readonly rebuildService: RebuildService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "触发前端 SSG 重新构建（需登录）" })
  @ApiResponse({ status: 200, description: "已触发重建" })
  @ApiResponse({ status: 501, description: "未配置重建令牌" })
  async rebuild() {
    const triggered = await this.rebuildService.trigger("manual");
    if (!triggered) {
      throw new HttpException(
        "未配置 GITHUB_REBUILD_TOKEN，无法自动重建，请手动触发 rebuild workflow",
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    return { ok: true, message: "已触发重建，几分钟后前端将更新" };
  }
}
