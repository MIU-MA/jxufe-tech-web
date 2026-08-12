import { Module } from "@nestjs/common";
import { RebuildController } from "./rebuild.controller";
import { RebuildService } from "./rebuild.service";

@Module({
  controllers: [RebuildController],
  providers: [RebuildService],
  exports: [RebuildService],
})
export class RebuildModule {}
