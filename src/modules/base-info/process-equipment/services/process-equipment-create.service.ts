import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { CreateProcessEquipmentDto, CreateMultipleProcessEquipmentDto, ProcessEquipmentItemDto } from '../dto/create-process-equipment.dto';

@Injectable()
export class ProcessEquipmentCreateService {
  constructor(
    @InjectRepository(ProcessEquipment)
    private readonly processEquipmentRepository: Repository<ProcessEquipment>,
  ) {}

  /**
   * 단일 공정 설비를 등록합니다.
   * @param createProcessEquipmentDto 공정 설비 생성 정보
   * @returns 생성된 공정 설비 정보
   */
  async createProcessEquipment(createProcessEquipmentDto: CreateProcessEquipmentDto): Promise<{ message: string; processEquipment: ProcessEquipment }> {
    try {
      const { processEquipment } = createProcessEquipmentDto;

      // 데이터 검증
      await this.validateProcessEquipmentData(processEquipment);

      // 중복 확인
      await this.checkDuplicateProcessEquipment(processEquipment.processCode, processEquipment.equipmentCode);

      // 공정 설비 생성
      const newProcessEquipment = this.processEquipmentRepository.create({
        processCode: processEquipment.processCode,
        equipmentCode: processEquipment.equipmentCode,
      });

      const savedProcessEquipment = await this.processEquipmentRepository.save(newProcessEquipment);

      return {
        message: `공정 ${processEquipment.processCode}에 설비 ${processEquipment.equipmentCode}가 성공적으로 등록되었습니다.`,
        processEquipment: savedProcessEquipment,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 여러 공정 설비를 일괄 등록합니다.
   * @param createMultipleProcessEquipmentDto 공정 설비 일괄 생성 정보
   * @returns 생성 결과
   */
  async createMultipleProcessEquipment(createMultipleProcessEquipmentDto: CreateMultipleProcessEquipmentDto): Promise<{ message: string; createdCount: number; failedItems: ProcessEquipmentItemDto[] }> {
    try {
      const { processEquipments } = createMultipleProcessEquipmentDto;
      const failedItems: ProcessEquipmentItemDto[] = [];
      let createdCount = 0;

      for (const processEquipment of processEquipments) {
        try {
          // 데이터 검증
          await this.validateProcessEquipmentData(processEquipment);

          // 중복 확인
          await this.checkDuplicateProcessEquipment(processEquipment.processCode, processEquipment.equipmentCode);

          // 공정 설비 생성
          const newProcessEquipment = this.processEquipmentRepository.create({
            processCode: processEquipment.processCode,
            equipmentCode: processEquipment.equipmentCode,
          });

          await this.processEquipmentRepository.save(newProcessEquipment);
          createdCount++;
        } catch (error) {
          failedItems.push(processEquipment);
        }
      }

      const message = `총 ${processEquipments.length}개 중 ${createdCount}개 공정 설비가 등록되었습니다.`;
      
      if (failedItems.length > 0) {
        return {
          message: `${message} 실패: ${failedItems.length}개`,
          createdCount,
          failedItems,
        };
      }

      return {
        message,
        createdCount,
        failedItems: [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 공정 설비 데이터를 검증합니다.
   * @param processEquipment 공정 설비 정보
   */
  private async validateProcessEquipmentData(processEquipment: ProcessEquipmentItemDto): Promise<void> {
    if (!processEquipment.processCode || processEquipment.processCode.trim() === '') {
      throw new BadRequestException('공정 코드는 필수입니다.');
    }

    if (!processEquipment.equipmentCode || processEquipment.equipmentCode.trim() === '') {
      throw new BadRequestException('설비 코드는 필수입니다.');
    }

    // 공정 코드 형식 검증 (필요시 추가)
    if (processEquipment.processCode.length > 20) {
      throw new BadRequestException('공정 코드는 20자를 초과할 수 없습니다.');
    }

    // 설비 코드 형식 검증 (필요시 추가)
    if (processEquipment.equipmentCode.length > 20) {
      throw new BadRequestException('설비 코드는 20자를 초과할 수 없습니다.');
    }
  }

  /**
   * 중복된 공정 설비가 있는지 확인합니다.
   * @param processCode 공정 코드
   * @param equipmentCode 설비 코드
   */
  private async checkDuplicateProcessEquipment(processCode: string, equipmentCode: string): Promise<void> {
    const existingProcessEquipment = await this.processEquipmentRepository.findOne({
      where: {
        processCode,
        equipmentCode,
      },
    });

    if (existingProcessEquipment) {
      throw new ConflictException(`공정 ${processCode}에 설비 ${equipmentCode}는 이미 등록되어 있습니다.`);
    }
  }

  /**
   * 특정 공정에 등록된 설비 수를 확인합니다.
   * @param processCode 공정 코드
   * @returns 등록된 설비 수
   */
  async getEquipmentCountByProcess(processCode: string): Promise<number> {
    return this.processEquipmentRepository.count({
      where: { processCode },
    });
  }

  /**
   * 특정 설비가 등록된 공정 수를 확인합니다.
   * @param equipmentCode 설비 코드
   * @returns 등록된 공정 수
   */
  async getProcessCountByEquipment(equipmentCode: string): Promise<number> {
    return this.processEquipmentRepository.count({
      where: { equipmentCode },
    });
  }
}
