import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import type { Request } from "express";
import { ALLOWED_ORIGIN_SET } from "./origins";

@Injectable()
export class OriginGuard implements CanActivate {
  private readonly logger = new Logger(OriginGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers["origin"];
    const referer = request.headers["referer"];

    const raw = origin || referer;
    if (!raw) return true;

    const source = normalizeOrigin(String(raw));
    if (ALLOWED_ORIGIN_SET.has(source)) return true;

    this.logger.warn(
      `拦截跨域请求: origin=${origin} referer=${referer} ip=${request.ip}`,
    );
    return false;
  }
}

function normalizeOrigin(source: string): string {
  try {
    return new URL(source).origin;
  } catch {
    return source;
  }
}
