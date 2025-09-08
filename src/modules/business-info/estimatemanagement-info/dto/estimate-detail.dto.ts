import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateEstimateDetailDto {
  @ApiProperty({ 
    description: '견적 ID', 
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  estimateId: number;

  @ApiProperty({ 
    description: '세부품목 코드', 
    example: 'DET001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  detailCode?: string;

  @ApiProperty({ 
    description: '품목 코드', 
    example: 'ITEM001', 
  })
  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @ApiProperty({ 
    description: '품목명', 
    example: 'CPU 프로세서', 
  })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({ 
    description: '품목 사양', 
    example: 'Intel Core i7-12700K', 
    required: false,
  })
  @IsOptional()
  @IsString()
  itemSpecification?: string;

  @ApiProperty({ 
    description: '단위', 
    example: '개', 
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ 
    description: '수량', 
    example: 10.5, 
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: '단가', 
    example: 150000.00, 
  })
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ 
    description: '총 가격', 
    example: 1500000.00, 
  })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

export class UpdateEstimateDetailDto {
  @ApiProperty({ 
    description: '세부품목 코드', 
    example: 'DET001', 
    required: false,
  })
  @IsOptional()
  @IsString() 
  detailCode?: string;

  @ApiProperty({ 
    description: '품목 코드', 
    example: 'ITEM001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  itemCode?: string;

  @ApiProperty({ 
    description: '품목명', 
    example: 'CPU 프로세서', 
    required: false,
  })
  @IsOptional()
  @IsString()
  itemName?: string;

  @ApiProperty({ 
    description: '품목 사양', 
    example: 'Intel Core i7-12700K', 
    required: false,
  })
  @IsOptional()
  @IsString()
  itemSpecification?: string;

  @ApiProperty({ 
    description: '단위', 
    example: '개', 
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ 
    description: '수량', 
    example: 10.5, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ 
    description: '단가', 
    example: 150000.00, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ 
    description: '총 가격', 
    example: 1500000.00, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
