import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductionInstructionDto {
  @ApiProperty({ 
    example: 100, 
    description: '생산 지시 수량',
    required: false 
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  productionInstructionQuantity?: number;

  @ApiProperty({ 
    example: '2025-01-20', 
    description: '생산 시작일',
    required: false 
  })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsOptional()
  productionStartDate?: Date;

  @ApiProperty({ 
    example: '2025-01-25', 
    description: '생산 완료일',
    required: false 
  })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @IsOptional()
  productionCompletionDate?: Date;

  @ApiProperty({ 
    example: 'EMP001', 
    description: '사원 코드',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ 
    example: '홍길동', 
    description: '사원 이름',
    required: false 
  })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ 
    example: '긴급 생산 지시', 
    description: '비고',
    required: false 
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
