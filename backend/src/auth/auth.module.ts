import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
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
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          "7d") as JwtSignOptions["expiresIn"],
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, SeedService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
