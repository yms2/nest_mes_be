import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';
export class ReadCustomerInfoDto extends BaseSearchDto {
  @ApiProperty({
    example: '6743001715',
    description: '사업자 번호 (단일 조회용)',
    required: false,
  })
  @OptionalString()
  customerNumber?: string;
}
