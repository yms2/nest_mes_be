import { InjectRepository } from '@nestjs/typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ProductInfoUpdateService } from './product-info-update.service';

@Injectable()
export class ProductInfoDeleteService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    private readonly productInfoUpdateService: ProductInfoUpdateService,
  ) {}

  async hardDeleteProductInfo(id: number): Promise<void> {
    // ProductInfoUpdateService의 메서드 호출
    const existingProductInfo = await this.productInfoUpdateService.findProductInfoById(id);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.productInfoRepository.remove(existingProductInfo);
  }
}
