import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "bunyodbek0220"})
  username: string;

  @IsEmail()
  @ApiProperty({example: "gulomjonovbunyodbek60@gmail.com"})
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({example: "123456", description : "Min length 6"})
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  awatarUrl?: string;
}
