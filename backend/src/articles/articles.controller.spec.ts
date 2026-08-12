import { Test, TestingModule } from "@nestjs/testing";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";

describe("ArticlesController", () => {
  let controller: ArticlesController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [{ provide: ArticlesService, useValue: mockService }],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("getAll 转发到 service.findAll", () => {
    mockService.findAll.mockReturnValue([]);
    expect(controller.getAll()).toEqual([]);
  });

  it("getOne 转发数字 id", () => {
    mockService.findOne.mockReturnValue({ id: 42 });
    expect(controller.getOne(42)).toEqual({ id: 42 });
    expect(mockService.findOne).toHaveBeenCalledWith(42);
  });
});
