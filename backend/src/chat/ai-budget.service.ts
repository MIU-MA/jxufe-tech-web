import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiUsage } from "./entities/ai-usage.entity";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface BudgetStatus {
  enabled: boolean;
  requests: number;
  requestLimit: number;
  tokensUsed: number;
  tokenBudget: number;
}

const BUDGET_TIME_ZONE = "Asia/Shanghai";

export function todayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUDGET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

@Injectable()
export class AiBudgetService {
  private readonly logger = new Logger(AiBudgetService.name);

  private readonly requestLimit = Number(
    process.env.AI_DAILY_REQUEST_LIMIT ?? 200,
  );
  private readonly tokenBudget = Number(
    process.env.AI_DAILY_TOKEN_BUDGET ?? 200_000,
  );

  constructor(
    @InjectRepository(AiUsage)
    private usageRepo: Repository<AiUsage>,
  ) {}

  /**
   * 在调用上游 AI 前原子占用一次请求名额。
   * 条件更新让并发请求无法同时越过 requestLimit，也避免读改写丢失计数。
   */
  async reserveRequest(): Promise<boolean> {
    const key = todayKey();
    await this.usageRepo
      .createQueryBuilder()
      .insert()
      .into(AiUsage)
      .values({ date: key })
      .orIgnore()
      .execute();

    const result = await this.usageRepo
      .createQueryBuilder()
      .update(AiUsage)
      .set({ requests: () => '"requests" + 1' })
      .where('"date" = :key', { key })
      .andWhere('"requests" < :requestLimit', {
        requestLimit: this.requestLimit,
      })
      .andWhere('"promptTokens" + "completionTokens" < :tokenBudget', {
        tokenBudget: this.tokenBudget,
      })
      .execute();

    const ok = (result.affected ?? 0) === 1;
    if (!ok) {
      const row = await this.getOrCreateToday();
      this.logger.warn(
        `AI 每日预算已用完：请求 ${row.requests}/${this.requestLimit}，tokens ${row.promptTokens + row.completionTokens}/${this.tokenBudget}`,
      );
    }
    return ok;
  }

  async recordUsage(usage: TokenUsage): Promise<void> {
    const promptTokens = Math.max(0, Math.trunc(usage.promptTokens || 0));
    const completionTokens = Math.max(
      0,
      Math.trunc(usage.completionTokens || 0),
    );
    await this.usageRepo
      .createQueryBuilder()
      .update(AiUsage)
      .set({
        promptTokens: () => `"promptTokens" + ${promptTokens}`,
        completionTokens: () => `"completionTokens" + ${completionTokens}`,
      })
      .where('"date" = :key', { key: todayKey() })
      .execute();
  }

  async status(): Promise<BudgetStatus> {
    const row = await this.getOrCreateToday();
    return {
      enabled:
        row.requests < this.requestLimit &&
        row.promptTokens + row.completionTokens < this.tokenBudget,
      requests: row.requests,
      requestLimit: this.requestLimit,
      tokensUsed: row.promptTokens + row.completionTokens,
      tokenBudget: this.tokenBudget,
    };
  }

  private async getOrCreateToday(): Promise<AiUsage> {
    const key = todayKey();
    await this.usageRepo
      .createQueryBuilder()
      .insert()
      .into(AiUsage)
      .values({ date: key })
      .orIgnore()
      .execute();
    return this.usageRepo.findOneByOrFail({ date: key });
  }
}
