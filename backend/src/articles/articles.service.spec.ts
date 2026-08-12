import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { Article } from "./entities/article.entity";
import { RebuildService } from "../rebuild/rebuild.service";

describe("ArticlesService", () => {
  let service: ArticlesService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
  const mockRebuild = { trigger: jest.fn().mockResolvedValue(false) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: mockRepo },
        { provide: RebuildService, useValue: mockRebuild },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("按创建时间倒序返回列表", async () => {
      mockRepo.find.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll();
      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe("create", () => {
    it("默认 publishedAt 为当前时间", async () => {
      mockRepo.create.mockImplementation((d) => d);
      mockRepo.save.mockImplementation((a) => a);
      await service.create({ title: "标题", content: "正文" });
      const created = mockRepo.save.mock.calls[0][0];
      expect(created.title).toBe("标题");
      expect(created.publishedAt).toBeInstanceOf(Date);
      expect(created.summary).toBeNull();
    });
  });

  describe("update", () => {
    it("文章不存在抛 NotFoundException", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, { title: "x" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("更新字段并保存", async () => {
      const article = {
        id: 1,
        title: "旧",
        content: "c",
        summary: "s",
        publishedAt: null,
      };
      mockRepo.findOne.mockResolvedValue(article);
      mockRepo.save.mockImplementation((a) => a);
      const result = await service.update(1, { title: "新", summary: null });
      expect(article.title).toBe("新");
      expect(article.summary).toBeNull();
      expect(result).toBe(article);
    });
  });

  describe("remove", () => {
    it("文章不存在抛 NotFoundException", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it("存在则删除", async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1 });
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
