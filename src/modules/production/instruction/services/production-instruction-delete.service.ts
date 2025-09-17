import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionInstruction } from '../entities/production-instruction.entity';

@Injectable()
export class ProductionInstructionDeleteService {
  constructor(
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
  ) {}

  /**
   * 생산 지시를 삭제합니다.
   * @param id 생산 지시 ID
   * @returns 삭제된 생산 지시 정보
   */
  async deleteProductionInstruction(id: number): Promise<ProductionInstruction> {
    // 생산 지시 존재 확인
    const existingInstruction = await this.productionInstructionRepository.findOne({
      where: { id },
    });

    if (!existingInstruction) {
      throw new NotFoundException(`ID ${id}에 해당하는 생산 지시를 찾을 수 없습니다.`);
    }

    // 삭제 실행
    await this.productionInstructionRepository.delete(id);

    return existingInstruction;
  }

  /**
   * 여러 생산 지시를 일괄 삭제합니다.
   * @param ids 삭제할 생산 지시 ID 배열
   * @returns 삭제 결과 정보
   */
  async deleteProductionInstructions(ids: number[]): Promise<{
    deletedCount: number;
    notFoundIds: number[];
    deletedInstructions: ProductionInstruction[];
  }> {
    const deletedInstructions: ProductionInstruction[] = [];
    const notFoundIds: number[] = [];

    for (const id of ids) {
      try {
        const deletedInstruction = await this.deleteProductionInstruction(id);
        deletedInstructions.push(deletedInstruction);
      } catch (error) {
        if (error instanceof NotFoundException) {
          notFoundIds.push(id);
        } else {
          throw error;
        }
      }
    }

    return {
      deletedCount: deletedInstructions.length,
      notFoundIds,
      deletedInstructions,
    };
  }
}
