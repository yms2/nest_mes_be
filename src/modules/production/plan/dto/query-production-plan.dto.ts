import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProductionPlanDto {
  @ApiProperty({ 
    description: '품목명',
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    description: '프로젝트명',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ 
    description: '고객명',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ 
    description: '담당자명',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ 
    description: '수주코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  orderCode?: string;

  @ApiProperty({ 
    description: '생산 계획 일자 시작',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  productionPlanDateFrom?: string;

  @ApiProperty({ 
    description: '생산 계획 일자 종료',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  productionPlanDateTo?: string;

  @ApiProperty({ 
    description: '예상 시작일 시작',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedStartDateFrom?: string;

  @ApiProperty({ 
    description: '예상 시작일 종료',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedStartDateTo?: string;

  @ApiProperty({ 
    description: '예상 완료일 시작',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedCompletionDateFrom?: string;

  @ApiProperty({ 
    description: '예상 완료일 종료',
    required: false 
  })
  @IsDateString()
  @IsOptional()
  expectedCompletionDateTo?: string;

  @ApiProperty({ 
    description: '페이지 번호',
    required: false,
    minimum: 1,
    default: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ 
    description: '페이지당 항목 수',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
