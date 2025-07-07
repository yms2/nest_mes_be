import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateBusinessInfoDto {
  @ApiProperty({
    example: '6743001715',
    description: '사업자번호 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessNumber?: string;

  @ApiProperty({
    example: '현대자동차',
    description: '사업장명 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({
    example: '김대호',
    description: '사업장 담당자 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessCeo?: string;

  @ApiProperty({
    example: '1234567890123',
    description: '법인번호 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  corporateRegistrationNumber?: string;

  @ApiProperty({
    example: '제조업',
    description: '업태 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({
    example: '금속 가공업',
    description: '종목 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessItem?: string;

  @ApiProperty({
    example: '0513324423',
    description: '전화번호 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessTel?: string;

  @ApiProperty({
    example: '01012345678',
    description: '휴대전화 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessMobile?: string;

  @ApiProperty({
    example: '0513324423',
    description: 'FAX (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessFax?: string;

  @ApiProperty({
    example: '23442',
    description: '우편번호 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessZipcode?: string;

  @ApiProperty({
    example: '서울특별시 강남구 역삼동 123-45',
    description: '주소 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({
    example: '서울특별시 강남구 역삼동 123-45',
    description: '상세주소 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessAddressDetail?: string;

  @ApiProperty({
    example: 'test@test.com',
    description: '대표자 이메일 (선택)',
    required: false,
  })
  @IsOptional()
  @IsString()
  businessCeoEmail?: string;
}
