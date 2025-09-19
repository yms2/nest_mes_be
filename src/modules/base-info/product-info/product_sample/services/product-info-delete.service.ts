import { InjectRepository } from '@nestjs/typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { ProductFile } from '../entities/product-file.entity';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductInfoUpdateService } from './product-info-update.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductInfoDeleteService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    @InjectRepository(ProductFile)
    private readonly productFileRepository: Repository<ProductFile>,
    private readonly productInfoUpdateService: ProductInfoUpdateService,
  ) {}

  async hardDeleteProductInfo(id: number): Promise<void> {
    try {
      // 품목 정보 조회
      const existingProductInfo = await this.productInfoUpdateService.findProductInfoById(id);
      
      if (!existingProductInfo) {
        throw new NotFoundException('삭제할 품목을 찾을 수 없습니다.');
      }

      // 연결된 파일들 조회
      const productFiles = await this.productFileRepository.find({
        where: { productId: id }
      });

      // 연결된 파일들 삭제 (파일 시스템에서도 삭제)
      for (const file of productFiles) {
        try {
          // 서버에서 파일 삭제
          const fullPath = path.join(process.cwd(), 'uploads', 'products', file.filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
          
          // DB에서 파일 정보 삭제
          await this.productFileRepository.remove(file);
        } catch (fileError) {
          // 파일 삭제 실패해도 계속 진행
        }
      }

      // 품목 삭제
      await this.productInfoRepository.remove(existingProductInfo);

    } catch (error) {
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // 외래키 제약조건 오류인 경우
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message?.includes('foreign key constraint')) {
        throw new BadRequestException('이 품목은 다른 데이터에서 참조되고 있어 삭제할 수 없습니다. 먼저 관련 데이터를 삭제해주세요.');
      }
      
      // 기타 오류
      throw new BadRequestException(`품목 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}
