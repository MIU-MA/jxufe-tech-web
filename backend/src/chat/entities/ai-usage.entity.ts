import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("ai_usage")
export class AiUsage {
  @PrimaryColumn({ type: "text", length: 10 })
  date!: string;

  @Column({ type: "integer", default: 0 })
  requests!: number;

  @Column({ type: "integer", default: 0 })
  promptTokens!: number;

  @Column({ type: "integer", default: 0 })
  completionTokens!: number;
}
