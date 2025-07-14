import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';
import { ProductInfo } from '../../product-info/entities/product-info.entity';

@Injectable()
export class BomInfoService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
  ) {}

  async getBomTree(rootProductCode: string): Promise<any> {
    const allBom = await this.bomRepository.find();
    const allProducts = await this.productRepository.find();

    // 제품 목록을 Map으로 캐싱
    const productMap = new Map<string, ProductInfo>();
    allProducts.forEach(p => productMap.set(p.productCode, p));

    // 재귀적으로 트리 구성
    const buildTree = (parentCode: string): any[] => {
      return allBom
        .filter(b => b.parentProductCode === parentCode)
        .map(b => {
          const product = productMap.get(b.childProductCode);

          return {
            productCode: b.childProductCode,
            productName: product?.productName || null,
            quantity: b.quantity,
            unit: b.unit,
            children: buildTree(b.childProductCode),
          };
        });
    };

    const rootProduct = productMap.get(rootProductCode);

    return {
      productCode: rootProductCode,
      productName: rootProduct?.productName || null,
      children: buildTree(rootProductCode),
    };
  }
}
