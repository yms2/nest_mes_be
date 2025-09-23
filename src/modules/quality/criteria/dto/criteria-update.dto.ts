import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateCriteriaDto {

    @ApiProperty({example: '품질기준 이름', description: '품질기준 이름'})
    @IsString()
    @IsNotEmpty()
    criteriaName: string;

    @ApiProperty({example: '품질기준 타입', description: '품질기준 타입'})
    @IsString()
    @IsNotEmpty()
    criteriaType: string;

    @ApiProperty({example: '품질기준 설명', description: '품질기준 설명'})
    @IsString()
    @IsNotEmpty()
    criteriaDescription: string;
    
}