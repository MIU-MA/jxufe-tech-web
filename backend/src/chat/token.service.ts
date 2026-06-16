import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';

interface TokenRecord {
  token: string;
  createdAt: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly tokens = new Map<string, number>();

  private readonly SECRET = process.env.CHAT_TOKEN_SECRET || randomBytes(32).toString('hex');
  private readonly TTL_MS = 5 * 60 * 1000;

  generate(ip: string): string {
    const timestamp = Date.now();
    const hmac = createHmac('sha256', this.SECRET)
      .update(`${ip}:${timestamp}`)
      .digest('hex')
      .slice(0, 24);
    const token = `${timestamp}:${hmac}`;

    this.tokens.set(token, timestamp);
    this.cleanup();
    return token;
  }

  validate(ip: string, token: string): boolean {
    const parts = token.split(':');
    if (parts.length !== 2) return false;

    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;

    if (Date.now() - timestamp > this.TTL_MS) return false;

    const expectedHmac = createHmac('sha256', this.SECRET)
      .update(`${ip}:${timestamp}`)
      .digest('hex')
      .slice(0, 24);

    return parts[1] === expectedHmac;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, ts] of this.tokens) {
      if (now - ts > this.TTL_MS) this.tokens.delete(token);
    }
  }
}
