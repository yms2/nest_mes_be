import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsNotEmpty, IsOptional, Min, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEstimateDto {
  @ApiProperty({ 
    description: '견적 코드', 
    example: 'EST20250825001', 
    required: false,
    minLength: 1, 
    maxLength: 20 
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estimateCode?: string;

  @ApiProperty({ 
    description: '견적명', 
    example: '2025년 1분기 스마트폰 견적', 
    minLength: 1, 
    maxLength: 100 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  estimateName: string;

  @ApiProperty({ 
    description: '견적 날짜', 
    example: '2025-08-25',
    type: Date
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  estimateDate: Date;

  @ApiProperty({ 
    description: '견적 버전', 
    example: 1, 
    minimum: 1 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  estimateVersion: number;

  @ApiProperty({ 
    description: '고객 코드', 
    example: 'CUST001', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  customerCode: string;

  @ApiProperty({ 
    description: '고객명', 
    example: '삼성전자', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  customerName: string;

  @ApiProperty({ 
    description: '프로젝트 코드', 
    example: 'PROJ001', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  projectCode: string;

  @ApiProperty({ 
    description: '프로젝트명', 
    example: '스마트폰 개발', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  projectName: string;

  @ApiProperty({ 
    description: '제품 코드', 
    example: 'PROD001', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  productCode: string;

  @ApiProperty({ 
    description: '제품명', 
    example: '갤럭시 S25', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  productName: string;

  @ApiProperty({ 
    description: '제품 수량', 
    example: 1000, 
    minimum: 1 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  productQuantity: number;

  @ApiProperty({ 
    description: '견적 상태', 
    example: '견적중',
    enum: ['견적중', '견적완료', '승인대기', '승인완료', '거절']
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['견적중', '견적완료', '승인대기', '승인완료', '거절'])
  estimateStatus: string;

  @ApiProperty({ 
    description: '견적 가격', 
    example: 50000000, 
    minimum: 0 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  estimatePrice: number;

  @ApiProperty({ 
    description: '직원 코드', 
    example: 'EMP001', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  employeeCode: string;

  @ApiProperty({ 
    description: '직원명', 
    example: '김철수', 
    minLength: 1, 
    maxLength: 20 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  employeeName: string;

  @ApiProperty({ 
    description: '견적 비고', 
    example: '긴급 견적', 
    required: false,
    maxLength: 20 
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estimateRemark?: string;

  @ApiProperty({ 
    description: '주문관리 코드', 
    example: 'ORD001', 
    required: false,
    maxLength: 20 
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  ordermanagementCode?: string;

  @ApiProperty({ 
    description: '결제 조건', 
    example: '30일 후 결제', 
    required: false,
    maxLength: 20 
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  termsOfPayment?: string;
}

export class UpdateEstimateDto {
  @ApiProperty({ 
    description: '견적 코드', 
    example: 'EST20250825001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  estimateCode?: string;

  @ApiProperty({ 
    description: '견적명', 
    example: '2025년 1분기 스마트폰 견적', 
    required: false,
  })
  @IsOptional()
  @IsString()
  estimateName?: string;

  @ApiProperty({ 
    description: '견적 날짜', 
    example: '2025-08-25',
    required: false,
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  estimateDate?: Date;

  @ApiProperty({ 
    description: '견적 버전', 
    example: 2, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimateVersion?: number;

  @ApiProperty({ 
    description: '고객 코드', 
    example: 'CUST001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiProperty({ 
    description: '고객명', 
    example: '삼성전자', 
    required: false,
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    description: '프로젝트 코드', 
    example: 'PROJ001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiProperty({ 
    description: '프로젝트명', 
    example: '스마트폰 개발', 
    required: false,
  })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiProperty({ 
    description: '제품 코드', 
    example: 'PROD001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ 
    description: '제품명', 
    example: '갤럭시 S25', 
    required: false,
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ 
    description: '제품 수량', 
    example: 1000, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  productQuantity?: number;

  @ApiProperty({ 
    description: '견적 상태', 
    example: '견적완료',
    required: false,
    enum: ['견적중', '견적완료', '승인대기', '승인완료', '거절']
  })
  @IsOptional()
  @IsString()
  @IsIn(['견적중', '견적완료', '승인대기', '승인완료', '거절'])
  estimateStatus?: string;

  @ApiProperty({ 
    description: '견적 가격', 
    example: 50000000, 
    required: false,
  })
  @IsOptional()
  @IsNumber()
  estimatePrice?: number;

  @ApiProperty({ 
    description: '직원 코드', 
    example: 'EMP001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ 
    description: '직원명', 
    example: '김철수', 
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ 
    description: '견적 비고', 
    example: '긴급 견적', 
    required: false,
  })
  @IsOptional()
  @IsString()
  estimateRemark?: string;

  @ApiProperty({ 
    description: '주문관리 코드', 
    example: 'ORD001', 
    required: false,
  })
  @IsOptional()
  @IsString()
  ordermanagementCode?: string;

  @ApiProperty({ 
    description: '결제 조건', 
    example: '30일 후 결제', 
    required: false,
  })
  @IsOptional()
  @IsString()
  termsOfPayment?: string;
}

export class SearchEstimateDto {
  @ApiProperty({ 
    description: '견적 코드', 
    example: 'EST20250825001', 
    required: false
  })
  @IsOptional()
  @IsString()
  estimateCode?: string;

  @ApiProperty({ 
    description: '고객 코드', 
    example: 'CUST001', 
    required: false
  })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiProperty({ 
    description: '고객명', 
    example: '삼성전자', 
    required: false
  })
  @IsOptional() 
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    description: '프로젝트 코드', 
    example: 'PROJ001', 
    required: false
  })
  @IsOptional()
  @IsString()
  projectCode?: string;

  @ApiProperty({ 
    description: '프로젝트명', 
    example: '스마트폰 개발', 
    required: false
  })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiProperty({ 
    description: '제품 코드', 
    example: 'PROD001', 
    required: false
  })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ 
    description: '제품명', 
    example: '갤럭시 S25', 
    required: false
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ 
    description: '견적 상태', 
    example: '견적중',
    required: false,
    enum: ['견적중', '견적완료', '승인대기', '승인완료', '거절']
  })
  @IsOptional()
  @IsString()
  @IsIn(['견적중', '견적완료', '승인대기', '승인완료', '거절'])
  estimateStatus?: string;

  @ApiProperty({ 
    description: '직원 코드', 
    example: 'EMP001', 
    required: false
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ 
    description: '직원명', 
    example: '김철수', 
    required: false
  })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ 
    description: '시작 날짜', 
    example: '2025-01-01',
    required: false,
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({ 
    description: '종료 날짜', 
    example: '2025-12-31',
    required: false,
    type: Date
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ 
    description: '최소 견적 가격', 
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ 
    description: '최대 견적 가격', 
    example: 100000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}

