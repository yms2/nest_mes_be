import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { EstimateDetail } from '../entities/estimate-detail.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class EstimateManagementDeleteService {
  constructor(
    @InjectRepository(EstimateManagement)
    private readonly estimateRepository: Repository<EstimateManagement>,
    @InjectRepository(EstimateDetail)
    private readonly estimateDetailRepository: Repository<EstimateDetail>,
    private readonly logService: logService,
  ) {}

  /**
   * 견적을 완전히 삭제합니다 (세부품목 포함).
   * @param id 견적 ID
   * @param username 사용자명
   * @returns 삭제된 견적 정보
   */
  async deleteEstimate(id: number, username: string): Promise<EstimateManagement> {
    try {
      // 기존 견적 조회 (세부품목 포함)
      const existingEstimate = await this.estimateRepository.findOne({
        where: { id },
        relations: ['estimateDetails'],
      });

      if (!existingEstimate) {
        throw new NotFoundException(`ID ${id}인 견적을 찾을 수 없습니다.`);
      }

      // 견적 상태 확인 (승인완료 상태는 삭제 불가)
      if (existingEstimate.estimateStatus === '승인완료') {
        throw new BadRequestException('승인완료된 견적은 삭제할 수 없습니다.');
      }

      // 세부품목이 있으면 먼저 삭제
      if (existingEstimate.estimateDetails && existingEstimate.estimateDetails.length > 0) {
        await this.estimateDetailRepository.remove(existingEstimate.estimateDetails);
      }

      // 견적 삭제
      const deletedEstimate = await this.estimateRepository.remove(existingEstimate);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 삭제',
        action: 'DELETE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${deletedEstimate.estimateCode} - ${deletedEstimate.customerName}`,
        details: `견적 삭제 성공: ${deletedEstimate.estimateCode} (고객: ${deletedEstimate.customerName}, 프로젝트: ${deletedEstimate.projectName})`,
      });

      return deletedEstimate;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 삭제',
        action: 'DELETE_FAIL',
        username,
        targetId: id.toString(),
        targetName: '',
        details: `견적 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 견적 세부품목을 삭제합니다.
   * @param estimateId 견적 ID
   * @param detailIds 삭제할 세부품목 ID 배열
   * @param username 사용자명
   * @returns 수정된 견적 정보
   */
  async deleteEstimateDetails(
    estimateId: number, 
    detailIds: number[], 
    username: string
  ): Promise<EstimateManagement> {
    try {
      // 기존 견적 조회
      const existingEstimate = await this.estimateRepository.findOne({
        where: { id: estimateId },
        relations: ['estimateDetails'],
      });

      if (!existingEstimate) {
        throw new NotFoundException(`ID ${estimateId}인 견적을 찾을 수 없습니다.`);
      }

      // 견적 상태 확인 (승인완료 상태는 수정 불가)
      if (existingEstimate.estimateStatus === '승인완료') {
        throw new BadRequestException('승인완료된 견적의 세부품목은 삭제할 수 없습니다.');
      }

      // 삭제할 세부품목 조회
      const detailsToDelete = await this.estimateDetailRepository.find({
        where: { id: In(detailIds), estimate: { id: estimateId } },
      });

      if (detailsToDelete.length === 0) {
        throw new NotFoundException('삭제할 세부품목을 찾을 수 없습니다.');
      }

      // 세부품목 삭제
      await this.estimateDetailRepository.remove(detailsToDelete);

      // 견적 가격 재계산
      const remainingDetails = await this.estimateDetailRepository.find({
        where: { estimate: { id: estimateId } },
      });

      let totalPrice = 0;
      if (remainingDetails.length > 0) {
        totalPrice = remainingDetails.reduce((sum, detail) => {
          return sum + (detail.unitPrice * detail.quantity);
        }, 0);
      }

      // 견적 가격 업데이트
      const updatedEstimate = await this.estimateRepository.save({
        ...existingEstimate,
        estimatePrice: totalPrice,
      });

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 세부품목삭제',
        action: 'DETAILS_DELETE_SUCCESS',
        username,
        targetId: estimateId.toString(),
        targetName: `${updatedEstimate.estimateCode} - ${updatedEstimate.customerName}`,
        details: `견적 세부품목 삭제: ${detailsToDelete.length}개 항목 삭제, 가격 재계산: ${existingEstimate.estimatePrice} → ${totalPrice}`,
      });

      return updatedEstimate;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 세부품목삭제',
        action: 'DETAILS_DELETE_FAIL',
        username,
        targetId: estimateId.toString(),
        targetName: '',
        details: `견적 세부품목 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 여러 견적을 일괄 삭제합니다.
   * @param ids 삭제할 견적 ID 배열
   * @param username 사용자명
   * @returns 삭제된 견적 정보 배열
   */
  async deleteMultipleEstimates(ids: number[], username: string): Promise<EstimateManagement[]> {
    try {
      const deletedEstimates: EstimateManagement[] = [];

      for (const id of ids) {
        try {
          const deletedEstimate = await this.deleteEstimate(id, username);
          deletedEstimates.push(deletedEstimate);
        } catch (error) {
          // 개별 견적 삭제 실패 시 로그 기록
          await this.logService.createDetailedLog({
            moduleName: '견적관리 일괄삭제',
            action: 'BATCH_DELETE_PARTIAL_FAIL',
            username,
            targetId: id.toString(),
            targetName: '',
            details: `견적 일괄 삭제 중 개별 실패: ${error.message}`,
          }).catch(() => {});
          
          // 개별 실패는 무시하고 계속 진행
          continue;
        }
      }

      // 일괄 삭제 결과 로그
      await this.logService.createDetailedLog({
        moduleName: '견적관리 일괄삭제',
        action: 'BATCH_DELETE_SUCCESS',
        username,
        targetId: ids.join(','),
        targetName: '',
        details: `견적 일괄 삭제 완료: ${deletedEstimates.length}/${ids.length}개 성공`,
      });

      return deletedEstimates;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 일괄삭제',
        action: 'BATCH_DELETE_FAIL',
        username,
        targetId: ids.join(','),
        targetName: '',
        details: `견적 일괄 삭제 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }
}
