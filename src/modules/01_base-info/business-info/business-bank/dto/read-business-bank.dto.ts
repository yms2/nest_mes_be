import { ApiProperty } from "@nestjs/swagger";
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class ReadBusinessBankDto extends BaseSearchDto {
  @ApiProperty({
    example: 'BPLC001',
    description: '사업장 코드 (단일 사업장 조회용)',
    required: false,
  })
  @OptionalString()
  businessCode?: string;
}