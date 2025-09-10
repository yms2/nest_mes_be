import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { EstimateDetail } from '../entities/estimate-detail.entity';
import { UpdateEstimateDto } from '../dto/estimatemanagement-create.dto';
import { CreateEstimateDetailDto } from '../dto/estimate-detail.dto';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class EstimateManagementUpdateService {
  constructor(
    @InjectRepository(EstimateManagement)
    private readonly estimateRepository: Repository<EstimateManagement>,
    @InjectRepository(EstimateDetail)
    private readonly estimateDetailRepository: Repository<EstimateDetail>,
    private readonly logService: logService,
  ) {}

  /**
   * 견적 가격을 재계산합니다.
   * @param id 견적 ID
   * @param username 사용자명
   * @returns 수정된 견적 정보
   */
  async recalculateEstimatePrice(id: number, username: string): Promise<EstimateManagement> {
    try {
      // 기존 견적 조회
      const existingEstimate = await this.estimateRepository.findOne({
        where: { id },
        relations: ['estimateDetails'],
      });

      if (!existingEstimate) {
        throw new NotFoundException(`ID ${id}인 견적을 찾을 수 없습니다.`);
      }

      // 세부품목 가격 합계 계산
      let totalPrice = 0;
      if (existingEstimate.estimateDetails && existingEstimate.estimateDetails.length > 0) {
        totalPrice = existingEstimate.estimateDetails.reduce((sum, detail) => {
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
        moduleName: '견적관리 가격재계산',
        action: 'PRICE_RECALCULATION_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${updatedEstimate.estimateCode} - ${updatedEstimate.customerName}`,
        details: `견적 가격 재계산: ${existingEstimate.estimatePrice} → ${totalPrice}`,
      });

      return updatedEstimate;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 가격재계산',
        action: 'PRICE_RECALCULATION_FAIL',
        username,
        targetId: id.toString(),
        targetName: '',
        details: `견적 가격 재계산 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 견적 정보, 상태, 세부품목을 통합하여 수정합니다.
   * @param id 견적 ID
   * @param updateData 통합 수정 데이터
   * @param username 사용자명
   * @returns 수정된 견적 정보
   */
  async updateEstimateComprehensive(
    id: number, 
    updateData: {
      estimateInfo?: UpdateEstimateDto;
      status?: string;
      details?: CreateEstimateDetailDto[];
      recalculatePrice?: boolean;
    }, 
    username: string
  ): Promise<EstimateManagement> {
    try {
      // 기존 견적 조회
      const existingEstimate = await this.estimateRepository.findOne({
        where: { id },
        relations: ['estimateDetails'],
      });

      if (!existingEstimate) {
        throw new NotFoundException(`ID ${id}인 견적을 찾을 수 없습니다.`);
      }

      let updatedEstimate = { ...existingEstimate };
      let updateLogs: string[] = [];

      // 1. 견적 정보 수정
      if (updateData.estimateInfo) {
        await this.validateUpdateData(updateData.estimateInfo, existingEstimate);
        
        if (updateData.estimateInfo.estimateCode && updateData.estimateInfo.estimateCode !== existingEstimate.estimateCode) {
          await this.checkDuplicateEstimateCode(updateData.estimateInfo.estimateCode, id);
        }

        updatedEstimate = { ...updatedEstimate, ...updateData.estimateInfo };
        updateLogs.push('견적 정보 수정');
      }

      // 2. 상태 변경
      if (updateData.status) {
        const validStatuses = ['견적중', '견적완료', '승인대기', '승인완료', '거절'];
        if (!validStatuses.includes(updateData.status)) {
          throw new BadRequestException(`유효하지 않은 견적 상태입니다: ${updateData.status}`);
        }
        updatedEstimate.estimateStatus = updateData.status;
        updateLogs.push(`상태 변경: ${existingEstimate.estimateStatus} → ${updateData.status}`);
      }

      // 3. 견적 정보 저장
      const savedEstimate = await this.estimateRepository.save(updatedEstimate);

      // 4. 세부품목 수정
      if (updateData.details !== undefined) {
        // 기존 세부품목 삭제
        if (existingEstimate.estimateDetails && existingEstimate.estimateDetails.length > 0) {
          await this.estimateDetailRepository.remove(existingEstimate.estimateDetails);
        }

        // 새로운 세부품목 등록
        if (updateData.details && updateData.details.length > 0) {
          const newDetails: EstimateDetail[] = [];
          for (const detail of updateData.details) {
            // detailCode 자동 생성 (필요시)
            if (!detail.detailCode || detail.detailCode.trim() === '') {
              detail.detailCode = await this.generateDetailCode(id);
            }
            
            // unit 필드 기본값 설정 (필요시)
            if (!detail.unit || detail.unit.trim() === '') {
              detail.unit = '개'; // 기본 단위
            }

            newDetails.push(
              this.estimateDetailRepository.create({
                ...detail,
                estimate: savedEstimate,
              })
            );
          }
          await this.estimateDetailRepository.save(newDetails);
        }
        updateLogs.push(`세부품목 수정: ${updateData.details.length}개 항목`);
      }

      // 5. 가격 재계산 (요청된 경우 또는 세부품목이 변경된 경우)
      if (updateData.recalculatePrice || updateData.details !== undefined) {
        const estimateWithDetails = await this.estimateRepository.findOne({
          where: { id },
          relations: ['estimateDetails'],
        });

        if (estimateWithDetails) {
          let totalPrice = 0;
          if (estimateWithDetails.estimateDetails && estimateWithDetails.estimateDetails.length > 0) {
            totalPrice = estimateWithDetails.estimateDetails.reduce((sum, detail) => {
              return sum + (detail.unitPrice * detail.quantity);
            }, 0);
          }

          await this.estimateRepository.save({
            ...estimateWithDetails,
            estimatePrice: totalPrice,
          });
          updateLogs.push(`가격 재계산: ${estimateWithDetails.estimatePrice} → ${totalPrice}`);
        }
      }

      // 최종 수정된 견적 정보 조회
      const finalEstimate = await this.estimateRepository.findOne({
        where: { id },
        relations: ['estimateDetails'],
      });

      if (!finalEstimate) {
        throw new NotFoundException(`ID ${id}인 견적을 찾을 수 없습니다.`);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 통합수정',
        action: 'COMPREHENSIVE_UPDATE_SUCCESS',
        username,
        targetId: id.toString(),
        targetName: `${finalEstimate.estimateCode} - ${finalEstimate.customerName}`,
        details: `견적 통합 수정 성공: ${updateLogs.join(', ')}`,
      });

      return finalEstimate;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 통합수정',
        action: 'COMPREHENSIVE_UPDATE_FAIL',
        username,
        targetId: id.toString(),
        targetName: '',
        details: `견적 통합 수정 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 수정 데이터를 검증합니다.
   * @param updateEstimateDto 수정할 데이터
   * @param existingEstimate 기존 견적 정보
   */
  private async validateUpdateData(updateEstimateDto: UpdateEstimateDto, existingEstimate: EstimateManagement): Promise<void> {
    // 견적 버전 검증
    if (updateEstimateDto.estimateVersion !== undefined && updateEstimateDto.estimateVersion < 1) {
      throw new BadRequestException('견적 버전은 1 이상이어야 합니다.');
    }

    // 제품 수량 검증
    if (updateEstimateDto.productQuantity !== undefined && updateEstimateDto.productQuantity < 1) {
      throw new BadRequestException('제품 수량은 1 이상이어야 합니다.');
    }

    // 견적 가격 검증
    if (updateEstimateDto.estimatePrice !== undefined && updateEstimateDto.estimatePrice < 0) {
      throw new BadRequestException('견적 가격은 0 이상이어야 합니다.');
    }

    // 견적 상태 검증
    if (updateEstimateDto.estimateStatus) {
      const validStatuses = ['견적중', '견적완료', '승인대기', '승인완료', '거절'];
      if (!validStatuses.includes(updateEstimateDto.estimateStatus)) {
        throw new BadRequestException(`유효하지 않은 견적 상태입니다: ${updateEstimateDto.estimateStatus}`);
      }
    }
  }

  /**
   * 견적 코드 중복을 확인합니다.
   * @param estimateCode 견적 코드
   * @param excludeId 제외할 견적 ID
   */
  private async checkDuplicateEstimateCode(estimateCode: string, excludeId: number): Promise<void> {
    const existingEstimate = await this.estimateRepository.findOne({
      where: { estimateCode },
    });

    if (existingEstimate && existingEstimate.id !== excludeId) {
      throw new ConflictException(`견적 코드 ${estimateCode}는 이미 사용 중입니다.`);
    }
  }

  /**
   * 세부품목 코드를 자동 생성합니다.
   * @param estimateId 견적 ID
   * @returns 생성된 세부품목 코드
   */
  async generateDetailCode(estimateId: number): Promise<string> {
    // 전체 세부품목 코드 중 가장 큰 시퀀스 번호 찾기
    const lastDetail = await this.estimateDetailRepository
      .createQueryBuilder('detail')
      .where('detail.detailCode IS NOT NULL')
      .andWhere('detail.detailCode LIKE :pattern', { pattern: 'DET%' })
      .orderBy('detail.detailCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastDetail && lastDetail.detailCode && lastDetail.detailCode.trim() !== '') {
      // DET001에서 001 부분을 추출
      const match = lastDetail.detailCode.match(/DET(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        sequence = currentNumber + 1;
      }
    }

    return `DET${sequence.toString().padStart(3, '0')}`;
  }
}
