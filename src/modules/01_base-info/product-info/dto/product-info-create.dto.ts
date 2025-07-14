import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { OptionalString } from "src/common/decorators/optional-string.decorator";
import { IsString, IsOptional, Length, IsNumberString, IsNotEmpty, Matches, ValidateIf } from 'class-validator';

export class CreateProductInfoDto {
  @ApiProperty({
    example: '볼펜',
    description: '품목명',
    required: true,
  })
  @IsString({ message: '품목명은 필수값입니다.' })
  @IsNotEmpty({ message: '품목명은 필수 입력값입니다.' })
  productName: string;

  @ApiProperty({
    example: '완제품',
    description: '품목 구분',
    required: true,
  })
  @IsString({ message: '품목구분은 필수값입니다.' })
  @IsNotEmpty({ message: '품목구분은 필수 입력값입니다.' })  
  productType: string;

  @ApiProperty({
    example: '15',
    description: '규격',
    required: false,
  })
  @OptionalString()
  productSize: string;

  @ApiProperty({
    example: 'kg',
    description: '발주단위',
    required: false,
  })
  @OptionalString()
  productOrderUnit: string;

  @ApiProperty({
    example: 'EA',
    description: '재고단위',
    required: false,
  })
  @OptionalString()
  productInventoryUnit: string;

  @ApiProperty({
    example: '14',
    description: '수량 당 수량',
    required: false,
  })
  @OptionalString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((obj, value) => value !== undefined)
  @IsNumberString({}, { message: '수량당 수량은 숫자만 입력 가능합니다.' })
  unitQuantity: string;

  @ApiProperty({
    example: 20,
    description: '안전재고',
    required: false,
  })
  @OptionalString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((obj, value) => value !== undefined)
  @IsNumberString({}, { message: '안전재고는 숫자만 입력 가능합니다.' })
  safeInventory: string

  @ApiProperty({
    example: '과세',
    description:'과세구분',
    required: false
  })
  @OptionalString()
  taxType: string;

  @ApiProperty({
    example: '2500',
    description: '단가',
    required: false
  })
  @OptionalString()
  productPrice: string;

  @ApiProperty({
    example: '비고내용',
    description: '비고',
    required: false
  })
  @OptionalString()
  productBigo: string
}