import { BadRequestException } from "@nestjs/common";
import { extname } from "path";

const IMAGE_EXT_MAGIC: Record<string, string[]> = {
  jpg: ["\xff\xd8\xff"],
  jpeg: ["\xff\xd8\xff"],
  png: ["\x89PNG\r\n\x1a\n"],
  gif: ["GIF87a", "GIF89a"],
  webp: ["RIFF", "WEBP"],
  bmp: ["BM"],
};

function looksBinary(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  if (sample.includes(0)) return true;
  let control = 0;
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i];
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) control++;
  }
  return control / sample.length > 0.3;
}

export function detectImageType(buffer: Buffer): string | null {
  for (const [ext, magics] of Object.entries(IMAGE_EXT_MAGIC)) {
    for (const magic of magics) {
      if (magic === "RIFF" || magic === "WEBP") {
        if (
          buffer.length > 12 &&
          buffer.toString("latin1", 0, 4) === "RIFF" &&
          buffer.toString("latin1", 8, 12) === "WEBP"
        ) {
          return "webp";
        }
        continue;
      }
      if (
        buffer.subarray(0, magic.length).equals(Buffer.from(magic, "latin1"))
      ) {
        return ext;
      }
    }
  }
  return null;
}

export function validateMarkdownContent(buffer: Buffer): boolean {
  if (looksBinary(buffer)) return false;
  const text = buffer.toString("utf-8");
  return text.length > 0;
}

export function makeServerFilename(ext: string): string {
  const unique =
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  return `${unique}.${ext}`;
}

export function imageFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const ext = extname(file.originalname).toLowerCase().replace(/^\./, "");
  if (!IMAGE_EXT_MAGIC[ext]) {
    return cb(
      new BadRequestException(`不支持的图片类型: ${ext || "无扩展名"}`),
      false,
    );
  }
  if (!file.mimetype.startsWith("image/") || file.mimetype.includes("svg")) {
    return cb(
      new BadRequestException(`非法的图片 MIME: ${file.mimetype}`),
      false,
    );
  }
  cb(null, true);
}

export function markdownFileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const ext = extname(file.originalname).toLowerCase();
  if (ext !== ".md") {
    return cb(new BadRequestException("只支持 .md 文件"), false);
  }
  if (
    file.mimetype &&
    !["text/markdown", "text/plain", "application/octet-stream"].includes(
      file.mimetype,
    )
  ) {
    return cb(
      new BadRequestException(`非法的 Markdown MIME: ${file.mimetype}`),
      false,
    );
  }
  cb(null, true);
}
