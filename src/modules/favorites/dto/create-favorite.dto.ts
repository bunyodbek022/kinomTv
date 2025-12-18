import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsUUID } from "class-validator";

export class CreateFavoriteDto {
    @IsUUID()
    @IsNotEmpty()
    @ApiProperty({ example: "d9e20dc7-177b-4536-9519-98f7ae1f7c48" })
    movieId : string
}
