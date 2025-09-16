import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '../entities/bom-info.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class BomInfoDeleteService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
    private readonly logService: logService,
  ) {}

  /**
   * BOM 정보를 삭제합니다.
   * @param id BOM ID
   * @param username 사용자명
   */
  async deleteBom(id: number, username: string): Promise<void> {
    try {
      // 기존 BOM 정보 조회
      const bom = await this.bomRepository.findOne({ where: { id } });
      if (!bom) {
        throw new NotFoundException(`ID ${id}인 BOM을 찾을 수 없습니다.`);
      }

      // 삭제 가능 여부 검증
      await this.validateDeletion(id, bom);

      // BOM 삭제
      await this.bomRepository.remove(bom);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 삭제',
        action: 'DELETE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${bom.parentProductCode} → ${bom.childProductCode}`,
        details: `BOM 삭제 성공: ID ${id}`,
      });
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 삭제',
        action: 'DELETE_FAIL',
        username,
        targetId: id.toString(),
        targetName: '',
        details: `BOM 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * BOM 삭제 가능 여부를 검증합니다.
   * @param id BOM ID
   * @param bom BOM 정보
   */
  private async validateDeletion(id: number, bom: BomInfo): Promise<void> {
    // 하위 BOM이 있는지 확인 (현재 BOM의 하위품목이 다른 BOM의 상위품목인 경우)
    const hasChildBoms = await this.bomRepository.findOne({
      where: { parentProductCode: bom.childProductCode },
    });

    if (hasChildBoms) {
      throw new BadRequestException(
        `하위 BOM이 존재하여 삭제할 수 없습니다: ${bom.childProductCode}`,
      );
    }
  }

  /**
   * 여러 BOM을 일괄 삭제합니다.
   * @param ids 삭제할 BOM ID 배열
   * @param username 사용자명
   */
  async deleteMultipleBoms(ids: number[], username: string): Promise<void> {
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.deleteBom(id, username);
      } catch (error) {
        errors.push(`ID ${id}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(`일부 BOM 삭제에 실패했습니다:\n${errors.join('\n')}`);
    }
  }

  /**
   * 특정 상위품목의 모든 BOM을 삭제합니다.
   * @param parentProductCode 상위품목 코드
   * @param username 사용자명
   */
  async deleteBomsByParentProduct(parentProductCode: string, username: string): Promise<number> {
    try {
      // 해당 상위품목의 모든 BOM 조회
      const boms = await this.bomRepository.find({
        where: { parentProductCode },
      });

      if (boms.length === 0) {
        return 0;
      }

      // 각 BOM에 대해 삭제 검증
      for (const bom of boms) {
        await this.validateDeletion(bom.id, bom);
      }

      // 일괄 삭제
      await this.bomRepository.remove(boms);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 일괄 삭제',
        action: 'DELETE_SUCCESS',
        username,
        targetId: '',
        targetName: `${parentProductCode}`,
        details: `${parentProductCode} 상위품목의 ${boms.length}개 BOM 삭제 성공`,
      });

      return boms.length;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 일괄 삭제',
        action: 'DELETE_FAIL',
        username,
        targetId: '',
        targetName: `${parentProductCode}`,
        details: `${parentProductCode} 상위품목 BOM 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 특정 하위품목의 모든 BOM을 삭제합니다.
   * @param childProductCode 하위품목 코드
   * @param username 사용자명
   */
  async deleteBomsByChildProduct(childProductCode: string, username: string): Promise<number> {
    try {
      // 해당 하위품목의 모든 BOM 조회
      const boms = await this.bomRepository.find({
        where: { childProductCode },
      });

      if (boms.length === 0) {
        return 0;
      }

      // 각 BOM에 대해 삭제 검증
      for (const bom of boms) {
        await this.validateDeletion(bom.id, bom);
      }

      // 일괄 삭제
      await this.bomRepository.remove(boms);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 일괄 삭제',
        action: 'DELETE_SUCCESS',
        username,
        targetId: '',
        targetName: `${childProductCode}`,
        details: `${childProductCode} 하위품목의 ${boms.length}개 BOM 삭제 성공`,
      });

      return boms.length;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 일괄 삭제',
        action: 'DELETE_FAIL',
        username,
        targetId: '',
        targetName: `${childProductCode}`,
        details: `${childProductCode} 하위품목 BOM 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }
}
