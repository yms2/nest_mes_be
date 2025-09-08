import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProcessEquipmentDto {
  @ApiProperty({
    description: '공정 코드',
    example: 'PRC001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processCode?: string;

  @ApiProperty({
    description: '설비 코드',
    example: 'EQ001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  equipmentCode?: string;
}

export class UpdateMultipleProcessEquipmentDto {
  @ApiProperty({
    description: '수정할 공정 설비 ID',
    example: 1,
  })
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: '새로운 공정 코드',
    example: 'PRC002',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processCode?: string;

  @ApiProperty({
    description: '새로운 설비 코드',
    example: 'EQ002',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  equipmentCode?: string;
}
