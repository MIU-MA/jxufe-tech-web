import { Test, TestingModule } from "@nestjs/testing";
import { UploadController } from "./upload.controller";
import { ArticlesService } from "../articles/articles.service";
import { detectImageType, validateMarkdownContent } from "./upload-utils";

describe("UploadController", () => {
  let controller: UploadController;
  const mockArticlesService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: ArticlesService, useValue: mockArticlesService }],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("magic bytes 检测", () => {
    it("识别真实 PNG", () => {
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(detectImageType(png)).toBe("png");
    });

    it("拒绝 HTML 伪造的图片", () => {
      const html = Buffer.from(
        "<html><script>alert(1)</script></html>",
        "utf-8",
      );
      expect(detectImageType(html)).toBeNull();
    });

    it("Markdown 文本合法、二进制内容被拒", () => {
      expect(
        validateMarkdownContent(Buffer.from("# 标题\n正文", "utf-8")),
      ).toBe(true);
      expect(
        validateMarkdownContent(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]),
        ),
      ).toBe(false);
    });
  });
});
