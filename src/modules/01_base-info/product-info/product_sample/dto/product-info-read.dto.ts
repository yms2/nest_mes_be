import { ApiProperty } from '@nestjs/swagger';
import { OptionalString } from 'src/common/decorators/optional-string.decorator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class SearchProductInfoDto extends BaseSearchDto {}
