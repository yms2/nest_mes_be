import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BomProcessItemDto {
  @ApiProperty({
    description: '제품 코드',
    example: 'PRD001',
  })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({
    description: '공정 순서',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  processOrder: number;

  @ApiProperty({
    description: '공정 코드',
    example: 'PRC001',
  })
  @IsString()
  @IsNotEmpty()
  processCode: string;

  @ApiProperty({
    description: '공정명',
    example: '절삭',
  })
  @IsString()
  @IsNotEmpty()
  processName: string;
}

export class CreateBomProcessDto {
  @ApiProperty({
    description: 'BOM 공정 정보',
    type: BomProcessItemDto,
    example: {
      productCode: 'PRD001',
      processOrder: 1,
      processCode: 'PRC001',
      processName: '절삭',
    },
  })
  @ValidateNested()
  @Type(() => BomProcessItemDto)
  bomProcess: BomProcessItemDto;
}

export class CreateMultipleBomProcessDto {
  @ApiProperty({
    description: 'BOM 공정 정보 목록',
    type: [BomProcessItemDto],
    example: [
      { productCode: 'PRD001', processOrder: 1, processCode: 'PRC001', processName: '절삭' },
      { productCode: 'PRD001', processOrder: 2, processCode: 'PRC002', processName: '연마' },
      { productCode: 'PRD001', processOrder: 3, processCode: 'PRC003', processName: '도장' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomProcessItemDto)
  bomProcesses: BomProcessItemDto[];
}
