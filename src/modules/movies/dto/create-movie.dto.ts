import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsUrl,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export class CreateMovieDto {
  @ApiProperty({ example: 'Qasoskorlar: Abadiyat Jangi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Fantastik janrdagi yilning eng kassabop filmi',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2018 })
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear() + 5)
  release_year: number;

  @ApiProperty({ example: 148 })
  @IsInt()
  @Min(1)
  durationMinuts: number;

  @ApiProperty({ example: 'null' })
  @IsOptional()
  posterUrl?: string;

  @ApiProperty({ example: 'null' })
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: '8.8' })
  @IsNotEmpty()
  rating: string;

  @ApiProperty({ enum: SubType, default: SubType.FREE })
  @IsEnum(SubType)
  @IsOptional()
  subscriptionType?: SubType;
}
