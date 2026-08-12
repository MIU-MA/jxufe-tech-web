import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from "@nestjs/common";
import type { Request } from "express";

interface RateEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  limit: number;
  ttlMs: number;
  keyBy?: (req: Request) => string;
}

export const RATE_LIMIT_META = "rate_limit_config";

export function RateLimit(config: RateLimitConfig) {
  return applyDecorators(
    SetMetadata(RATE_LIMIT_META, config),
    UseGuards(RateLimitGuard),
  );
}

@Injectable()
export class RateLimiterService {
  private readonly hits = new Map<string, RateEntry>();
  private readonly MAX_ENTRIES = 10_000;

  check(key: string, limit: number, ttlMs: number): boolean {
    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || now > entry.resetAt) {
      if (this.hits.size >= this.MAX_ENTRIES) {
        for (const [k, e] of this.hits) {
          if (now > e.resetAt) this.hits.delete(k);
        }
        if (this.hits.size >= this.MAX_ENTRIES) {
          let oldestKey: string | undefined;
          let oldestReset = Infinity;
          for (const [k, e] of this.hits) {
            if (e.resetAt < oldestReset) {
              oldestReset = e.resetAt;
              oldestKey = k;
            }
          }
          if (oldestKey) this.hits.delete(oldestKey);
        }
      }
      this.hits.set(key, { count: 1, resetAt: now + ttlMs });
      return true;
    }

    entry.count++;
    return entry.count <= limit;
  }
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly limiter: RateLimiterService) {}

  canActivate(context: ExecutionContext): boolean {
    const config = Reflect.getMetadata(
      RATE_LIMIT_META,
      context.getHandler(),
    ) as RateLimitConfig | undefined;
    if (!config) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const key = config.keyBy ? config.keyBy(request) : request.ip || "unknown";

    if (!this.limiter.check(key, config.limit, config.ttlMs)) {
      throw new HttpException(
        "请求过于频繁，请稍后再试",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
