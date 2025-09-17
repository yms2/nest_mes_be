import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionInstruction } from '../entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { UpdateProductionInstructionDto } from '../dto/update-production-instruction.dto';

@Injectable()
export class ProductionInstructionUpdateService {
  constructor(
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  /**
   * 생산 지시를 수정합니다.
   * @param id 생산 지시 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 생산 지시 정보
   */
  async updateProductionInstruction(
    id: number,
    updateDto: UpdateProductionInstructionDto,
  ): Promise<ProductionInstruction> {
    // 생산 지시 존재 확인
    const existingInstruction = await this.productionInstructionRepository.findOne({
      where: { id },
    });

    if (!existingInstruction) {
      throw new NotFoundException(`ID ${id}에 해당하는 생산 지시를 찾을 수 없습니다.`);
    }

    // 생산 지시 수량 검증 제거 - 사용자가 자유롭게 설정 가능

    // 수정할 필드만 업데이트
    const updateData: Partial<ProductionInstruction> = {};

    if (updateDto.productionInstructionQuantity !== undefined) {
      updateData.productionInstructionQuantity = updateDto.productionInstructionQuantity;
    }

    if (updateDto.productionStartDate !== undefined) {
      updateData.productionStartDate = updateDto.productionStartDate;
    }

    if (updateDto.productionCompletionDate !== undefined) {
      updateData.productionCompletionDate = updateDto.productionCompletionDate;
    }

    if (updateDto.employeeCode !== undefined) {
      updateData.employeeCode = updateDto.employeeCode;
    }

    if (updateDto.employeeName !== undefined) {
      updateData.employeeName = updateDto.employeeName;
    }

    if (updateDto.remark !== undefined) {
      updateData.remark = updateDto.remark;
    }

    // 업데이트 실행
    await this.productionInstructionRepository.update(id, updateData);

    // 수정된 데이터 반환
    const updatedInstruction = await this.productionInstructionRepository.findOne({
      where: { id },
    });

    return updatedInstruction!;
  }
}
