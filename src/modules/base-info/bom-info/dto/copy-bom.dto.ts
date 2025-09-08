import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CopyBomDto {
  @ApiProperty({
    example: 'PRD001',
    description: '복사할 품목코드',
    required: true,
  })
  @IsString()
  sourceProductCode: string;

  @ApiProperty({
    example: 'PRD014',
    description: '복사받을 품목코드',
    required: true,
  })
  @IsString()
  targetProductCode: string;
}
