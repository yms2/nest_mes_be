import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomProcess } from '../entities/bom-process.entity';
import { CreateBomProcessDto, CreateMultipleBomProcessDto, BomProcessItemDto } from '../dto/create-bom-process.dto';

@Injectable()
export class BomProcessCreateService {
  constructor(
    @InjectRepository(BomProcess)
    private readonly bomProcessRepository: Repository<BomProcess>,
  ) {}

  /**
   * 단일 BOM 공정을 등록합니다.
   * @param createBomProcessDto BOM 공정 생성 정보
   * @returns 생성된 BOM 공정 정보
   */
  async createBomProcess(createBomProcessDto: CreateBomProcessDto): Promise<{ message: string; bomProcess: BomProcess }> {
    try {
      const { bomProcess } = createBomProcessDto;

      // 데이터 검증
      await this.validateBomProcessData(bomProcess);

      // 중복 확인
      await this.checkDuplicateBomProcess(bomProcess.productCode, bomProcess.processCode);

      // 공정 순서 중복 확인
      await this.checkDuplicateProcessOrder(bomProcess.productCode, bomProcess.processOrder);

      // BOM 공정 생성
      const newBomProcess = this.bomProcessRepository.create({
        productCode: bomProcess.productCode,
        processOrder: bomProcess.processOrder,
        processCode: bomProcess.processCode,
        processName: bomProcess.processName,
      });

      const savedBomProcess = await this.bomProcessRepository.save(newBomProcess);

      return {
        message: `제품 ${bomProcess.productCode}의 공정 ${bomProcess.processName}(${bomProcess.processCode})이 순서 ${bomProcess.processOrder}로 성공적으로 등록되었습니다.`,
        bomProcess: savedBomProcess,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 BOM 공정을 일괄 등록합니다.
   * @param createMultipleBomProcessDto BOM 공정 일괄 생성 정보
   * @returns 생성 결과
   */
  async createMultipleBomProcess(createMultipleBomProcessDto: CreateMultipleBomProcessDto): Promise<{ message: string; createdCount: number; failedItems: BomProcessItemDto[] }> {
    try {
      const { bomProcesses } = createMultipleBomProcessDto;
      const failedItems: BomProcessItemDto[] = [];
      let createdCount = 0;

      // 공정 순서 정렬 (오름차순)
      const sortedBomProcesses = [...bomProcesses].sort((a, b) => a.processOrder - b.processOrder);

      for (const bomProcess of sortedBomProcesses) {
        try {
          // 데이터 검증
          await this.validateBomProcessData(bomProcess);

          // 중복 확인
          await this.checkDuplicateBomProcess(bomProcess.productCode, bomProcess.processCode);

          // 공정 순서 중복 확인
          await this.checkDuplicateProcessOrder(bomProcess.productCode, bomProcess.processOrder);

          // BOM 공정 생성
          const newBomProcess = this.bomProcessRepository.create({
            productCode: bomProcess.productCode,
            processOrder: bomProcess.processOrder,
            processCode: bomProcess.processCode,
            processName: bomProcess.processName,
          });

          await this.bomProcessRepository.save(newBomProcess);
          createdCount++;
        } catch (error) {
          failedItems.push(bomProcess);
        }
      }

      const message = `총 ${bomProcesses.length}개 중 ${createdCount}개 BOM 공정이 등록되었습니다.`;
      
      if (failedItems.length > 0) {
        return {
          message: `${message} 실패: ${failedItems.length}개`,
          createdCount,
          failedItems,
        };
      }

      return {
        message,
        createdCount,
        failedItems: [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * BOM 공정 데이터를 검증합니다.
   * @param bomProcess BOM 공정 정보
   */
  private async validateBomProcessData(bomProcess: BomProcessItemDto): Promise<void> {
    if (!bomProcess.productCode || bomProcess.productCode.trim() === '') {
      throw new BadRequestException('제품 코드는 필수입니다.');
    }

    if (!bomProcess.processCode || bomProcess.processCode.trim() === '') {
      throw new BadRequestException('공정 코드는 필수입니다.');
    }

    if (!bomProcess.processName || bomProcess.processName.trim() === '') {
      throw new BadRequestException('공정명은 필수입니다.');
    }

    if (bomProcess.processOrder < 1) {
      throw new BadRequestException('공정 순서는 1 이상이어야 합니다.');
    }

    // 제품 코드 형식 검증
    if (bomProcess.productCode.length > 20) {
      throw new BadRequestException('제품 코드는 20자를 초과할 수 없습니다.');
    }

    // 공정 코드 형식 검증
    if (bomProcess.processCode.length > 20) {
      throw new BadRequestException('공정 코드는 20자를 초과할 수 없습니다.');
    }

    // 공정명 형식 검증
    if (bomProcess.processName.length > 20) {
      throw new BadRequestException('공정명은 20자를 초과할 수 없습니다.');
    }
  }

  /**
   * 중복된 BOM 공정이 있는지 확인합니다.
   * @param productCode 제품 코드
   * @param processCode 공정 코드
   */
  private async checkDuplicateBomProcess(productCode: string, processCode: string): Promise<void> {
    const existingBomProcess = await this.bomProcessRepository.findOne({
      where: {
        productCode,
        processCode,
      },
    });

    if (existingBomProcess) {
      throw new ConflictException(`제품 ${productCode}에 공정 ${processCode}는 이미 등록되어 있습니다.`);
    }
  }

  /**
   * 같은 제품 내에서 공정 순서가 중복되는지 확인합니다.
   * @param productCode 제품 코드
   * @param processOrder 공정 순서
   */
  private async checkDuplicateProcessOrder(productCode: string, processOrder: number): Promise<void> {
    const existingBomProcess = await this.bomProcessRepository.findOne({
      where: {
        productCode,
        processOrder,
      },
    });

    if (existingBomProcess) {
      throw new ConflictException(`제품 ${productCode}의 공정 순서 ${processOrder}는 이미 사용 중입니다.`);
    }
  }

  /**
   * 특정 제품에 등록된 공정 수를 확인합니다.
   * @param productCode 제품 코드
   * @returns 등록된 공정 수
   */
  async getProcessCountByProduct(productCode: string): Promise<number> {
    return this.bomProcessRepository.count({
      where: { productCode },
    });
  }

  /**
   * 특정 제품의 공정 순서를 자동으로 조정합니다.
   * @param productCode 제품 코드
   * @returns 조정된 공정 순서
   */
  async autoAdjustProcessOrder(productCode: string): Promise<{ message: string; adjustedCount: number }> {
    try {
      // 해당 제품의 모든 공정을 순서대로 조회
      const bomProcesses = await this.bomProcessRepository.find({
        where: { productCode },
        order: { processOrder: 'ASC' },
      });

      if (bomProcesses.length === 0) {
        return {
          message: `제품 ${productCode}에 등록된 공정이 없습니다.`,
          adjustedCount: 0,
        };
      }

      // 공정 순서를 1부터 순차적으로 재설정
      let adjustedCount = 0;
      for (let i = 0; i < bomProcesses.length; i++) {
        const expectedOrder = i + 1;
        if (bomProcesses[i].processOrder !== expectedOrder) {
          bomProcesses[i].processOrder = expectedOrder;
          await this.bomProcessRepository.save(bomProcesses[i]);
          adjustedCount++;
        }
      }

      if (adjustedCount > 0) {
        return {
          message: `제품 ${productCode}의 공정 순서가 ${adjustedCount}개 조정되었습니다.`,
          adjustedCount,
        };
      } else {
        return {
          message: `제품 ${productCode}의 공정 순서는 이미 올바르게 설정되어 있습니다.`,
          adjustedCount: 0,
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
