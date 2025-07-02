import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryQnaDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  category: string = 'all';
}
