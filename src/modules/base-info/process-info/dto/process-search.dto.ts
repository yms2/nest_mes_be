import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class SearchProcessInfoDto extends BaseSearchDto {
  @ApiProperty({
    example: 'P001',
    description: '공정 코드 (단일 조회용)',
    required: false,
  })
  @OptionalString()
  processCode?: string;
}