import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentHistory } from '../entities/equipment-history.entity';

@Injectable()
export class EquipmentHistoryDeleteService {
  constructor(
    @InjectRepository(EquipmentHistory)
    private readonly equipmentHistoryRepository: Repository<EquipmentHistory>,
  ) {}

  /**
   * 설비 이력을 삭제합니다.
   * @param id 설비 이력 ID
   * @returns 삭제 성공 여부
   */
  async deleteEquipmentHistory(id: number): Promise<{ message: string }> {
    try {
      // 설비 이력 존재 확인
      const existingHistory = await this.equipmentHistoryRepository.findOne({
        where: { id },
      });

      if (!existingHistory) {
        throw new NotFoundException(`ID ${id}에 해당하는 설비 이력을 찾을 수 없습니다.`);
      }

      // 설비 이력 삭제
      await this.equipmentHistoryRepository.delete(id);

      return { message: '설비 이력이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('설비 이력 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 설비 이력 코드로 설비 이력을 삭제합니다.
   * @param equipmentHistoryCode 설비 이력 코드
   * @returns 삭제 성공 여부
   */
  async deleteEquipmentHistoryByCode(equipmentHistoryCode: string): Promise<{ message: string }> {
    try {
      // 설비 이력 존재 확인
      const existingHistory = await this.equipmentHistoryRepository.findOne({
        where: { equipmentHistoryCode },
      });

      if (!existingHistory) {
        throw new NotFoundException(`설비 이력 코드 ${equipmentHistoryCode}에 해당하는 설비 이력을 찾을 수 없습니다.`);
      }

      // 설비 이력 삭제
      await this.equipmentHistoryRepository.delete({ equipmentHistoryCode });

      return { message: '설비 이력이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('설비 이력 삭제 중 오류가 발생했습니다.');
    }
  }

  /**
   * 설비 코드로 해당 설비의 모든 이력을 삭제합니다.
   * @param equipmentCode 설비 코드
   * @returns 삭제된 이력 개수
   */
  async deleteEquipmentHistoryByEquipmentCode(equipmentCode: string): Promise<{ message: string; deletedCount: number }> {
    try {
      if (!equipmentCode || equipmentCode.trim() === '') {
        throw new BadRequestException('설비 코드를 입력해주세요.');
      }

      // 해당 설비의 이력 개수 확인
      const existingHistories = await this.equipmentHistoryRepository.find({
        where: { equipmentCode: equipmentCode.trim() },
      });

      if (!existingHistories || existingHistories.length === 0) {
        throw new NotFoundException(`설비 코드 ${equipmentCode}에 해당하는 설비 이력을 찾을 수 없습니다.`);
      }

      // 설비 이력 삭제
      const deleteResult = await this.equipmentHistoryRepository.delete({
        equipmentCode: equipmentCode.trim(),
      });

      return {
        message: `설비 코드 ${equipmentCode}의 모든 이력이 성공적으로 삭제되었습니다.`,
        deletedCount: deleteResult.affected || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('설비 이력 삭제 중 오류가 발생했습니다.');
    }
  }
}
