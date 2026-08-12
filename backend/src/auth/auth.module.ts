import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { SeedService } from "./seed.service";
import { User } from "./entities/user.entity";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  providers: [AuthService, JwtStrategy, SeedService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
