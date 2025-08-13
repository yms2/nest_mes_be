import { ApiProperty } from "@nestjs/swagger";
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class ReadCustomerBankDto extends BaseSearchDto {
  @ApiProperty({
    example: 'CUS001',
    description: '거래처 코드 (단일 사업장 조회용)',
    required: false,
  })
  @OptionalString()
  customerCode: string;
}