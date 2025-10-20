import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InventorySummaryQueryDto {
  @ApiProperty({ 
    description: '시작 날짜',
    required: true 
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    description: '종료 날짜',
    required: true 
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({ 
    description: '재고 코드 (선택사항)',
    required: false 
  })
  @IsOptional()
  @IsString()
  inventoryCode?: string;

  @ApiProperty({ 
    description: '재고명 (부분 검색 가능)',
    required: false 
  })
  @IsOptional()
  @IsString()
  inventoryName?: string;

  @ApiProperty({ 
    description: '페이지 번호',
    required: false,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: '페이지당 항목 수',
    required: false,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class InventorySummaryItemDto {
  @ApiProperty({ description: '재고 코드' })
  inventoryCode: string;

  @ApiProperty({ description: '재고명' })
  inventoryName: string;

  @ApiProperty({ description: '기간 이전 재고 수량' })
  previousQuantity: number;

  @ApiProperty({ description: '기간 내 입고 수량' })
  inboundQuantity: number;

  @ApiProperty({ description: '기간 내 출고 수량' })
  outboundQuantity: number;

  @ApiProperty({ description: '기간 내 조정 수량' })
  adjustmentQuantity: number;

  @ApiProperty({ description: '현재 재고 수량' })
  currentQuantity: number;

  @ApiProperty({ description: '입고 건수' })
  inboundCount: number;

  @ApiProperty({ description: '출고 건수' })
  outboundCount: number;

  @ApiProperty({ description: '조정 건수' })
  adjustmentCount: number;

  @ApiProperty({ description: '마지막 거래일시' })
  lastTransactionDate: Date;
}

export class InventorySummaryResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ 
    description: '재고 현황 목록',
    type: [InventorySummaryItemDto]
  })
  data: InventorySummaryItemDto[];

  @ApiProperty({ 
    description: '페이지네이션 정보'
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({ 
    description: '전체 통계 정보'
  })
  statistics: {
    totalItems: number;
    totalPreviousQuantity: number;
    totalInboundQuantity: number;
    totalOutboundQuantity: number;
    totalAdjustmentQuantity: number;
    totalCurrentQuantity: number;
    totalInboundCount: number;
    totalOutboundCount: number;
    totalAdjustmentCount: number;
  };

  @ApiProperty({ 
    description: '조회 기간 정보'
  })
  period: {
    startDate: string;
    endDate: string;
    periodDays: number;
  };
}
