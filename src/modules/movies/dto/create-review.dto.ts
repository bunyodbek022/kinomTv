import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNotEmpty, IsNumber, IsString, Max, Min,  } from "class-validator";

export class CreateReview {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 5.5 })
    @Min(0)
    @Max(10)
    rating: number
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: "Juda zor film ekan" })
    comment?: string
}