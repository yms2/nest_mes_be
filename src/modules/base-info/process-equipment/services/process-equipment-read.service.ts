import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { Equipment } from '../../../equipment/equipment_management/entities/equipment.entity';

@Injectable()
export class ProcessEquipmentReadService {
  constructor(
    @InjectRepository(ProcessEquipment)
    private readonly processEquipmentRepository: Repository<ProcessEquipment>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  /**
   * 공정 코드로 공정 설비와 설비 상세 정보를 함께 조회합니다.
   * @param processCode 공정 코드
   * @returns 해당 공정의 설비 목록 (설비 상세 정보 포함)
   */
  async getProcessEquipmentsWithEquipmentDetails(processCode: string): Promise<any[]> {
    const processEquipments = await this.processEquipmentRepository.find({
      where: { processCode },
      order: {
        equipmentCode: 'ASC',
      },
    });

    if (processEquipments.length === 0) {
      throw new NotFoundException(`공정 코드 ${processCode}의 설비를 찾을 수 없습니다.`);
    }

    // 설비 코드들을 추출
    const equipmentCodes = processEquipments.map(pe => pe.equipmentCode);

    // 설비 상세 정보 조회
    const equipments = await this.equipmentRepository.find({
      where: { equipmentCode: In(equipmentCodes) },
    });

    // 설비 정보를 맵으로 변환
    const equipmentMap = equipments.reduce((map, equipment) => {
      map[equipment.equipmentCode] = equipment;
      return map;
    }, {});

    // 공정 설비와 설비 정보를 결합
    const result = processEquipments.map(pe => ({
      ...pe,
      equipmentInfo: equipmentMap[pe.equipmentCode] || null,
    }));

    return result;
  }

  /**
   * 공정 코드로 공정과 설비 정보를 그룹화하여 조회합니다.
   * @param processCode 공정 코드
   * @returns 공정 정보와 설비 배열
   */
  async getProcessWithEquipmentArray(processCode: string): Promise<any> {
    const processEquipments = await this.processEquipmentRepository.find({
      where: { processCode },
      order: {
        equipmentCode: 'ASC',
      },
    });

    if (processEquipments.length === 0) {
      throw new NotFoundException(`공정 코드 ${processCode}의 설비를 찾을 수 없습니다.`);
    }

    // 설비 코드들을 추출
    const equipmentCodes = processEquipments.map(pe => pe.equipmentCode);

    // 설비 상세 정보 조회
    const equipments = await this.equipmentRepository.find({
      where: { equipmentCode: In(equipmentCodes) },
    });

    // 설비 정보를 맵으로 변환
    const equipmentMap = equipments.reduce((map, equipment) => {
      map[equipment.equipmentCode] = equipment;
      return map;
    }, {});

    // 공정 정보와 설비 배열로 구성
    const result = {
      processCode: processCode,
      equipmentCount: processEquipments.length,
      equipments: equipments.map(equipment => ({
        ...equipment,
        processEquipmentId: processEquipments.find(pe => pe.equipmentCode === equipment.equipmentCode)?.id
      }))
    };

    return result;
  }

}
