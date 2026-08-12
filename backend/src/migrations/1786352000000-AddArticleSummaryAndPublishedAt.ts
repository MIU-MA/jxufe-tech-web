import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 为已存在的 articles 表补齐 summary / publishedAt 列。
 * 幂等：先查 PRAGMA table_info，已存在则跳过（老库可能已有其中一列）。
 */
export class AddArticleSummaryAndPublishedAt1786352000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(`PRAGMA table_info("articles")`)) as {
      name: string;
    }[];
    const existing = new Set(rows.map((r) => r.name));

    if (!existing.has("summary")) {
      await queryRunner.query(
        `ALTER TABLE "articles" ADD COLUMN "summary" TEXT`,
      );
    }
    if (!existing.has("publishedAt")) {
      await queryRunner.query(
        `ALTER TABLE "articles" ADD COLUMN "publishedAt" datetime`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    await Promise.resolve();
  }
}
