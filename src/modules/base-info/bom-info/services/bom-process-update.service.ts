import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomProcess } from '../entities/bom-process.entity';
import { UpdateBomProcessDto, UpdateMultipleBomProcessDto } from '../dto/update-bom-process.dto';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class BomProcessUpdateService {
  constructor(
    @InjectRepository(BomProcess)
    private readonly bomProcessRepository: Repository<BomProcess>,
    private readonly logService: logService,
  ) {}

  /**
   * BOM 공정 정보를 수정합니다.
   * @param id BOM 공정 ID
   * @param updateDto 수정할 데이터
   * @param username 사용자명
   * @returns 수정된 BOM 공정 정보
   */
  async updateBomProcess(
    id: number,
    updateDto: UpdateBomProcessDto,
    username: string,
  ): Promise<BomProcess> {
    try {
      // 기존 BOM 공정 조회
      const existingBomProcess = await this.bomProcessRepository.findOne({
        where: { id },
      });

      if (!existingBomProcess) {
        throw new NotFoundException(`ID ${id}에 해당하는 BOM 공정을 찾을 수 없습니다.`);
      }

      // 중복 검증
      await this.validateUpdateData(id, updateDto);

      // 수정할 데이터 준비
      const updateData: Partial<BomProcess> = {};
      
      if (updateDto.productCode !== undefined) {
        updateData.productCode = updateDto.productCode;
      }
      
      if (updateDto.processOrder !== undefined) {
        updateData.processOrder = updateDto.processOrder;
      }
      
      if (updateDto.processCode !== undefined) {
        updateData.processCode = updateDto.processCode;
      }
      
      if (updateDto.processName !== undefined) {
        updateData.processName = updateDto.processName;
      }

      // 데이터베이스 업데이트
      await this.bomProcessRepository.update(id, updateData);

      // 업데이트된 데이터 조회
      const updatedBomProcess = await this.bomProcessRepository.findOne({
        where: { id },
      });

      if (!updatedBomProcess) {
        throw new NotFoundException(`수정 후 ID ${id}에 해당하는 BOM 공정을 찾을 수 없습니다.`);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 공정 관리',
        action: 'UPDATE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${existingBomProcess.productCode} - ${existingBomProcess.processName}`,
        details: `BOM 공정 수정 성공: ${existingBomProcess.productCode} - ${existingBomProcess.processName} → ${updateData.productCode || existingBomProcess.productCode} - ${updateData.processName || existingBomProcess.processName}`,
      });

      return updatedBomProcess;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 공정 관리',
        action: 'UPDATE_FAIL',
        username,
        targetId: id.toString(),
        targetName: 'Unknown',
        details: `BOM 공정 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 여러 BOM 공정 정보를 일괄 수정합니다.
   * @param updateDtos 수정할 데이터 배열
   * @param username 사용자명
   * @returns 수정된 BOM 공정 정보 배열
   */
  async updateMultipleBomProcesses(
    updateDtos: UpdateMultipleBomProcessDto[],
    username: string,
  ): Promise<BomProcess[]> {
    try {
      const results: BomProcess[] = [];

      for (const updateDto of updateDtos) {
        const { id, ...updateData } = updateDto;
        const result = await this.updateBomProcess(id, updateData, username);
        results.push(result);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 공정 관리',
        action: 'BULK_UPDATE_SUCCESS',
        username,
        targetId: updateDtos.map(dto => dto.id).join(','),
        targetName: `${updateDtos.length}개 BOM 공정`,
        details: `${updateDtos.length}개 BOM 공정 일괄 수정 성공`,
      });

      return results;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: 'BOM 공정 관리',
        action: 'BULK_UPDATE_FAIL',
        username,
        targetId: updateDtos.map(dto => dto.id).join(','),
        targetName: `${updateDtos.length}개 BOM 공정`,
        details: `BOM 공정 일괄 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 수정 데이터의 유효성을 검증합니다.
   * @param id BOM 공정 ID
   * @param updateDto 수정할 데이터
   */
  private async validateUpdateData(id: number, updateDto: UpdateBomProcessDto): Promise<void> {
    // 최소 하나의 필드는 수정되어야 함
    if (!updateDto.productCode && !updateDto.processOrder && !updateDto.processCode && !updateDto.processName) {
      throw new BadRequestException('수정할 데이터가 없습니다. 최소 하나의 필드는 입력해야 합니다.');
    }

    // 제품 코드와 공정 순서 조합 중복 검증
    if (updateDto.productCode && updateDto.processOrder) {
      const existingCombination = await this.bomProcessRepository.findOne({
        where: {
          productCode: updateDto.productCode,
          processOrder: updateDto.processOrder,
        },
      });

      if (existingCombination && existingCombination.id !== id) {
        throw new ConflictException(
          `제품 코드 ${updateDto.productCode}의 공정 순서 ${updateDto.processOrder}가 이미 존재합니다.`,
        );
      }
    }

    // 제품 코드만 변경하는 경우
    if (updateDto.productCode && !updateDto.processOrder) {
      const existingBomProcess = await this.bomProcessRepository.findOne({
        where: { id },
      });

      if (existingBomProcess) {
        const existingCombination = await this.bomProcessRepository.findOne({
          where: {
            productCode: updateDto.productCode,
            processOrder: existingBomProcess.processOrder,
          },
        });

        if (existingCombination && existingCombination.id !== id) {
          throw new ConflictException(
            `제품 코드 ${updateDto.productCode}의 공정 순서 ${existingBomProcess.processOrder}가 이미 존재합니다.`,
          );
        }
      }
    }

    // 공정 순서만 변경하는 경우
    if (updateDto.processOrder && !updateDto.productCode) {
      const existingBomProcess = await this.bomProcessRepository.findOne({
        where: { id },
      });

      if (existingBomProcess) {
        const existingCombination = await this.bomProcessRepository.findOne({
          where: {
            productCode: existingBomProcess.productCode,
            processOrder: updateDto.processOrder,
          },
        });

        if (existingCombination && existingCombination.id !== id) {
          throw new ConflictException(
            `제품 코드 ${existingBomProcess.productCode}의 공정 순서 ${updateDto.processOrder}가 이미 존재합니다.`,
          );
        }
      }
    }
  }
}
