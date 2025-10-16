import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DefectReasonDto {
  @ApiProperty({ 
    example: '표면 불량', 
    description: '불량 사유',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  defectReason: string;

  @ApiProperty({ 
    example: 2, 
    description: '불량 수량',
    required: true 
  })
  @IsNumber()
  @Min(0)
  defectQuantity: number;
}

export class EndProductionDto {
  @ApiProperty({ 
    example: 'PRO20250120001', 
    description: '생산 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  productionCode: string;

  @ApiProperty({ 
    example: 95, 
    description: '생산 완료 수량',
    required: true 
  })
  @IsNumber()
  @Min(0)
  productionCompletionQuantity: number;

  @ApiProperty({ 
    example: 5, 
    description: '총 불량 수량',
    required: true 
  })
  @IsNumber()
  @Min(0)
  totalDefectQuantity: number;

  @ApiProperty({ 
    example: 'EMP001', 
    description: '담당자 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '담당자 이름',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @ApiProperty({ 
    example: '생산 완료', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ 
    type: [DefectReasonDto],
    description: '불량 사유 목록',
    required: false 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefectReasonDto)
  @IsOptional()
  defectReasons?: DefectReasonDto[];

  @ApiProperty({ 
    example: 'WHS001', 
    description: '창고 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  warehouseCode?: string;

  @ApiProperty({ 
    example: '창고1', 
    description: '창고명',
    required: false 
  })
  @IsString()
  @IsOptional()
  warehouseName?: string;

  @ApiProperty({ 
    example: '1구역', 
    description: '창고 구역',
    required: false 
  })
  @IsString()
  @IsOptional()
  warehouseZone?: string;
}
