import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProductionInstructionDto {
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

  @ApiProperty({ 
    description: '사원 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ 
    description: '업체명',
    required: false 
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ 
    description: '프로젝트명',
    required: false 
  })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ 
    description: '품목명',
    required: false 
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({ 
    description: '구분',
    required: false 
  })
  @IsString()
  @IsOptional()
  productType?: string;
}
