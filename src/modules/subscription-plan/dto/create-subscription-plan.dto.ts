// create-subscription-plan.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'FREE' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 0 })
  price: number;

  @IsNumber()
  @ApiProperty({ example: 30 })
  durationDays: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example:
      ['Har qanday tekin bolgan filmlarni 1 oy davomida miriqib tomosha qila olasiz'],
  })
  features?: any;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isActive?: boolean;
}
