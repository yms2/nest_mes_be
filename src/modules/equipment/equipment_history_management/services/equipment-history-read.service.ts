import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EquipmentHistory } from '../entities/equipment-history.entity';
import { QueryEquipmentHistoryDto } from '../dto/query-equipment-history.dto';

@Injectable()
export class EquipmentHistoryReadService {
  constructor(
    @InjectRepository(EquipmentHistory)
    private readonly equipmentHistoryRepository: Repository<EquipmentHistory>,
  ) {}
  /**
   * 설비 코드로 이력을 조회하고 추가 검색 조건을 적용합니다.
   * @param equipmentCode 설비 코드
   * @param searchConditions 추가 검색 조건
   * @returns 설비 이력 목록
   */
  async getEquipmentHistoryByCodeWithSearch(
    equipmentCode: string,
    searchConditions: {
      equipmentName?: string;
      employeeName?: string;
      equipmentHistory?: string;
      equipmentRepair?: string;
    }
  ): Promise<EquipmentHistory[]> {
    if (!equipmentCode || equipmentCode.trim() === '') {
      throw new BadRequestException('설비 코드를 입력해주세요.');
    }

    const whereConditions: any = {
      equipmentCode: equipmentCode.trim(),
    };

    // 추가 검색 조건 적용
    if (searchConditions.equipmentName) {
      whereConditions.equipmentName = Like(`%${searchConditions.equipmentName}%`);
    }

    if (searchConditions.employeeName) {
      whereConditions.employeeName = Like(`%${searchConditions.employeeName}%`);
    }

    if (searchConditions.equipmentHistory) {
      whereConditions.equipmentHistory = Like(`%${searchConditions.equipmentHistory}%`);
    }

    if (searchConditions.equipmentRepair) {
      whereConditions.equipmentRepair = Like(`%${searchConditions.equipmentRepair}%`);
    }

    const equipmentHistories = await this.equipmentHistoryRepository.find({
      where: whereConditions,
      order: { equipmentDate: 'DESC' },
    });

    return equipmentHistories;
  }


}
