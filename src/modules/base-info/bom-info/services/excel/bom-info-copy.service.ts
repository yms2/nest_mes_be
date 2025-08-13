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
  ): Promise<{ message: string }> {
    // 소스 BOM 조회
    const sourceBoms = await this.bomRepository.find({
      where: { parentProductCode: sourceProductCode },
    });

    if (sourceBoms.length === 0) {
      throw new Error(`소스 품목 [${sourceProductCode}]에 대한 BOM이 없습니다.`);
    }

    // 타겟 BOM 생성
    const newBoms = sourceBoms.map(bom =>
      this.bomRepository.create({
        parentProductCode: targetProductCode,
        childProductCode: bom.childProductCode,
        quantity: bom.quantity,
        unit: bom.unit,
      }),
    );

    await this.bomRepository.save(newBoms);

    return { message: `BOM 복사 완료 (소스: ${sourceProductCode}, 타겟: ${targetProductCode})` };
  }
}
