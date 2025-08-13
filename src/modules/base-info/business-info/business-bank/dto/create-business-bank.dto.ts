import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsOptional, Matches } from 'class-validator';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class CreateBusinessBankDto {
  @ApiProperty({
    example: 'BUS001',
    description: '사업장 코드 (필수)',
    required: true,
  })
  @IsString({ message: '사업장 코드는 필수값입니다.' })
  businessCode: string;

  @ApiProperty({
    example: '001',
    description: '은행 코드 (필수)',
    required: true,
  })
  @IsString({ message: '은행 코드는 필수값입니다.' })
  bankCode: string;

  @ApiProperty({
    example: '국민은행',
    description: '은행명 (필수)',
    required: true,
  })
  @IsString({ message: '은행명은 필수값입니다.' })
  @IsNotEmpty({ message: '은행명은 필수 입력값입니다.' })
  bankName: string;

  @ApiProperty({
    example: '1234567890',
    description: '계좌 번호 (필수)',
    required: true,
  })
  @IsString({ message: '계좌 번호는 필수값입니다.' })
  @IsNotEmpty({ message: '계좌 번호는 필수 입력값입니다.' })
  accountNumber: string;

  @ApiProperty({
    example: '홍길동',
    description: '예금주 (필수)',
    required: true,
  })
  @IsString({ message: '예금주는 필수값입니다.' })
  @IsNotEmpty({ message: '예금주는 필수 입력값입니다.' })
  accountHolder: string;
}
