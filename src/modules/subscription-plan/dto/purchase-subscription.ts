import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';

enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

class PaymentDetailsDto {
  @ApiProperty({
    description: 'Karta raqami (16 talik)',
    example: '4444 4444 4444 4444',
  })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiProperty({
    description: 'Amal qilish muddati (MM/YY)',
    example: '12/28',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Muddat MM/YY formatida bo'lishi kerak",
  })
  expiry: string;

  @ApiProperty({
    description: 'Karta egasining ismi va familiyasi',
    example: 'Bunyodbek Gulomjonov',
  })
  @IsString()
  @IsNotEmpty()
  card_holder: string;
}

export class PurchaseDto {
  @ApiProperty({
    description: 'Sotib olinayotgan tarif rejasi (Plan) ID raqami',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({
    description: "To'lov usuli",
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod, {
    message: "To'lov turi faqat CARD yoki BANK_TRANSFER bo'lishi kerak",
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: "Avtomatik yangilanish (obunani uzaytirish)",
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoRenew: boolean;

  @ApiProperty({
    description: "To'lov kartasi ma'lumotlari",
    type: PaymentDetailsDto,
  })
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  @IsNotEmpty()
  payment_details: PaymentDetailsDto;
}