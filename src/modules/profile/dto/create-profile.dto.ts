import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "Bunyodbek" })
  fullName: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '+998939349340' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Uzbekistan' })
  country: string;
}
