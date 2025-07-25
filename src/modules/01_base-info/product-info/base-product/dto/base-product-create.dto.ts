import { OptionalString } from '@/common/decorators/optional-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class BaseProductCreateDto {
  @ApiProperty({
    example: '기본 제품',
    description: '기본 제품 명 (필수)',
    required: true,
  })
  @IsString({ message: '제품명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제품명은 필수 입력값입니다.' })
  productName: string;

  @ApiProperty({
    example: 'PJ',
    description: '기본 제품 분류 (필수)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '제품 유형은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제품 유형은 필수 입력값입니다.' })
  productCategory: string;

  @ApiProperty({
    example: '1000',
    description: '제품 사이즈 (선택)',
    required: false,
  })
  @OptionalString()
  productSize?: string;

  @ApiProperty({
    example: 'C001',
    description: '거래처 코드 (선택)',
    required: false,
  })
  @OptionalString()
  productCustomerCode?: string;

  @ApiProperty({
    example: 'kg',
    description: '발주단위 (선택)',
    required: false,
  })
  @OptionalString()
  productOrderUnit?: string;

  @ApiProperty({
    example: 'kg',
    description: '재고단위 (선택)',
    required: false,
  })
  @OptionalString()
  productInventoryUnit?: string;

  @ApiProperty({
    example: '12',
    description: '수량 당 수량 (선택)',
    required: false,
  })
  @OptionalString()
  productQuantityPerQuantity?: string;

  @ApiProperty({
    example: '12',
    description: '안전재고 (필수)',
    required: true,
  })
  @IsString({ message: '안전재고는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '안전재고는 필수 입력값입니다.' })
  productSafeInventory: string;

  @ApiProperty({
    example: '1',
    description: '입고/과세 (선택)',
    required: false,
  })
  @OptionalString()
  productIncomingTax?: string;

  @ApiProperty({
    example: '1000',
    description: '매입단가 (선택)',
    required: false,
  })
  @OptionalString()
  productIncomingPrice?: string;

  @ApiProperty({
    example: '1',
    description: '출고/과세 (선택)',
    required: false,
  })
  @OptionalString()
  productForwardingTax?: string;

  @ApiProperty({
    example: '1000',
    description: '매출단가 (선택)',
    required: false,
  })
  @OptionalString()
  productForwardingPrice?: string;

  @ApiProperty({
    example: 'homepage.com',
    description: '기본 제품 홈페이지 (선택)',
    required: false,
  })
  @OptionalString()
  productHomepage?: string;

  @ApiProperty({
    example: '비고내용',
    description: '비고 (선택)',
    required: false,
  })
  @OptionalString()
  productBigo?: string;
}