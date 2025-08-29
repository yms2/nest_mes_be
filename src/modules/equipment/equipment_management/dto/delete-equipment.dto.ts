import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteEquipmentDto {
  @ApiProperty({
    description: '삭제 사유',
    example: '노후화로 인한 폐기',
    required: false,
  })
  @IsString()
  @IsOptional()
  deleteReason?: string;

  @ApiProperty({
    description: '삭제 담당자',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  deleteWorker?: string;
}
