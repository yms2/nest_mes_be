import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class SearchEmployeeDto extends BaseSearchDto {
  @ApiProperty({
    example: 'EMP001',
    description: '직원 코드 (단일 조회용)',
    required: false,
  })
  @OptionalString()
  employeeCode?: string;
}
