import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator';

export class CreateBomDto {
  @ApiProperty({
    description: '상위품목 코드',
    example: 'PROD001',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  parentProductCode: string;

  @ApiProperty({
    description: '하위품목 코드',
    example: 'PROD002',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  childProductCode: string;

  @ApiProperty({
    description: '수량',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: '단위',
    example: '개',
    minLength: 1,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  unit: string;
}
