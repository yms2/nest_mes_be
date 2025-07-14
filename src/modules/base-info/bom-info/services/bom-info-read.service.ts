import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';

@Injectable()
export class BomInfoService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
  ) {}

  async getBomTree(rootProductCode: string): Promise<any> {
    const allBom = await this.bomRepository.find();

    // 트리 구조로 변환
    const buildTree = (parentCode: string): any => {
      const children = allBom
        .filter(b => b.parentProductCode === parentCode)
        .map(b => ({
          productCode: b.childProductCode,
          quantity: b.quantity,
          unit: b.unit,
          children: buildTree(b.childProductCode),
        }));

      return children;
    };

    return {
      productCode: rootProductCode,
      children: buildTree(rootProductCode),
    };
  }
}
