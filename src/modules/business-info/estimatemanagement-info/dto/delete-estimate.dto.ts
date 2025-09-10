import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteMultipleEstimatesDto {
  @ApiProperty({
    description: '삭제할 견적 ID 배열',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  ids: number[];
}

export class DeleteEstimateDetailsDto {
  @ApiProperty({
    description: '삭제할 세부품목 ID 배열',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  detailIds: number[];
}
