import { Injectable, Logger } from "@nestjs/common";
import { createHmac, randomBytes } from "crypto";

// 服务端 HMAC 签名 + 随机 nonce，客户端无法伪造；TTL 24h 保持会话历史连续
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly tokens = new Map<string, number>();

  private readonly SECRET =
    process.env.CHAT_TOKEN_SECRET || randomBytes(32).toString("hex");
  private readonly TTL_MS = 24 * 60 * 60 * 1000;

  generate(ip: string): string {
    const timestamp = Date.now();
    const nonce = randomBytes(8).toString("hex");
    const hmac = createHmac("sha256", this.SECRET)
      .update(`${ip}:${timestamp}:${nonce}`)
      .digest("hex")
      .slice(0, 24);
    const token = `${timestamp}:${nonce}:${hmac}`;

    this.tokens.set(token, timestamp);
    this.cleanup();
    return token;
  }

  validate(ip: string, token: string): boolean {
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;

    if (Date.now() - timestamp > this.TTL_MS) return false;

    // 必须是服务端签发的令牌
    if (!this.tokens.has(token)) return false;

    const expectedHmac = createHmac("sha256", this.SECRET)
      .update(`${ip}:${timestamp}:${parts[1]}`)
      .digest("hex")
      .slice(0, 24);

    return parts[2] === expectedHmac;
  }

  invalidate(token: string): boolean {
    return this.tokens.delete(token);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, ts] of this.tokens) {
      if (now - ts > this.TTL_MS) this.tokens.delete(token);
    }
  }
}
