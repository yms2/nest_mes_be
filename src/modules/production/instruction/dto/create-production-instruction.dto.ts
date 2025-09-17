import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductionInstructionDto {
  @ApiProperty({ 
    example: 'PP001', 
    description: '생산 계획 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  productionPlanCode: string;

  @ApiProperty({ 
    example: 100, 
    description: '생산 지시 수량',
    required: true 
  })
  @IsNumber()
  @Min(1)
  productionInstructionQuantity: number;

  @ApiProperty({ 
    example: '2025-01-20', 
    description: '생산 시작일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionStartDate: string;

  @ApiProperty({ 
    example: '2025-01-25', 
    description: '생산 완료일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionCompletionDate: string;

  @ApiProperty({ 
    example: 'EMP001', 
    description: '사원 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '사원 이름',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @ApiProperty({ 
    example: '긴급 생산 지시', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class CreateProductionInstructionFromPlanDto {
  @ApiProperty({ 
    example: ['PP001', 'PP002'], 
    description: '생산 계획 코드 목록',
    required: true 
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  productionPlanCodes: string[];

  @ApiProperty({ 
    example: '2025-01-20', 
    description: '생산 시작일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionStartDate: string;

  @ApiProperty({ 
    example: '2025-01-25', 
    description: '생산 완료일',
    required: true 
  })
  @IsDateString()
  @IsNotEmpty()
  productionCompletionDate: string;

  @ApiProperty({ 
    example: 'EMP001', 
    description: '사원 코드',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '사원 이름',
    required: true 
  })
  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @ApiProperty({ 
    example: '긴급 생산 지시', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
