import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomProcess } from '../entities/bom-process.entity';

@Injectable()
export class BomProcessReadService {
  constructor(
    @InjectRepository(BomProcess)
    private readonly bomProcessRepository: Repository<BomProcess>,
  ) {}

  /**
   * 제품 코드로 BOM 공정을 조회합니다.
   * @param productCode 제품 코드
   * @returns 해당 제품의 BOM 공정 목록
   */
  async getBomProcessesByProductCode(productCode: string): Promise<BomProcess[]> {
    const bomProcesses = await this.bomProcessRepository.find({
      where: { productCode },
      order: {
        processOrder: 'ASC',
      },
    });

    if (bomProcesses.length === 0) {
      throw new NotFoundException(`제품 코드 ${productCode}의 BOM 공정을 찾을 수 없습니다.`);
    }

    return bomProcesses;
  }

}
