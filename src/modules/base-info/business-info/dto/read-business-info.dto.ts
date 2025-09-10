import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class ReadBusinessInfoDto extends BaseSearchDto {
  @ApiProperty({
    example: '6743001715',
    description: '사업자 번호 (단일 조회용)',
    required: false,
  })
  @OptionalString()
  businessNumber?: string;

  @ApiProperty({
    example: '삼성전자',
    description: '사업자명 (포함 검색)',
    required: false,
  })
  @OptionalString()
  businessName?: string;
}
