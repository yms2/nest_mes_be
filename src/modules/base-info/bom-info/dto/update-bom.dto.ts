import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class UpdateBomDto {
  @ApiProperty({
    description: '상위품목 코드',
    example: 'PROD001',
    minLength: 1,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  parentProductCode?: string;

  @ApiProperty({
    description: '하위품목 코드',
    example: 'PROD002',
    minLength: 1,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  childProductCode?: string;

  @ApiProperty({
    description: '수량',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: '단위',
    example: 'EA',
    minLength: 1,
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  unit?: string;
}
