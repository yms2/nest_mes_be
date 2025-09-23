import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentHistoryDto {
  @ApiProperty({
    description: '설비 코드',
    example: 'EQ001',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  equipmentCode: string;

  @ApiProperty({
    description: '설비 이름',
    example: 'CNC 머신',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  equipmentName: string;

  @ApiProperty({
    description: '고장일자',
    example: '2025-01-15',
  })
  @IsDateString()
  equipmentDate: string;

  @ApiProperty({
    description: '고장내역',
    example: '모터 고장',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentHistory?: string;

  @ApiProperty({
    description: '점검 및 수리',
    example: '모터 교체',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentRepair?: string;

  @ApiProperty({
    description: '비용',
    example: 500000,
    minimum: 0,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  equipmentCost?: number;

  @ApiProperty({
    description: '담당자 코드',
    example: 'EMP001',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  employeeCode?: string;

  @ApiProperty({
    description: '사원 이름',
    example: '김철수',
    maxLength: 20,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  employeeName?: string;

  @ApiProperty({
    description: '비고',
    example: '긴급 수리 완료',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  remark?: string;
}
