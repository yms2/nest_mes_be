import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentHistory } from '../entities/equipment-history.entity';
import { UpdateEquipmentHistoryDto } from '../dto/update-equipment-history.dto';

@Injectable()
export class EquipmentHistoryUpdateService {
  constructor(
    @InjectRepository(EquipmentHistory)
    private readonly equipmentHistoryRepository: Repository<EquipmentHistory>,
  ) {}

  /**
   * 설비 이력을 수정합니다.
   * @param id 설비 이력 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 설비 이력 정보
   */
  async updateEquipmentHistory(id: number, updateDto: UpdateEquipmentHistoryDto): Promise<EquipmentHistory> {
    try {
      // 설비 이력 존재 확인
      const existingHistory = await this.equipmentHistoryRepository.findOne({
        where: { id },
      });

      if (!existingHistory) {
        throw new NotFoundException(`ID ${id}에 해당하는 설비 이력을 찾을 수 없습니다.`);
      }

      // 수정할 데이터 준비
      const updateData: Partial<EquipmentHistory> = {};

      if (updateDto.equipmentCode !== undefined) {
        updateData.equipmentCode = updateDto.equipmentCode;
      }
      if (updateDto.equipmentName !== undefined) {
        updateData.equipmentName = updateDto.equipmentName;
      }
      if (updateDto.equipmentDate !== undefined) {
        updateData.equipmentDate = new Date(updateDto.equipmentDate);
      }
      if (updateDto.equipmentHistory !== undefined) {
        updateData.equipmentHistory = updateDto.equipmentHistory;
      }
      if (updateDto.equipmentRepair !== undefined) {
        updateData.equipmentRepair = updateDto.equipmentRepair;
      }
      if (updateDto.equipmentCost !== undefined) {
        updateData.equipmentCost = updateDto.equipmentCost;
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

      // 설비 이력 수정
      await this.equipmentHistoryRepository.update(id, updateData);

      // 수정된 설비 이력 조회
      const updatedHistory = await this.equipmentHistoryRepository.findOne({
        where: { id },
      });

      if (!updatedHistory) {
        throw new NotFoundException(`수정된 설비 이력을 찾을 수 없습니다.`);
      }

      return updatedHistory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('설비 이력 수정 중 오류가 발생했습니다.');
    }
  }

  /**
   * 설비 이력 코드로 설비 이력을 수정합니다.
   * @param equipmentHistoryCode 설비 이력 코드
   * @param updateDto 수정할 데이터
   * @returns 수정된 설비 이력 정보
   */
  async updateEquipmentHistoryByCode(
    equipmentHistoryCode: string,
    updateDto: UpdateEquipmentHistoryDto,
  ): Promise<EquipmentHistory> {
    try {
      // 설비 이력 존재 확인
      const existingHistory = await this.equipmentHistoryRepository.findOne({
        where: { equipmentHistoryCode },
      });

      if (!existingHistory) {
        throw new NotFoundException(`설비 이력 코드 ${equipmentHistoryCode}에 해당하는 설비 이력을 찾을 수 없습니다.`);
      }

      // 수정할 데이터 준비
      const updateData: Partial<EquipmentHistory> = {};

      if (updateDto.equipmentCode !== undefined) {
        updateData.equipmentCode = updateDto.equipmentCode;
      }
      if (updateDto.equipmentName !== undefined) {
        updateData.equipmentName = updateDto.equipmentName;
      }
      if (updateDto.equipmentDate !== undefined) {
        updateData.equipmentDate = new Date(updateDto.equipmentDate);
      }
      if (updateDto.equipmentHistory !== undefined) {
        updateData.equipmentHistory = updateDto.equipmentHistory;
      }
      if (updateDto.equipmentRepair !== undefined) {
        updateData.equipmentRepair = updateDto.equipmentRepair;
      }
      if (updateDto.equipmentCost !== undefined) {
        updateData.equipmentCost = updateDto.equipmentCost;
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

      // 설비 이력 수정
      await this.equipmentHistoryRepository.update(
        { equipmentHistoryCode },
        updateData,
      );

      // 수정된 설비 이력 조회
      const updatedHistory = await this.equipmentHistoryRepository.findOne({
        where: { equipmentHistoryCode },
      });

      if (!updatedHistory) {
        throw new NotFoundException(`수정된 설비 이력을 찾을 수 없습니다.`);
      }

      return updatedHistory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('설비 이력 수정 중 오류가 발생했습니다.');
    }
  }
}
