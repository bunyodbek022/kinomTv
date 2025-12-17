import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: "Bunyodbek G'ulomjonov" })
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber()
  @ApiProperty({ example: '+998939349340' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Uzbekistan' })
  country?: string;
}
