import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './create-user.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'bunyodbek0220' })
  username?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  awatarUrl?: string;
}
