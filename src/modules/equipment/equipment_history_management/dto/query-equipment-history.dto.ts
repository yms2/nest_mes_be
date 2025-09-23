import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class QueryEquipmentHistoryDto {
  @ApiProperty({
    description: '설비 코드',
    example: 'EQ001',
    required: false,
  })
  @IsString()
  @IsOptional()
  equipmentCode?: string;

  @ApiProperty({
    description: '설비명',
    example: 'CNC 머신',
    required: false,
  })
  @IsString()
  @IsOptional()
  equipmentName?: string;

  @ApiProperty({
    description: '담당자명',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  employeeName?: string;
}
