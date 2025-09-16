import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductionPlanDto {
  @ApiProperty({ 
    example: 'ORD20250101001', 
    description: '수주 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @ApiProperty({ 
    example: '2025-01-15', 
    description: '생산 계획 일자',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionPlanDate: string;

  @ApiProperty({ 
    example: '2025-01-20', 
    description: '예상 시작일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  expectedStartDate: string;

  @ApiProperty({ 
    example: '2025-01-25', 
    description: '예상 완료일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  expectedCompletionDate: string;

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
    example: '긴급 주문으로 인한 생산 계획', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ 
    example: ['PRD001', 'PRD002', 'PRD003'], 
    description: '생산할 품목 코드들 (프론트에서 선택)',
    type: [String],
    required: true 
  })
  @IsString({ each: true })
  @IsNotEmpty()
  selectedProductCodes: string[];
}

export class UpdateProductionPlanDto {
  @ApiProperty({ 
    example: '2025-01-15', 
    description: '생산 계획 일자',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  productionPlanDate?: string;

  @ApiProperty({ 
    example: '2025-01-20', 
    description: '예상 시작일',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedStartDate?: string;

  @ApiProperty({ 
    example: '2025-01-25', 
    description: '예상 완료일',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedCompletionDate?: string;

  @ApiProperty({ 
    example: 'EMP001', 
    description: '담당자 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '담당자 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ 
    example: '긴급 주문으로 인한 생산 계획', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
