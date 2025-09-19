import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCriteriaDto {
    @ApiProperty({example: 'CRI001', description: '품질기준 코드', required: false })
    @IsString()
    @IsNotEmpty()
    criteriaCode: string;
    @ApiProperty({example: '품질기준 이름', description: '품질기준 이름', required: false })
    @IsString()
    @IsNotEmpty()
    criteriaName: string;
    @ApiProperty({example: '품질기준 타입', description: '품질기준 타입', required: false })
    @IsString()
    @IsNotEmpty()
    criteriaType?: string;
    @ApiProperty({example: '품질기준 설명', description: '품질기준 설명', required: true })
    @IsString()
    @IsNotEmpty()
    criteriaDescription?: string;
}
