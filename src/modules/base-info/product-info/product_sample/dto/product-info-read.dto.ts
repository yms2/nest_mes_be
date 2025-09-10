import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class SearchProductInfoDto extends BaseSearchDto {
  @ApiProperty({
    example: '홍길동',
    description: '품명 (포함 검색)',
    required: false,
  })
  @OptionalString()
  productName?: string;
}
