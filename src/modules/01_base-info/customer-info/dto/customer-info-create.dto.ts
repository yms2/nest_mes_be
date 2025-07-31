import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  Length,
  IsNumberString,
  IsNotEmpty,
  Matches,
  ValidateIf,
  IsEmail,
} from 'class-validator';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class CreateCustomerInfoDto {
  //필수값
  @ApiProperty({
    example: '6743001715',
    description: '사업자 번호 (숫자 10자리, 필수)',
    required: true,
  })
  @IsNumberString({}, { message: '사업자등록번호는 숫자만 입력하세요.' })
  @Length(10, 10, { message: '사업자등록번호는 10자리 숫자여야 합니다.' })
  customerNumber: string;

  @ApiProperty({
    example: '현대자동차',
    description: '거래처 명 (필수)',
    required: true,
  })
  @IsString({ message: '거래처 명은 필수값입니다.' })
  @IsNotEmpty({ message: '거래처 명은 필수 입력값입니다.' })
  customerName: string;

  @ApiProperty({
    example: '112332-1323333',
    description: '법인 번호 (선택)',
    required: false,
  })
  @OptionalString()
  @Length(13, 13, { message: '법인번호는 13자리 숫자여야 합니다.' })
  customerCorporateRegistrationNumber?: string;

  @ApiProperty({
    example: '김대호',
    description: '거래처 CEO (필수)',
    required: true,
  })
  @IsString({ message: '거래처 CEO는 필수값입니다.' })
  @IsNotEmpty({ message: '거래처 CEO는 필수 입력값입니다.' })
  customerCeo: string;

  @ApiProperty({
    example: '매출처',
    description: '거래구분 (선택)',
    required: false,
  })
  @OptionalString()
  customerType?: string;

  //선택값
  @ApiProperty({
    example: '기계업',
    description: '업태 (선택)',
    required: false,
  })
  @OptionalString()
  customerBusinessType?: string;

  @ApiProperty({
    example: '기계제조업',
    description: '종목 (선택)',
    required: false,
  })
  @OptionalString()
  customerBusinessItem?: string;

  @ApiProperty({
    example: '051-3322-3321',
    description: '거래처 전화번호 (선택)',
    required: false,
  })
  @OptionalString()
  @Transform(({ value }) => (value === '' ? undefined : value)) // 빈 문자열이면 undefined 처리
  @ValidateIf((obj, value) => value !== undefined) // 값이 있을 때만 아래 검증 수행
  @Matches(/^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/, {
    message: '전화번호는 숫자만 입력하거나 000-0000-0000 형식으로 입력해야 합니다.',
  })
  customerTel?: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '거래처 휴대폰번호 (선택)',
    required: false,
  })
  @OptionalString()
  @Matches(/^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/, {
    message: '휴대폰번호는 숫자만 입력하거나 000-0000-0000 형식으로 입력해야 합니다.',
  })
  @Transform(({ value }) => (value === '' ? undefined : value)) // 빈 문자열이면 undefined 처리
  @ValidateIf((obj, value) => value !== undefined) // 값이 있을 때만 아래 검증 수행
  customerMobile?: string;

  @ApiProperty({
    example: 'test@naver.com',
    description: '거래처 이메일 (선택)',
    required: false,
  })
  @OptionalString()
  @IsEmail({}, { message: '이메일 형식이 잘못되었습니다.' })
  customerEmail?: string;

  @ApiProperty({
    example: 'test@naver.com',
    description: '거래처 계산서 이메일 (선택)',
    required: false,
  })
  @OptionalString()
  @IsEmail({}, { message: '이메일 형식이 잘못되었습니다.' })
  customerInvoiceEmail?: string;

  @ApiProperty({
    example: '42520',
    description: '거래처 우편번호 (선택)',
    required: false,
  })
  @OptionalString()
  customerZipcode?: string;

  @ApiProperty({
    example: '부산광역시 해운대구 센텀동로 123',
    description: '거래처 주소 (선택)',
    required: false,
  })
  @OptionalString()
  customerAddress?: string;

  @ApiProperty({
    example: '아파트 3층',
    description: '거래처 상세주소 (선택)',
    required: false,
  })
  @OptionalString()
  customerAddressDetail?: string;
}
