import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BaseSearchDto {
  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '시작일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: '페이지 번호', example: 1 })
  @IsOptional()
  @Type(() => Number) // 쿼리스트링 → 숫자 변환
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 개수', example: 10 })
  @IsOptional()
  @Type(() => Number) // 쿼리스트링 → 숫자 변환
  @IsNumber()
  limit?: number;
}
