// src/modules/movies/dto/movie-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieQueryDto {
  @ApiPropertyOptional({ description: 'Sahifa raqami', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementlar soni', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Kino nomi bo‘yicha qidiruv' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Kategoriya nomi' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Obuna turi', enum: ['FREE', 'PREMIUM'] })
  @IsOptional()
  @IsString()
  subscription_type?: string;
}