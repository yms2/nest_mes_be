import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessEquipmentItemDto {
  @ApiProperty({
    description: '공정 코드',
    example: 'PRC001',
  })
  @IsString()
  @IsNotEmpty()
  processCode: string;

  @ApiProperty({
    description: '설비 코드',
    example: 'EQ001',
  })
  @IsString()
  @IsNotEmpty()
  equipmentCode: string;
}

export class CreateProcessEquipmentDto {
  @ApiProperty({
    description: '공정 설비 정보',
    type: ProcessEquipmentItemDto,
    example: {
      processCode: 'PRC001',
      equipmentCode: 'EQ001',
    },
  })
  @ValidateNested()
  @Type(() => ProcessEquipmentItemDto)
  processEquipment: ProcessEquipmentItemDto;
}

export class CreateMultipleProcessEquipmentDto {
  @ApiProperty({
    description: '공정 설비 정보 목록',
    type: [ProcessEquipmentItemDto],
    example: [
      { processCode: 'PRC001', equipmentCode: 'EQ001' },
      { processCode: 'PRC001', equipmentCode: 'EQ002' },
      { processCode: 'PRC002', equipmentCode: 'EQ003' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessEquipmentItemDto)
  processEquipments: ProcessEquipmentItemDto[];
}
