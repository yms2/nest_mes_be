// bom-copy.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../../entities/bom-info.entity';

@Injectable()
export class BomCopyService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
  ) {}

  async copyBom(
    sourceProductCode: string,
    targetProductCode: string,
  ): Promise<{ message: string; copiedCount: number; existingCount: number }> {
    // 소스 BOM 조회
    const sourceBoms = await this.bomRepository.find({
      where: { parentProductCode: sourceProductCode },
    });

    if (sourceBoms.length === 0) {
      throw new Error(`소스 품목 [${sourceProductCode}]에 대한 BOM이 없습니다.`);
    }

    // 타겟 BOM 조회
    const existingTargetBoms = await this.bomRepository.find({
      where: { parentProductCode: targetProductCode },
    });

    // 중복되지 않는 BOM만 추가
    const existingChildCodes = new Set(
      existingTargetBoms.map(bom => bom.childProductCode)
    );

    const newBoms = sourceBoms
      .filter(bom => !existingChildCodes.has(bom.childProductCode))
      .map(bom =>
        this.bomRepository.create({
          parentProductCode: targetProductCode,
          childProductCode: bom.childProductCode,
          quantity: bom.quantity,
          unit: bom.unit,
          level: bom.level,
        }),
      );

    let copiedCount = 0;
    let existingCount = 0;

    if (newBoms.length > 0) {
      await this.bomRepository.save(newBoms);
      copiedCount = newBoms.length;
    }

    existingCount = sourceBoms.length - newBoms.length;

    return { 
      message: `BOM 복사 완료 (소스: ${sourceProductCode}, 타겟: ${targetProductCode}, 복사: ${copiedCount}건, 중복제외: ${existingCount}건)`,
      copiedCount,
      existingCount
    };
  }
}
