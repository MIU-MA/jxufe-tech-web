import { Injectable } from "@nestjs/common";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// 服务端 HMAC 签名 + 随机 nonce，客户端无法伪造；TTL 24h 保持会话历史连续
@Injectable()
export class TokenService {
  private readonly revokedTokens = new Map<string, number>();
  private readonly SECRET =
    process.env.CHAT_TOKEN_SECRET || process.env.JWT_SECRET!;
  private readonly TTL_MS = 24 * 60 * 60 * 1000;
  private readonly MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
  private readonly MAX_REVOKED_TOKENS = 10_000;

  generate(ip: string): string {
    const timestamp = Date.now();
    const nonce = randomBytes(8).toString("hex");
    const hmac = createHmac("sha256", this.SECRET)
      .update(`${ip}:${timestamp}:${nonce}`)
      .digest("hex")
      .slice(0, 24);
    return `${timestamp}:${nonce}:${hmac}`;
  }

  validate(ip: string, token: string): boolean {
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;

    const age = Date.now() - timestamp;
    if (age > this.TTL_MS || age < -this.MAX_CLOCK_SKEW_MS) return false;
    this.cleanupRevoked();
    if (this.revokedTokens.has(token)) return false;

    const expectedHmac = createHmac("sha256", this.SECRET)
      .update(`${ip}:${timestamp}:${parts[1]}`)
      .digest("hex")
      .slice(0, 24);

    const actual = Buffer.from(parts[2]);
    const expected = Buffer.from(expectedHmac);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  invalidate(token: string): boolean {
    if (!this.validateFormat(token)) return false;
    this.cleanupRevoked();
    if (this.revokedTokens.size >= this.MAX_REVOKED_TOKENS) {
      const oldest = this.revokedTokens.keys().next().value as
        | string
        | undefined;
      if (oldest) this.revokedTokens.delete(oldest);
    }
    const timestamp = Number(token.split(":", 1)[0]);
    this.revokedTokens.set(token, timestamp + this.TTL_MS);
    return true;
  }

  private validateFormat(token: string): boolean {
    const parts = token.split(":");
    return parts.length === 3 && Number.isFinite(Number(parts[0]));
  }

  private cleanupRevoked(): void {
    const now = Date.now();
    for (const [token, expiresAt] of this.revokedTokens) {
      if (now > expiresAt) this.revokedTokens.delete(token);
    }
  }
}
