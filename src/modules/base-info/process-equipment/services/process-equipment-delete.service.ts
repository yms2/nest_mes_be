import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { DeleteProcessEquipmentDto } from '../dto/delete-process-equipment.dto';

@Injectable()
export class ProcessEquipmentDeleteService {
  constructor(
    @InjectRepository(ProcessEquipment)
    private readonly processEquipmentRepository: Repository<ProcessEquipment>,
  ) {}

  /**
   * ID로 공정 설비를 삭제합니다.
   * @param id 공정 설비 ID
   * @param deleteProcessEquipmentDto 삭제 정보
   * @returns 삭제된 공정 설비 정보
   */
  async deleteProcessEquipmentById(id: number, deleteProcessEquipmentDto?: DeleteProcessEquipmentDto): Promise<{ message: string; deletedProcessEquipment: ProcessEquipment }> {
    try {
      // 공정 설비 존재 여부 확인
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (!existingProcessEquipment) {
        throw new NotFoundException(`ID ${id}인 공정 설비를 찾을 수 없습니다.`);
      }

      // 삭제 전 검증
      await this.validateDeleteOperation(id);

      // 공정 설비 삭제
      const deletedProcessEquipment = await this.processEquipmentRepository.remove(existingProcessEquipment);

      return {
        message: `공정 설비 ID ${id}가 성공적으로 삭제되었습니다.`,
        deletedProcessEquipment,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 공정 코드와 설비 코드로 공정 설비를 삭제합니다.
   * @param processCode 공정 코드
   * @param equipmentCode 설비 코드
   * @param deleteProcessEquipmentDto 삭제 정보
   * @returns 삭제된 공정 설비 정보
   */
  async deleteProcessEquipmentByCode(processCode: string, equipmentCode: string, deleteProcessEquipmentDto?: DeleteProcessEquipmentDto): Promise<{ message: string; deletedProcessEquipment: ProcessEquipment }> {
    try {
      // 공정 설비 존재 여부 확인
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: {
          processCode,
          equipmentCode,
        },
      });

      if (!existingProcessEquipment) {
        throw new NotFoundException(`공정 ${processCode}에 설비 ${equipmentCode}는 등록되어 있지 않습니다.`);
      }

      // 삭제 전 검증
      await this.validateDeleteOperation(existingProcessEquipment.id);

      // 공정 설비 삭제
      const deletedProcessEquipment = await this.processEquipmentRepository.remove(existingProcessEquipment);

      return {
        message: `공정 ${processCode}의 설비 ${equipmentCode}가 성공적으로 삭제되었습니다.`,
        deletedProcessEquipment,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 공정 설비를 일괄 삭제합니다.
   * @param ids 삭제할 공정 설비 ID 배열
   * @param deleteProcessEquipmentDto 삭제 정보
   * @returns 삭제 결과
   */
  async deleteMultipleProcessEquipmentByIds(ids: number[], deleteProcessEquipmentDto?: DeleteProcessEquipmentDto): Promise<{ message: string; deletedCount: number; failedIds: number[] }> {
    try {
      const failedIds: number[] = [];
      let deletedCount = 0;

      for (const id of ids) {
        try {
          await this.deleteProcessEquipmentById(id, deleteProcessEquipmentDto);
          deletedCount++;
        } catch (error) {
          failedIds.push(id);
        }
      }

      const message = `총 ${ids.length}개 중 ${deletedCount}개 공정 설비가 삭제되었습니다.`;
      
      if (failedIds.length > 0) {
        return {
          message: `${message} 실패: ${failedIds.length}개`,
          deletedCount,
          failedIds,
        };
      }

      return {
        message,
        deletedCount,
        failedIds: [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 공정 코드로 해당 공정의 모든 설비를 삭제합니다.
   * @param processCode 공정 코드
   * @param deleteProcessEquipmentDto 삭제 정보
   * @returns 삭제 결과
   */
  async deleteAllEquipmentByProcess(processCode: string, deleteProcessEquipmentDto?: DeleteProcessEquipmentDto): Promise<{ message: string; deletedCount: number }> {
    try {
      // 해당 공정의 모든 설비 조회
      const processEquipments = await this.processEquipmentRepository.find({
        where: { processCode },
      });

      if (processEquipments.length === 0) {
        return {
          message: `공정 ${processCode}에 등록된 설비가 없습니다.`,
          deletedCount: 0,
        };
      }

      // 모든 설비 삭제
      await this.processEquipmentRepository.remove(processEquipments);

      return {
        message: `공정 ${processCode}의 모든 설비 ${processEquipments.length}개가 성공적으로 삭제되었습니다.`,
        deletedCount: processEquipments.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 설비 코드로 해당 설비가 등록된 모든 공정을 삭제합니다.
   * @param equipmentCode 설비 코드
   * @param deleteProcessEquipmentDto 삭제 정보
   * @returns 삭제 결과
   */
  async deleteAllProcessByEquipment(equipmentCode: string, deleteProcessEquipmentDto?: DeleteProcessEquipmentDto): Promise<{ message: string; deletedCount: number }> {
    try {
      // 해당 설비가 등록된 모든 공정 조회
      const processEquipments = await this.processEquipmentRepository.find({
        where: { equipmentCode },
      });

      if (processEquipments.length === 0) {
        return {
          message: `설비 ${equipmentCode}가 등록된 공정이 없습니다.`,
          deletedCount: 0,
        };
      }

      // 모든 공정 삭제
      await this.processEquipmentRepository.remove(processEquipments);

      return {
        message: `설비 ${equipmentCode}가 등록된 모든 공정 ${processEquipments.length}개가 성공적으로 삭제되었습니다.`,
        deletedCount: processEquipments.length,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 공정 설비 삭제 전 검증을 수행합니다.
   * @param id 공정 설비 ID
   */
  private async validateDeleteOperation(id: number): Promise<void> {
    // 여기에 삭제 전 검증 로직을 추가할 수 있습니다
    // 예: 다른 테이블에서 참조하고 있는지 확인
    // 예: 사용 중인 공정 설비인지 확인
    
    // 현재는 기본 검증만 수행
    if (!id || id <= 0) {
      throw new BadRequestException('유효하지 않은 공정 설비 ID입니다.');
    }
  }

  /**
   * 공정 설비 삭제 가능 여부를 확인합니다.
   * @param id 공정 설비 ID
   * @returns 삭제 가능 여부와 이유
   */
  async checkDeleteAvailability(id: number): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      // 공정 설비 존재 여부 확인
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (!existingProcessEquipment) {
        return {
          canDelete: false,
          reason: '공정 설비를 찾을 수 없습니다.',
        };
      }

      // 여기에 추가 검증 로직을 구현할 수 있습니다
      // 예: 다른 테이블에서 참조하고 있는지 확인
      // 예: 사용 중인 공정 설비인지 확인

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
