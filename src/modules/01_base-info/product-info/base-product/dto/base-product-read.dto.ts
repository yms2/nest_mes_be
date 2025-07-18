import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class BaseProductReadDto extends BaseSearchDto {
  @ApiPropertyOptional({
    example: 'PROD001',
    description: '제품 코드 (단일 제품 조회용)',
  })
  @IsOptional()
  @IsString()
  productCode?: string;
}