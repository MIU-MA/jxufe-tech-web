import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class LoginDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsString()
  @Length(1, 64)
  username!: string;

  @ApiProperty({ description: "密码", example: "12345678" })
  @IsString()
  @Length(1, 128)
  password!: string;
}
