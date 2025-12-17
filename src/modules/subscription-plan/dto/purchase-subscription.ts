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
    BANK_TRANSFER="BANK_TRANSFER"
}

class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Muddat MM/YY formatida bo'lishi kerak",
  })
  expiry: string;

  @IsString()
  @IsNotEmpty()
  card_holder: string;
}

export class PurchaseDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod, {
    message: "To'lov turi faqat CARD yoki BANK_TRANSFER bo'lishi kerak",
  })
  paymentMethod: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  autoRenew: boolean;

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  @IsNotEmpty()
  payment_details: PaymentDetailsDto;
}
