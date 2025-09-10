import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ChangeQuantityDto {
  @ApiProperty({
    example: 'PRD001',
    description: '재고 코드',
    required: true,
  })
  @IsString({ message: '재고 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '재고 코드는 필수입니다.' })
  inventoryCode: string;

  @ApiProperty({
    example: 50,
    description: '변경할 수량 (양수: 증가, 음수: 감소)',
    required: true,
  })
  @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
  @IsNotEmpty({ message: '수량은 필수입니다.' })
  quantityChange: number;

  @ApiProperty({
    example: '입고 처리',
    description: '수량 변경 사유',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '변경 사유는 문자열이어야 합니다.' })
  reason?: string;
}

export class SetQuantityDto {
  @ApiProperty({
    example: 'PRD001',
    description: '재고 코드',
    required: true,
  })
  @IsString({ message: '재고 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '재고 코드는 필수입니다.' })
  inventoryCode: string;

  @ApiProperty({
    example: 100,
    description: '설정할 수량',
    required: true,
  })
  @IsNumber({}, { message: '수량은 숫자여야 합니다.' })
  @IsNotEmpty({ message: '수량은 필수입니다.' })
  @Min(0, { message: '수량은 0 이상이어야 합니다.' })
  quantity: number;

  @ApiProperty({
    example: '재고 조정',
    description: '수량 설정 사유',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '설정 사유는 문자열이어야 합니다.' })
  reason?: string;
}

export class MultipleQuantityChangeDto {
  @ApiProperty({
    type: [ChangeQuantityDto],
    description: '수량 변경할 재고 목록',
    required: true,
  })
  @IsNotEmpty({ message: '재고 목록은 필수입니다.' })
  inventories: ChangeQuantityDto[];
}

export class MultipleQuantitySetDto {
  @ApiProperty({
    type: [SetQuantityDto],
    description: '수량 설정할 재고 목록',
    required: true,
  })
  @IsNotEmpty({ message: '재고 목록은 필수입니다.' })
  inventories: SetQuantityDto[];
}
