import { Module } from "@nestjs/common";
import { OriginGuard } from "./origin.guard";
import { RateLimiterService, RateLimitGuard } from "./rate-limit.guard";

@Module({
  providers: [RateLimiterService, RateLimitGuard, OriginGuard],
  exports: [RateLimiterService, RateLimitGuard, OriginGuard],
})
export class CommonModule {}
