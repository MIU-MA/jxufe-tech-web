import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

interface RateEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class AntiAbuseGuard implements CanActivate {
  private readonly logger = new Logger(AntiAbuseGuard.name);
  private readonly hits = new Map<string, RateEntry>();

  private readonly ALLOWED_ORIGINS = [
    'https://www.jxufe-tech.top',
    'https://jxufe-tech.top',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  private readonly MAX_REQUESTS = 30;
  private readonly WINDOW_MS = 60_000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';

    const origin = (request.headers['origin'] as string) || '';
    const referer = (request.headers['referer'] as string) || '';

    if (origin || referer) {
      const source = origin || referer;
      const allowed = this.ALLOWED_ORIGINS.some((o) => source.startsWith(o));
      if (!allowed) {
        this.logger.warn(`拦截跨域请求: ip=${ip} origin=${origin} referer=${referer}`);
        return false;
      }
    }

    const now = Date.now();
    const entry = this.hits.get(ip);

    if (!entry || now > entry.resetAt) {
      this.hits.set(ip, { count: 1, resetAt: now + this.WINDOW_MS });
      return true;
    }

    entry.count++;
    if (entry.count > this.MAX_REQUESTS) {
      this.logger.warn(`速率限制: ip=${ip} count=${entry.count}`);
      return false;
    }

    return true;
  }
}
