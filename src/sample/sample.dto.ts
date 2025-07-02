import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QuerySampleDto {
  @Type(() => Number)
  @IsNumber()
  page: number;

  @Type(() => Number)
  @IsNumber()
  limit: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isCounseled: boolean;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  category: string;
}
