import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Length, IsOptional } from "class-validator";
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class BaseProductCreateDto {
  @ApiProperty({
    example: 'PROD001',
    description: '제품 코드 (필수)',
    required: true,
  })
  @IsString({ message: '제품 코드는 필수값입니다.' })
  @IsNotEmpty({ message: '제품 코드는 필수 입력값입니다.' })
  productCode: string;

  @ApiProperty({
    example: '기본 제품',
    description: '제품명 (필수)',
    required: true,
  })
  @IsString({ message: '제품명은 필수값입니다.' })
  @IsNotEmpty({ message: '제품명은 필수 입력값입니다.' })
  productName: string;

  @ApiProperty({
    example: 'PJ',
    description: '제품 분류 (선택)',
    required: false,
  })
  @IsString({ message: '제품 유형은 필수값입니다.'})
  @IsNotEmpty({ message: '제품 유형은 필수 입력값입니다.' })
  productCategory: string;

}