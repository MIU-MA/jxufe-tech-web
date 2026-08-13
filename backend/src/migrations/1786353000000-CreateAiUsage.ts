import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiUsage1786353000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_usage" (
        "date" text(10) NOT NULL,
        "requests" integer NOT NULL DEFAULT 0,
        "promptTokens" integer NOT NULL DEFAULT 0,
        "completionTokens" integer NOT NULL DEFAULT 0,
        PRIMARY KEY ("date")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    await Promise.resolve();
  }
}
