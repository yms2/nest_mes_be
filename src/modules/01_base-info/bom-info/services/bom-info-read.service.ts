import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';
import { ProductInfo } from '../../product-info/product_sample/entities/product-info.entity';

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

    // 제품 목록을 Map으로 구성 (검색 성능 향상)
    const productMap = new Map<string, ProductInfo>();
    allProducts.forEach(product => {
      productMap.set(product.productCode, product);
    });

    // 재귀적으로 트리 구성 (순환 참조 방지)
    const buildTree = (parentCode: string, visited: Set<string>): any[] => {
      if (visited.has(parentCode)) {
        // 순환 참조 감지 → 해당 브랜치 중단

        return [];
      }

      visited.add(parentCode);

      return allBom
        .filter(b => b.parentProductCode === parentCode)
        .map(b => {
          const product = productMap.get(b.childProductCode);

          return {
            productCode: b.childProductCode,
            productName: product?.productName || null,
            quantity: b.quantity,
            unit: b.unit,
            children: buildTree(b.childProductCode, new Set(visited)), // 방문기록 복사
          };
        });
    };

    const rootProduct = productMap.get(rootProductCode);

    return {
      productCode: rootProductCode,
      productName: rootProduct?.productName || null,
      children: buildTree(rootProductCode, new Set()),
    };
  }
}
