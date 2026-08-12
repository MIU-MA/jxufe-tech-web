import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let service: AuthService;
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockJwt = { sign: jest.fn(() => "signed-token") };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("登录成功返回 access_token", async () => {
      mockRepo.findOne.mockResolvedValue({
        id: 1,
        username: "admin",
        password: await bcrypt.hash("correct", 4),
      });
      const result = await service.login("admin", "correct");
      expect(result).toEqual({ access_token: "signed-token" });
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: 1, username: "admin" });
    });

    it("用户不存在抛 UnauthorizedException", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.login("nobody", "x")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("密码错误抛 UnauthorizedException", async () => {
      mockRepo.findOne.mockResolvedValue({
        id: 1,
        username: "admin",
        password: await bcrypt.hash("correct", 4),
      });
      await expect(service.login("admin", "wrong")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("register", () => {
    it("用户名已存在抛 ConflictException", async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, username: "admin" });
      await expect(service.register("admin", "x")).rejects.toThrow(
        ConflictException,
      );
    });

    it("新用户注册成功且密码加密入库", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((d) => d);
      mockRepo.save.mockImplementation((u) => u);
      const result = await service.register("newbie", "secret123");
      expect(result).toEqual({ access_token: "signed-token" });
      const saved = mockRepo.save.mock.calls[0][0];
      expect(saved.password).not.toBe("secret123");
      expect(await bcrypt.compare("secret123", saved.password)).toBe(true);
    });
  });
});
