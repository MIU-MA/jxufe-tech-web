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

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  async check(): Promise<boolean> {
    const row = await this.getOrCreateToday();
    const ok =
      row.requests < this.requestLimit &&
      row.promptTokens + row.completionTokens < this.tokenBudget;
    if (!ok) {
      this.logger.warn(
        `AI 每日预算已用完：请求 ${row.requests}/${this.requestLimit}，tokens ${row.promptTokens + row.completionTokens}/${this.tokenBudget}`,
      );
    }
    return ok;
  }

  async record(usage: TokenUsage): Promise<void> {
    const row = await this.getOrCreateToday();
    row.requests += 1;
    row.promptTokens += usage.promptTokens || 0;
    row.completionTokens += usage.completionTokens || 0;
    await this.usageRepo.save(row);
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
    const existing = await this.usageRepo.findOne({ where: { date: key } });
    if (existing) return existing;
    const row = this.usageRepo.create({ date: key });
    return this.usageRepo.save(row);
  }
}
