import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class PaginationDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit: number = 10;
}