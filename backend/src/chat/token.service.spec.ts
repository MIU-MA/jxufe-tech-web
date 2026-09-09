import { createHmac } from "crypto";
import { TokenService } from "./token.service";

describe("TokenService", () => {
  const ip = "203.0.113.10";
  const secret = "test-secret-at-least-32-characters-long";

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    delete process.env.CHAT_TOKEN_SECRET;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("签发的令牌可由新服务实例验证", () => {
    const token = new TokenService().generate(ip);
    expect(new TokenService().validate(ip, token)).toBe(true);
  });

  it("拒绝 IP 不匹配或被篡改的令牌", () => {
    const service = new TokenService();
    const token = service.generate(ip);
    expect(service.validate("203.0.113.11", token)).toBe(false);
    expect(service.validate(ip, token.slice(0, -1) + "0")).toBe(false);
  });

  it("拒绝过期和未来时间过远的令牌", () => {
    const service = new TokenService();
    const makeToken = (timestamp: number) => {
      const nonce = "0123456789abcdef";
      const hmac = createHmac("sha256", secret)
        .update(`${ip}:${timestamp}:${nonce}`)
        .digest("hex")
        .slice(0, 24);
      return `${timestamp}:${nonce}:${hmac}`;
    };

    expect(
      service.validate(ip, makeToken(Date.now() - 25 * 60 * 60 * 1000)),
    ).toBe(false);
    expect(service.validate(ip, makeToken(Date.now() + 6 * 60 * 1000))).toBe(
      false,
    );
  });

  it("失效后的令牌不能再次使用", () => {
    const service = new TokenService();
    const token = service.generate(ip);
    expect(service.invalidate(token)).toBe(true);
    expect(service.validate(ip, token)).toBe(false);
  });
});
