import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProductionResultDto {
  @ApiProperty({ 
    description: '페이지 번호',
    required: false,
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
    default: 20
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({ 
    description: '생산 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  productionCode?: string;

  @ApiProperty({ 
    description: '생산 지시 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  productionInstructionCode?: string;

  @ApiProperty({ 
    description: '제품 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  productCode?: string;

  @ApiProperty({ 
    description: '제품명',
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    description: '생산 상태',
    required: false 
  })
  @IsString()
  @IsOptional()
  productionStatus?: string;

  @ApiProperty({ 
    description: '담당자 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ 
    description: '담당자명',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ 
    description: '생산 시작일 (시작)',
    required: false 
  })
  @IsString()
  @IsOptional()
  startDateFrom?: string;

  @ApiProperty({ 
    description: '생산 시작일 (종료)',
    required: false 
  })
  @IsString()
  @IsOptional()
  startDateTo?: string;

  @ApiProperty({ 
    description: '생산 완료일 (시작)',
    required: false 
  })
  @IsString()
  @IsOptional()
  completionDateFrom?: string;

  @ApiProperty({ 
    description: '생산 완료일 (종료)',
    required: false 
  })
  @IsString()
  @IsOptional()
  completionDateTo?: string;
}
