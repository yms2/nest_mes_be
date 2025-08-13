import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductInfo } from './product-info.entity';

@Entity()
export class ProductFile extends BaseEntity {
  @ApiProperty({ example: 1, description: '파일 고유 ID' })
  @Column({ name: 'product_id', type: 'int', comment: '품목 ID' })
  productId: number;

  @ApiProperty({ example: 'product_image.jpg', description: '원본 파일명' })
  @Column({ name: 'original_filename', type: 'varchar', length: 255, comment: '원본 파일명' })
  originalFilename: string;

  @ApiProperty({ example: 'uploads/products/2024/01/product_123_image.jpg', description: '저장된 파일 경로' })
  @Column({ name: 'file_path', type: 'varchar', length: 500, comment: '저장된 파일 경로' })
  filePath: string;

  @ApiProperty({ example: 'image/jpeg', description: '파일 MIME 타입' })
  @Column({ name: 'mime_type', type: 'varchar', length: 100, comment: '파일 MIME 타입' })
  mimeType: string;

  @ApiProperty({ example: 1024000, description: '파일 크기 (bytes)' })
  @Column({ name: 'file_size', type: 'int', comment: '파일 크기 (bytes)' })
  fileSize: number;

  @ApiProperty({ example: '이미지', description: '파일 설명' })
  @Column({ name: 'description', type: 'varchar', length: 200, comment: '파일 설명', nullable: true })
  description: string;

  @ApiProperty({ example: 'image', description: '파일 타입 (image, document, etc)' })
  @Column({ name: 'file_type', type: 'varchar', length: 50, comment: '파일 타입', default: 'document' })
  fileType: string;

  // 관계 설정
  @ManyToOne(() => ProductInfo, product => product.files)
  @JoinColumn({ name: 'product_id' })
  product: ProductInfo;
} 