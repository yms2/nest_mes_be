import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateDirectProductionPlanDto {
  @ApiProperty({ 
    example: '2025-01-15', 
    description: '생산 계획 일자',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionPlanDate: string;

  @ApiProperty({ 
    example: 'PRD001', 
    description: '품목 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @ApiProperty({ 
    example: '제품명', 
    description: '품목명',
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    example: 100, 
    description: '생산 계획 수량',
    required: true 
  })
  @IsNumber()
  @Min(1)
  productionPlanQuantity: number;

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
    example: '신규', 
    description: '주문 유형',
    required: false 
  })
  @IsString()
  @IsOptional()
  orderType?: string;

  @ApiProperty({ 
    example: 'PRJ001', 
    description: '프로젝트 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectCode?: string;

  @ApiProperty({ 
    example: '프로젝트 이름', 
    description: '프로젝트 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ 
    example: 'CUS001', 
    description: '고객 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerCode?: string;

  @ApiProperty({ 
    example: '고객 이름', 
    description: '고객 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ 
    example: '긴급 생산 계획', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateDirectProductionPlanDto {
  @ApiProperty({ 
    example: '2025-01-15', 
    description: '생산 계획 일자',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  productionPlanDate?: string;

  @ApiProperty({ 
    example: '제품명', 
    description: '품목명',
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    example: 100, 
    description: '생산 계획 수량',
    required: false 
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  productionPlanQuantity?: number;

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
    example: '신규', 
    description: '주문 유형',
    required: false 
  })
  @IsString()
  @IsOptional()
  orderType?: string;

  @ApiProperty({ 
    example: 'PRJ001', 
    description: '프로젝트 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectCode?: string;

  @ApiProperty({ 
    example: '프로젝트 이름', 
    description: '프로젝트 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ 
    example: 'CUS001', 
    description: '고객 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerCode?: string;

  @ApiProperty({ 
    example: '고객 이름', 
    description: '고객 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ 
    example: '긴급 생산 계획', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
