import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AiBudgetService, todayKey } from "./ai-budget.service";
import { AiUsage } from "./entities/ai-usage.entity";

describe("AiBudgetService", () => {
  let service: AiBudgetService;
  let row: AiUsage;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.AI_DAILY_REQUEST_LIMIT = "200";
    process.env.AI_DAILY_TOKEN_BUDGET = "200000";

    row = {
      date: todayKey(),
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
    };
    mockRepo.findOne.mockResolvedValue(row);
    mockRepo.create.mockImplementation((d) => d);
    mockRepo.save.mockImplementation((r) => r);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiBudgetService,
        { provide: getRepositoryToken(AiUsage), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AiBudgetService>(AiBudgetService);
  });

  afterEach(() => {
    delete process.env.AI_DAILY_REQUEST_LIMIT;
    delete process.env.AI_DAILY_TOKEN_BUDGET;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("check（每日额度，无内存锁）", () => {
    it("未超限返回 true", async () => {
      row.requests = 0;
      await expect(service.check()).resolves.toBe(true);
    });

    it("达到请求上限返回 false", async () => {
      row.requests = 200;
      await expect(service.check()).resolves.toBe(false);
    });

    it("token 预算超限返回 false", async () => {
      row.promptTokens = 150000;
      row.completionTokens = 60000;
      await expect(service.check()).resolves.toBe(false);
    });

    it("达到上限后，当天记录回落到上限内无需重启即恢复（无 enabled 内存锁）", async () => {
      row.requests = 200;
      await expect(service.check()).resolves.toBe(false);

      // 模拟次日/重置后的 DB 记录：同一进程内直接恢复
      row.requests = 10;
      await expect(service.check()).resolves.toBe(true);
    });
  });

  describe("record", () => {
    it("累加当天请求数与 tokens", async () => {
      await service.record({ promptTokens: 100, completionTokens: 50 });
      expect(row.requests).toBe(1);
      expect(row.promptTokens).toBe(100);
      expect(row.completionTokens).toBe(50);
      expect(mockRepo.save).toHaveBeenCalledWith(row);
    });
  });

  describe("status", () => {
    it("未超限时 enabled 为 true", async () => {
      row.requests = 5;
      const status = await service.status();
      expect(status.enabled).toBe(true);
      expect(status.requestLimit).toBe(200);
    });

    it("达到请求上限时 enabled 为 false", async () => {
      row.requests = 200;
      const status = await service.status();
      expect(status.enabled).toBe(false);
    });

    it("token 预算超限时 enabled 为 false", async () => {
      row.promptTokens = 200000;
      const status = await service.status();
      expect(status.enabled).toBe(false);
    });
  });
});
