import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentHistory } from '../entities/equipment-history.entity';
import { CreateEquipmentHistoryDto } from '../dto/create-equipment-history.dto';

@Injectable()
export class EquipmentHistoryCreateService {
  constructor(
    @InjectRepository(EquipmentHistory)
    private readonly equipmentHistoryRepository: Repository<EquipmentHistory>,
  ) {}

  /**
   * 설비 이력을 등록합니다.
   * @param createEquipmentHistoryDto 설비 이력 생성 데이터
   * @returns 생성된 설비 이력 정보
   */
  async createEquipmentHistory(createEquipmentHistoryDto: CreateEquipmentHistoryDto): Promise<EquipmentHistory> {
    try {
      // 설비 이력 코드 자동 생성
      const equipmentHistoryCode = await this.generateEquipmentHistoryCode();

      // 설비 이력 생성
      const equipmentHistory = this.equipmentHistoryRepository.create({
        ...createEquipmentHistoryDto,
        equipmentHistoryCode,
        equipmentDate: new Date(createEquipmentHistoryDto.equipmentDate),
      });

      const savedEquipmentHistory = await this.equipmentHistoryRepository.save(equipmentHistory);
      return savedEquipmentHistory;
    } catch (error) {
      throw new BadRequestException('설비 이력 등록 중 오류가 발생했습니다.');
    }
  }

  /**
   * 설비 이력 코드를 자동으로 생성합니다.
   * @returns 생성된 설비 이력 코드
   */
  private async generateEquipmentHistoryCode(): Promise<string> {
    const lastHistory = await this.equipmentHistoryRepository.findOne({
      where: {},
      order: { equipmentHistoryCode: 'DESC' },
    });

    if (!lastHistory || !lastHistory.equipmentHistoryCode) {
      return 'EH001';
    }

    const lastNumber = parseInt(lastHistory.equipmentHistoryCode.substring(2));
    const nextNumber = lastNumber + 1;
    return `EH${nextNumber.toString().padStart(3, '0')}`;
  }
}
