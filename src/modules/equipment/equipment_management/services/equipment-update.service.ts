import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';

@Injectable()
export class EquipmentUpdateService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  /**
   * 장비 정보를 수정합니다.
   * @param equipmentCode 장비 코드
   * @param updateEquipmentDto 수정할 장비 데이터
   * @returns 수정된 장비 정보
   */
  async updateEquipment(equipmentCode: string, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment> {
    try {
      // 장비 존재 여부 확인
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { equipmentCode },
      });

      if (!existingEquipment) {
        throw new NotFoundException(`장비 코드 ${equipmentCode}를 찾을 수 없습니다.`);
      }

      // 입력 데이터 검증
      await this.validateUpdateData(updateEquipmentDto);

      // 장비 정보 업데이트
      const updatedEquipment = await this.equipmentRepository.save({
        ...existingEquipment,
        ...updateEquipmentDto,
        // 구매일이 제공된 경우 Date 객체로 변환
        ...(updateEquipmentDto.equipmentPurchaseDate && {
          equipmentPurchaseDate: new Date(updateEquipmentDto.equipmentPurchaseDate),
        }),
      });

      return updatedEquipment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장비 코드를 수정합니다.
   * @param oldEquipmentCode 기존 장비 코드
   * @param newEquipmentCode 새로운 장비 코드
   * @returns 수정된 장비 정보
   */
  async updateEquipmentCode(oldEquipmentCode: string, newEquipmentCode: string): Promise<Equipment> {
    try {
      // 기존 장비 존재 여부 확인
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { equipmentCode: oldEquipmentCode },
      });

      if (!existingEquipment) {
        throw new NotFoundException(`장비 코드 ${oldEquipmentCode}를 찾을 수 없습니다.`);
      }

      // 새 장비 코드 형식 검증
      const codePattern = /^EQ\d{3}$/;
      if (!codePattern.test(newEquipmentCode)) {
        throw new BadRequestException('장비 코드는 EQ로 시작하고 3자리 숫자로 구성되어야 합니다. (예: EQ001)');
      }

      // 새 장비 코드 중복 확인
      const duplicateEquipment = await this.equipmentRepository.findOne({
        where: { equipmentCode: newEquipmentCode },
      });

      if (duplicateEquipment) {
        throw new BadRequestException(`이미 존재하는 장비 코드입니다: ${newEquipmentCode}`);
      }

      // 장비 코드 업데이트
      existingEquipment.equipmentCode = newEquipmentCode;
      const updatedEquipment = await this.equipmentRepository.save(existingEquipment);

      return updatedEquipment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 수정 데이터의 유효성을 검증합니다.
   * @param updateEquipmentDto 수정할 장비 데이터
   */
  private async validateUpdateData(updateEquipmentDto: UpdateEquipmentDto): Promise<void> {
    const { equipmentPurchasePrice, equipmentPurchaseDate } = updateEquipmentDto;

    // 구매가격 검증
    if (equipmentPurchasePrice !== undefined && equipmentPurchasePrice < 0) {
      throw new BadRequestException('구매가격은 0 이상이어야 합니다.');
    }

    // 구매일 검증
    if (equipmentPurchaseDate) {
      const purchaseDate = new Date(equipmentPurchaseDate);
      if (isNaN(purchaseDate.getTime())) {
        throw new BadRequestException('유효한 구매일을 입력해주세요.');
      }

      // 미래 날짜 검증
      const today = new Date();
      if (purchaseDate > today) {
        throw new BadRequestException('구매일은 오늘 이전이어야 합니다.');
      }
    }
  }
}
