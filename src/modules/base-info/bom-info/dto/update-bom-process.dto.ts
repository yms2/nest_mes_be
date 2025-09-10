import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateBomProcessDto {
  @ApiProperty({
    description: '제품 코드',
    example: 'PRD001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productCode?: string;

  @ApiProperty({
    description: '공정 순서',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  processOrder?: number;

  @ApiProperty({
    description: '공정 코드',
    example: 'PRC001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processCode?: string;

  @ApiProperty({
    description: '공정명',
    example: '절삭',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processName?: string;
}

export class UpdateMultipleBomProcessDto {
  @ApiProperty({
    description: '수정할 BOM 공정 ID',
    example: 1,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: '새로운 제품 코드',
    example: 'PRD002',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productCode?: string;

  @ApiProperty({
    description: '새로운 공정 순서',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  processOrder?: number;

  @ApiProperty({
    description: '새로운 공정 코드',
    example: 'PRC002',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processCode?: string;

  @ApiProperty({
    description: '새로운 공정명',
    example: '연마',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processName?: string;
}
