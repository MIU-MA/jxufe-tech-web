import { basename, extname, join, resolve, sep } from "path";
import { existsSync, statSync } from "fs";
import { NotFoundException, BadRequestException } from "@nestjs/common";

// backend/public 的绝对路径，基于 __dirname 与启动目录无关
export const PUBLIC_DIR = join(__dirname, "..", "..", "public");

/**
 * 安全地解析上传目录下的文件路径，防止路径穿越攻击。
 *
 * - 只取传入名称的 basename（剥掉所有目录部分），杜绝 `../`
 * - 校验解析后的绝对路径仍在上传目录内（双重保险）
 * - 可选：校验扩展名白名单
 * - 文件不存在时抛 NotFoundException
 *
 * @param subDir 上传子目录，如 'uploads'
 * @param filename 用户传入的文件名（来自 URL 参数，不可信）
 * @param allowedExts 允许的扩展名白名单（小写，含点），如 ['.jpg', '.png']
 */
export function safeResolveUploadPath(
  subDir: string,
  filename: string,
  allowedExts?: string[],
): string {
  const baseDir = join(PUBLIC_DIR, subDir);

  // 1. 剥掉目录部分，只保留文件名 -- 这一步直接挡住 `../` 穿越
  const safeName = basename(filename);

  if (!safeName || safeName === "." || safeName === "..") {
    throw new BadRequestException("非法文件名");
  }

  // 2. 扩展名白名单校验
  if (allowedExts) {
    const ext = extname(safeName).toLowerCase();
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`不支持的文件类型: ${ext || "无扩展名"}`);
    }
  }

  const filePath = join(baseDir, safeName);

  // 3. 双重保险：解析后必须是 baseDir 的直接子文件，不能逃逸
  const resolvedBase = resolve(baseDir);
  const resolvedFile = resolve(filePath);
  if (!resolvedFile.startsWith(resolvedBase + sep)) {
    throw new BadRequestException("非法路径");
  }

  // 4. 确认是文件而非目录
  if (!existsSync(filePath)) {
    throw new NotFoundException("文件不存在");
  }
  if (!statSync(filePath).isFile()) {
    throw new BadRequestException("非法目标");
  }

  return filePath;
}
