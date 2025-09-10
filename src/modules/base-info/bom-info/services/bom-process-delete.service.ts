import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomProcess } from '../entities/bom-process.entity';
import { DeleteBomProcessDto } from '../dto/delete-bom-process.dto';

@Injectable()
export class BomProcessDeleteService {
  constructor(
    @InjectRepository(BomProcess)
    private readonly bomProcessRepository: Repository<BomProcess>,
  ) {}

  /**
   * ID로 BOM 공정을 삭제합니다.
   * @param id BOM 공정 ID
   * @param deleteBomProcessDto 삭제 정보
   * @returns 삭제된 BOM 공정 정보
   */
  async deleteBomProcessById(id: number, deleteBomProcessDto?: DeleteBomProcessDto): Promise<{ message: string; deletedBomProcess: BomProcess }> {
    try {
      // BOM 공정 존재 여부 확인
      const existingBomProcess = await this.bomProcessRepository.findOne({
        where: { id },
      });

      if (!existingBomProcess) {
        throw new NotFoundException(`ID ${id}인 BOM 공정을 찾을 수 없습니다.`);
      }

      // 삭제 전 검증
      await this.validateDeleteOperation(id);

      // BOM 공정 삭제
      const deletedBomProcess = await this.bomProcessRepository.remove(existingBomProcess);

      return {
        message: `BOM 공정 ID ${id}가 성공적으로 삭제되었습니다.`,
        deletedBomProcess,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * BOM 공정 삭제 전 검증을 수행합니다.
   * @param id BOM 공정 ID
   */
  private async validateDeleteOperation(id: number): Promise<void> {
    // 기본 검증
    if (!id || id <= 0) {
      throw new BadRequestException('유효하지 않은 BOM 공정 ID입니다.');
    }
  }
}
