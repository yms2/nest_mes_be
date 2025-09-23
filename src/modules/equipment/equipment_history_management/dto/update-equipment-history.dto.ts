import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEquipmentHistoryDto {
  @ApiProperty({ description: '설비 코드', example: 'EQ001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentCode?: string;

  @ApiProperty({ description: '설비 이름', example: 'CNC 머신', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentName?: string;

  @ApiProperty({ description: '고장일자', example: '2025-01-15', required: false })
  @IsDateString({}, { message: '고장일자는 유효한 날짜 형식(YYYY-MM-DD)이어야 합니다.' })
  @IsOptional()
  equipmentDate?: string;

  @ApiProperty({ description: '고장내역', example: '모터 고장', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentHistory?: string;

  @ApiProperty({ description: '점검 및 수리 내역', example: '모터 교체', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  equipmentRepair?: string;

  @ApiProperty({ description: '비용', example: 500000, required: false })
  @Type(() => Number)
  @IsNumber({}, { message: '비용은 숫자여야 합니다.' })
  @Min(0, { message: '비용은 0 이상이어야 합니다.' })
  @IsOptional()
  equipmentCost?: number;

  @ApiProperty({ description: '담당자 코드', example: 'EMP001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  employeeCode?: string;

  @ApiProperty({ description: '담당자 이름', example: '김철수', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  employeeName?: string;

  @ApiProperty({ description: '비고', example: '긴급 수리 완료', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  remark?: string;
}
