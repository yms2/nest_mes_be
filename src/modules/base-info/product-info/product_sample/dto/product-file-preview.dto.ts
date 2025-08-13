import { ApiProperty } from '@nestjs/swagger';

export class ProductFilePreviewDto {
  @ApiProperty({ example: 1, description: '파일 ID' })
  id: number;

  @ApiProperty({ example: 'product_image.jpg', description: '원본 파일명' })
  originalFilename: string;

  @ApiProperty({ example: 'image/jpeg', description: '파일 MIME 타입' })
  mimeType: string;

  @ApiProperty({ example: 1024000, description: '파일 크기 (bytes)' })
  fileSize: number;

  @ApiProperty({ example: '이미지', description: '파일 설명' })
  description?: string;

  @ApiProperty({ example: 'image', description: '파일 타입' })
  fileType: string;

  @ApiProperty({ example: '2024-01-01', description: '생성일' })
  createdAt: string;

  @ApiProperty({ example: 'http://localhost:3000/api/product-file/preview/1', description: '미리보기 URL' })
  previewUrl?: string;

  @ApiProperty({ example: 'http://localhost:3000/api/product-file/download/1', description: '다운로드 URL' })
  downloadUrl: string;

  @ApiProperty({ example: true, description: '이미지 파일 여부' })
  isImage: boolean;

  @ApiProperty({ example: 'jpg', description: '파일 확장자' })
  extension: string;
} 