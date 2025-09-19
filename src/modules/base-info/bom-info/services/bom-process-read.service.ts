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

    // 데이터가 없어도 404 오류를 발생시키지 않고 빈 배열 반환
    return bomProcesses;
  }

}
