import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RateLimiterService, RateLimitGuard } from "../common/rate-limit.guard";
import { OriginGuard } from "../common/origin.guard";

describe("AuthController", () => {
  let controller: AuthController;
  const mockAuthService = { login: jest.fn(), register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        // 路由装饰器 @RateLimit / @UseGuards(OriginGuard) 需要这些守卫的依赖
        { provide: RateLimiterService, useValue: { check: () => true } },
        { provide: RateLimitGuard, useValue: { canActivate: () => true } },
        { provide: OriginGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("login 转发到 AuthService", () => {
    mockAuthService.login.mockReturnValue({ access_token: "t" });
    const result = controller.login({ username: "admin", password: "pw" });
    expect(mockAuthService.login).toHaveBeenCalledWith("admin", "pw");
    expect(result).toEqual({ access_token: "t" });
  });
});
