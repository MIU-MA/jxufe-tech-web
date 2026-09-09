import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiBudgetService, todayKey } from "./ai-budget.service";
import { AiUsage } from "./entities/ai-usage.entity";

describe("AiBudgetService", () => {
  let service: AiBudgetService;
  let row: AiUsage;
  let executeResults: { affected?: number }[];

  const queryBuilder = {
    insert: jest.fn(),
    into: jest.fn(),
    values: jest.fn(),
    orIgnore: jest.fn(),
    update: jest.fn(),
    set: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    execute: jest.fn(),
  };

  const mockRepo = {
    findOne: jest.fn(),
    findOneByOrFail: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    for (const method of [
      "insert",
      "into",
      "values",
      "orIgnore",
      "update",
      "set",
      "where",
      "andWhere",
    ] as const) {
      queryBuilder[method].mockReturnValue(queryBuilder);
    }
    executeResults = [];
    queryBuilder.execute.mockImplementation(() =>
      Promise.resolve(executeResults.shift() ?? { affected: 1 }),
    );
    process.env.AI_DAILY_REQUEST_LIMIT = "200";
    process.env.AI_DAILY_TOKEN_BUDGET = "200000";

    row = {
      date: todayKey(),
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
    };
    mockRepo.findOne.mockResolvedValue(row);
    mockRepo.findOneByOrFail.mockResolvedValue(row);
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

  describe("reserveRequest", () => {
    it("原子占用成功返回 true", async () => {
      executeResults.push({}, { affected: 1 });
      await expect(service.reserveRequest()).resolves.toBe(true);
      expect(queryBuilder.set).toHaveBeenCalledWith({
        requests: expect.any(Function),
      });
    });

    it("达到请求上限返回 false", async () => {
      row.requests = 200;
      executeResults.push({}, { affected: 0 });
      await expect(service.reserveRequest()).resolves.toBe(false);
    });
  });

  describe("recordUsage", () => {
    it("通过原子更新累加 tokens，不重复增加请求数", async () => {
      await service.recordUsage({ promptTokens: 100, completionTokens: 50 });
      const setArg = queryBuilder.set.mock.calls[0][0] as Record<
        string,
        () => string
      >;
      expect(setArg).not.toHaveProperty("requests");
      expect(setArg.promptTokens()).toContain("100");
      expect(setArg.completionTokens()).toContain("50");
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

describe("AiBudgetService SQLite integration", () => {
  let module: TestingModule;
  let service: AiBudgetService;

  beforeEach(async () => {
    process.env.AI_DAILY_REQUEST_LIMIT = "3";
    process.env.AI_DAILY_TOKEN_BUDGET = "200000";
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "better-sqlite3",
          database: ":memory:",
          dropSchema: true,
          synchronize: true,
          entities: [AiUsage],
        }),
        TypeOrmModule.forFeature([AiUsage]),
      ],
      providers: [AiBudgetService],
    }).compile();
    service = module.get(AiBudgetService);
  });

  afterEach(async () => {
    await module.close();
    delete process.env.AI_DAILY_REQUEST_LIMIT;
    delete process.env.AI_DAILY_TOKEN_BUDGET;
  });

  it("并发请求不会越过请求上限", async () => {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => service.reserveRequest()),
    );
    expect(results.filter(Boolean)).toHaveLength(3);
    await expect(service.status()).resolves.toMatchObject({ requests: 3 });
  });

  it("并发 usage 更新不会丢失计数", async () => {
    await service.reserveRequest();
    await Promise.all(
      Array.from({ length: 10 }, () =>
        service.recordUsage({ promptTokens: 10, completionTokens: 5 }),
      ),
    );
    await expect(service.status()).resolves.toMatchObject({
      tokensUsed: 150,
    });
  });
});
