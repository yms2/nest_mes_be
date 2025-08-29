import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../entities/equipment.entity';
import { DeleteEquipmentDto } from '../dto/delete-equipment.dto';

@Injectable()
export class EquipmentDeleteService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  /**
   * 장비를 삭제합니다.
   * @param equipmentCode 장비 코드
   * @param deleteEquipmentDto 삭제 정보
   * @returns 삭제된 장비 정보
   */
  async deleteEquipment(equipmentCode: string, deleteEquipmentDto?: DeleteEquipmentDto): Promise<{ message: string; deletedEquipment: Equipment }> {
    try {
      // 장비 존재 여부 확인
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { equipmentCode },
      });

      if (!existingEquipment) {
        throw new NotFoundException(`장비 코드 ${equipmentCode}를 찾을 수 없습니다.`);
      }

      // 삭제 전 검증 (필요시 추가 검증 로직)
      await this.validateDeleteOperation(equipmentCode);

      // 장비 삭제
      const deletedEquipment = await this.equipmentRepository.remove(existingEquipment);

      return {
        message: `장비 ${equipmentCode}가 성공적으로 삭제되었습니다.`,
        deletedEquipment,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 장비를 일괄 삭제합니다.
   * @param equipmentCodes 삭제할 장비 코드 배열
   * @param deleteEquipmentDto 삭제 정보
   * @returns 삭제 결과
   */
  async deleteMultipleEquipment(equipmentCodes: string[], deleteEquipmentDto?: DeleteEquipmentDto): Promise<{ message: string; deletedCount: number; failedCodes: string[] }> {
    try {
      const failedCodes: string[] = [];
      let deletedCount = 0;

      for (const equipmentCode of equipmentCodes) {
        try {
          await this.deleteEquipment(equipmentCode, deleteEquipmentDto);
          deletedCount++;
        } catch (error) {
          failedCodes.push(equipmentCode);
        }
      }

      const message = `총 ${equipmentCodes.length}개 중 ${deletedCount}개 장비가 삭제되었습니다.`;
      
      if (failedCodes.length > 0) {
        return {
          message: `${message} 실패: ${failedCodes.join(', ')}`,
          deletedCount,
          failedCodes,
        };
      }

      return {
        message,
        deletedCount,
        failedCodes: [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장비 삭제 전 검증을 수행합니다.
   * @param equipmentCode 장비 코드
   */
  private async validateDeleteOperation(equipmentCode: string): Promise<void> {
    // 여기에 삭제 전 검증 로직을 추가할 수 있습니다
    // 예: 다른 테이블에서 참조하고 있는지 확인
    // 예: 사용 중인 장비인지 확인
    
    // 현재는 기본 검증만 수행
    if (!equipmentCode || equipmentCode.trim() === '') {
      throw new BadRequestException('유효하지 않은 장비 코드입니다.');
    }
  }

  /**
   * 장비 삭제 가능 여부를 확인합니다.
   * @param equipmentCode 장비 코드
   * @returns 삭제 가능 여부와 이유
   */
  async checkDeleteAvailability(equipmentCode: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      // 장비 존재 여부 확인
      const existingEquipment = await this.equipmentRepository.findOne({
        where: { equipmentCode },
      });

      if (!existingEquipment) {
        return {
          canDelete: false,
          reason: '장비를 찾을 수 없습니다.',
        };
      }

      // 여기에 추가 검증 로직을 구현할 수 있습니다
      // 예: 다른 테이블에서 참조하고 있는지 확인
      // 예: 사용 중인 장비인지 확인

      return {
        canDelete: true,
        reason: '삭제 가능합니다.',
      };
    } catch (error) {
      return {
        canDelete: false,
        reason: '검증 중 오류가 발생했습니다.',
      };
    }
  }
}
