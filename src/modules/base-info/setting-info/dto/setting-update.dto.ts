import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class UpdateSubCodeDto {
  @ApiProperty({ example: 1, description: '기본 코드 ID' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  baseCodeId: number;

  @ApiProperty({ example: 'subcode', description: '서브 코드명' })
  @IsNotEmpty()
  @IsString()
  subCodeName: string;

  @ApiProperty({ example: 'subcode', description: '서브 코드 설명', required: false })
  @IsOptional()
  @IsString()
  subCodeDescription?: string;
}