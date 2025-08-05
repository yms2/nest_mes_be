import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ProductFileUploadDto {
  @ApiProperty({ example: 1, description: '품목 ID', required: true })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: '이미지 파일', description: '파일 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'image', description: '파일 타입', required: false })
  @IsOptional()
  @IsString()
  fileType?: string;
} 