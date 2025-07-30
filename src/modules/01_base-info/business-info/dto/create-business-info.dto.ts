import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length, IsNumberString, IsNotEmpty, IsEmail } from 'class-validator';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';

export class CreateBusinessInfoDto {
  @ApiProperty({
    example: '6743001715',
    description: '사업자 번호 (필수)',
    required: true,
  })
  @IsNumberString({}, { message: '사업자등록번호는 숫자만 입력하세요.' })
  @Length(10, 10, { message: '사업자등록번호는 10자리 숫자여야 합니다.' })
  businessNumber: string;

  @ApiProperty({
    example: '현대자동차',
    description: '사업장명 (필수)',
    required: true,
  })
  @IsString({ message: '사업장명은 필수값입니다.' })
  @IsNotEmpty({ message: '사업장명은 필수 입력값입니다.' })
  businessName: string;

  @ApiProperty({
    example: '김대호',
    description: '사업장 담당자 (필수)',
    required: true,
  })
  @IsString({ message: 'CEO는 필수값입니다.' })
  @IsNotEmpty({ message: 'CEO는 필수 입력값입니다.' })
  businessCeo: string;

  @ApiProperty({
    example: '1234567890123',
    description: '법인번호 (선택)',
    required: false,
  })
  @OptionalString()
  @Matches(/^\d{13}$/, { message: '법인번호는 13자리 숫자여야 합니다.' })
  corporateRegistrationNumber?: string;

  @ApiProperty({
    example: '제조업',
    description: '업태 (선택)',
    required: false,
  })
  @OptionalString()
  businessType?: string;

  @ApiProperty({
    example: '금속 가공업',
    description: '종목 (선택)',
    required: false,
  })
  @OptionalString()
  businessItem?: string;

  @ApiProperty({
    example: '0513324423',
    description: '전화번호 (선택)',
    required: false,
  })
  @OptionalString()
  @Matches(/^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/, {
    message: '전화번호는 숫자만 입력하거나 000-0000-0000 형식으로 입력해야 합니다.',
  })
  businessTel?: string;

  @ApiProperty({
    example: '01012345678',
    description: '휴대전화 (선택)',
    required: false,
  })
  @OptionalString()
  @Matches(/^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/, {
    message: '휴대폰번호는 숫자만 입력하거나 000-0000-0000 형식으로 입력해야 합니다.',
  })
  businessMobile?: string;

  @ApiProperty({
    example: '0513324423',
    description: 'FAX (선택)',
    required: false,
  })
  @OptionalString()
  @Matches(/^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/, { message: 'FAX는 숫자만 입력해야 합니다.' })
  businessFax?: string;

  @ApiProperty({
    example: '23442',
    description: '우편번호 (선택)',
    required: false,
  })
  @OptionalString()
  businessZipcode?: string;

  @ApiProperty({
    example: '서울특별시 강남구 역삼동 123-45',
    description: '주소 (선택)',
    required: false,
  })
  @OptionalString()
  businessAddress?: string;

  @ApiProperty({
    example: '서울특별시 강남구 역삼동 123-45',
    description: '상세주소 (선택)',
    required: false,
  })
  @OptionalString()
  businessAddressDetail?: string;

  @ApiProperty({
    example: 'test@test.com',
    description: '대표자 이메일 (선택)',
    required: false,
  })
  @OptionalString()
  @IsEmail({}, { message: '이메일 형식이 잘못되었습니다.' })
  businessCeoEmail?: string;
}
