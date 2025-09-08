import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { UpdateProcessEquipmentDto, UpdateMultipleProcessEquipmentDto } from '../dto/update-process-equipment.dto';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ProcessEquipmentUpdateService {
  constructor(
    @InjectRepository(ProcessEquipment)
    private readonly processEquipmentRepository: Repository<ProcessEquipment>,
    private readonly logService: logService,
  ) {}

  /**
   * 공정 설비 정보를 수정합니다.
   * @param id 공정 설비 ID
   * @param updateDto 수정할 데이터
   * @param username 사용자명
   * @returns 수정된 공정 설비 정보
   */
  async updateProcessEquipment(
    id: number,
    updateDto: UpdateProcessEquipmentDto,
    username: string,
  ): Promise<ProcessEquipment> {
    try {
      // 기존 공정 설비 조회
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (!existingProcessEquipment) {
        throw new NotFoundException(`ID ${id}에 해당하는 공정 설비를 찾을 수 없습니다.`);
      }

      // 중복 검증
      await this.validateUpdateData(id, updateDto);

      // 수정할 데이터 준비
      const updateData: Partial<ProcessEquipment> = {};
      
      if (updateDto.processCode !== undefined) {
        updateData.processCode = updateDto.processCode;
      }
      
      if (updateDto.equipmentCode !== undefined) {
        updateData.equipmentCode = updateDto.equipmentCode;
      }

      // 데이터베이스 업데이트
      await this.processEquipmentRepository.update(id, updateData);

      // 업데이트된 데이터 조회
      const updatedProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (!updatedProcessEquipment) {
        throw new NotFoundException(`수정 후 ID ${id}에 해당하는 공정 설비를 찾을 수 없습니다.`);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '공정 설비 관리',
        action: 'UPDATE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${existingProcessEquipment.processCode} - ${existingProcessEquipment.equipmentCode}`,
        details: `공정 설비 수정 성공: ${existingProcessEquipment.processCode} - ${existingProcessEquipment.equipmentCode} → ${updateData.processCode || existingProcessEquipment.processCode} - ${updateData.equipmentCode || existingProcessEquipment.equipmentCode}`,
      });

      return updatedProcessEquipment;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '공정 설비 관리',
        action: 'UPDATE_FAIL',
        username,
        targetId: id.toString(),
        targetName: 'Unknown',
        details: `공정 설비 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 여러 공정 설비 정보를 일괄 수정합니다.
   * @param updateDtos 수정할 데이터 배열
   * @param username 사용자명
   * @returns 수정된 공정 설비 정보 배열
   */
  async updateMultipleProcessEquipments(
    updateDtos: UpdateMultipleProcessEquipmentDto[],
    username: string,
  ): Promise<ProcessEquipment[]> {
    try {
      const results: ProcessEquipment[] = [];

      for (const updateDto of updateDtos) {
        const { id, ...updateData } = updateDto;
        const result = await this.updateProcessEquipment(id, updateData, username);
        results.push(result);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '공정 설비 관리',
        action: 'BULK_UPDATE_SUCCESS',
        username,
        targetId: updateDtos.map(dto => dto.id).join(','),
        targetName: `${updateDtos.length}개 공정 설비`,
        details: `${updateDtos.length}개 공정 설비 일괄 수정 성공`,
      });

      return results;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '공정 설비 관리',
        action: 'BULK_UPDATE_FAIL',
        username,
        targetId: updateDtos.map(dto => dto.id).join(','),
        targetName: `${updateDtos.length}개 공정 설비`,
        details: `공정 설비 일괄 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 수정 데이터의 유효성을 검증합니다.
   * @param id 공정 설비 ID
   * @param updateDto 수정할 데이터
   */
  private async validateUpdateData(id: number, updateDto: UpdateProcessEquipmentDto): Promise<void> {
    // 최소 하나의 필드는 수정되어야 함
    if (!updateDto.processCode && !updateDto.equipmentCode) {
      throw new BadRequestException('수정할 데이터가 없습니다. 공정 코드 또는 설비 코드 중 하나는 입력해야 합니다.');
    }

    // 공정 코드와 설비 코드 조합 중복 검증
    if (updateDto.processCode && updateDto.equipmentCode) {
      const existingCombination = await this.processEquipmentRepository.findOne({
        where: {
          processCode: updateDto.processCode,
          equipmentCode: updateDto.equipmentCode,
        },
      });

      if (existingCombination && existingCombination.id !== id) {
        throw new ConflictException(
          `공정 코드 ${updateDto.processCode}와 설비 코드 ${updateDto.equipmentCode}의 조합이 이미 존재합니다.`,
        );
      }
    }

    // 공정 코드만 변경하는 경우
    if (updateDto.processCode && !updateDto.equipmentCode) {
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (existingProcessEquipment) {
        const existingCombination = await this.processEquipmentRepository.findOne({
          where: {
            processCode: updateDto.processCode,
            equipmentCode: existingProcessEquipment.equipmentCode,
          },
        });

        if (existingCombination && existingCombination.id !== id) {
          throw new ConflictException(
            `공정 코드 ${updateDto.processCode}와 설비 코드 ${existingProcessEquipment.equipmentCode}의 조합이 이미 존재합니다.`,
          );
        }
      }
    }

    // 설비 코드만 변경하는 경우
    if (updateDto.equipmentCode && !updateDto.processCode) {
      const existingProcessEquipment = await this.processEquipmentRepository.findOne({
        where: { id },
      });

      if (existingProcessEquipment) {
        const existingCombination = await this.processEquipmentRepository.findOne({
          where: {
            processCode: existingProcessEquipment.processCode,
            equipmentCode: updateDto.equipmentCode,
          },
        });

        if (existingCombination && existingCombination.id !== id) {
          throw new ConflictException(
            `공정 코드 ${existingProcessEquipment.processCode}와 설비 코드 ${updateDto.equipmentCode}의 조합이 이미 존재합니다.`,
          );
        }
      }
    }
  }
}
