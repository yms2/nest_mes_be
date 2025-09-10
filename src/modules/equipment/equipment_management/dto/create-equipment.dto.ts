import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEquipmentDto {
  @ApiProperty({
    description: '장비 코드 (선택사항, 자동 생성됨)',
    example: 'EQ001',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  equipmentCode?: string;

  @ApiProperty({
    description: '장비명',
    example: 'CNC 머신',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  equipmentName: string;

  @ApiProperty({
    description: '장비 모델',
    example: 'XK-2000',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  equipmentModel: string;

  @ApiProperty({
    description: '구매처',
    example: 'ABC 기계',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  equipmentPurchasePlace: string;

  @ApiProperty({
    description: '구매일',
    example: '2024-01-15',
  })
  @IsDateString()
  equipmentPurchaseDate: string;

  @ApiProperty({
    description: '구매가격',
    example: 50000000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  equipmentPurchasePrice: number;

  @ApiProperty({
    description: '장비 이력',
    example: '2024년 신규 구매, 정밀 가공용',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  equipmentHistory?: string;

  @ApiProperty({
    description: '담당자',
    example: '김철수',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  equipmentWorker?: string;
}
