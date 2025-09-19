import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { EstimateDetail } from '../entities/estimate-detail.entity';
import { CreateEstimateDto } from '../dto/estimatemanagement-create.dto';
import { CreateEstimateDetailDto } from '../dto/estimate-detail.dto';
import { APMService } from '@/common/apm/services/apm.service';
import { MeasurePerformance, MeasureDatabaseQuery, TrackErrors, RecordMetric } from '@/common/apm/decorators/performance.decorator';

@Injectable()
export class EstimateManagementCreateServiceAPM {
  private readonly logger = new Logger(EstimateManagementCreateServiceAPM.name);

  constructor(
    @InjectRepository(EstimateManagement)
    private estimateRepository: Repository<EstimateManagement>,
    @InjectRepository(EstimateDetail)
    private estimateDetailRepository: Repository<EstimateDetail>,
    private apmService: APMService,
  ) {}

  /**
   * 견적과 세부품목을 함께 생성 (APM 적용)
   */
  @MeasurePerformance('createEstimateWithDetails')
  @TrackErrors()
  async createEstimateWithDetails(
    estimateData: CreateEstimateDto,
    estimateDetailsData: CreateEstimateDetailDto[],
    username: string,
  ): Promise<EstimateManagement> {
    this.logger.log(`견적 생성 시작: ${username}`);
    
    // 견적 코드 생성
    const estimateCode = await this.generateEstimateCode();
    
    // 견적 엔티티 생성
    const estimate = this.estimateRepository.create({
      ...estimateData,
      estimateCode,
    });

    // 견적 저장
    const savedEstimate = await this.saveEstimate(estimate);
    
    // 세부품목 생성 및 저장
    const savedDetails = await this.createEstimateDetails(savedEstimate.id, estimateDetailsData);
    
    // APM 메트릭 기록
    this.apmService.recordMetric('estimate.created', 1, {
      customerCode: estimateData.customerCode,
      productCode: estimateData.productCode,
      employeeCode: estimateData.employeeCode,
    });

    this.logger.log(`견적 생성 완료: ${savedEstimate.estimateCode}`);
    return { ...savedEstimate, estimateDetails: savedDetails };
  }

  /**
   * 견적 저장 (데이터베이스 쿼리 모니터링)
   */
  @MeasureDatabaseQuery('saveEstimate')
  private async saveEstimate(estimate: EstimateManagement): Promise<EstimateManagement> {
    return await this.estimateRepository.save(estimate);
  }

  /**
   * 세부품목 생성 (데이터베이스 쿼리 모니터링)
   */
  @MeasureDatabaseQuery('createEstimateDetails')
  private async createEstimateDetails(
    estimateId: number,
    detailsData: CreateEstimateDetailDto[],
  ): Promise<EstimateDetail[]> {
    const details = detailsData.map((detail, index) => {
      const detailCode = this.generateDetailCode(estimateId, index + 1);
      return this.estimateDetailRepository.create({
        ...detail,
        estimateId,
        detailCode,
      });
    });

    return await this.estimateDetailRepository.save(details);
  }

  /**
   * 견적 코드 생성 (성능 모니터링)
   */
  @MeasurePerformance('generateEstimateCode')
  private async generateEstimateCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 오늘 날짜의 견적 수 조회
    const count = await this.getTodayEstimateCount(dateStr);
    
    const sequence = String(count + 1).padStart(3, '0');
    return `EST${dateStr}${sequence}`;
  }

  /**
   * 오늘 날짜의 견적 수 조회 (데이터베이스 쿼리 모니터링)
   */
  @MeasureDatabaseQuery('getTodayEstimateCount')
  private async getTodayEstimateCount(dateStr: string): Promise<number> {
    const query = this.estimateRepository
      .createQueryBuilder('estimate')
      .where('estimate.estimateCode LIKE :pattern', { pattern: `EST${dateStr}%` });
    
    return await query.getCount();
  }

  /**
   * 세부품목 코드 생성
   */
  private generateDetailCode(estimateId: number, sequence: number): string {
    return `DET${estimateId.toString().padStart(6, '0')}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * 견적 상세 조회 (성능 모니터링)
   */
  @MeasurePerformance('getEstimateWithDetails')
  @MeasureDatabaseQuery('getEstimateWithDetails')
  async getEstimateWithDetails(id: number): Promise<EstimateManagement | null> {
    const estimate = await this.estimateRepository.findOne({
      where: { id },
      relations: ['estimateDetails'],
    });

    if (estimate) {
      // 조회 성공 메트릭
      this.apmService.recordMetric('estimate.viewed', 1, {
        estimateId: id.toString(),
        customerCode: estimate.customerCode,
      });
    }

    return estimate;
  }

  /**
   * 견적 목록 조회 (성능 모니터링)
   */
  @MeasurePerformance('getEstimatesWithPagination')
  @MeasureDatabaseQuery('getEstimatesWithPagination')
  async getEstimatesWithPagination(
    page: number = 1,
    limit: number = 10,
    searchDto?: any,
  ): Promise<{ data: EstimateManagement[]; total: number }> {
    const query = this.estimateRepository
      .createQueryBuilder('estimate')
      .leftJoinAndSelect('estimate.estimateDetails', 'details');

    // 검색 조건 적용
    if (searchDto?.customerCode) {
      query.andWhere('estimate.customerCode = :customerCode', { 
        customerCode: searchDto.customerCode 
      });
    }

    if (searchDto?.estimateStatus) {
      query.andWhere('estimate.estimateStatus = :status', { 
        status: searchDto.estimateStatus 
      });
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    // 조회 성공 메트릭
    this.apmService.recordMetric('estimate.list_viewed', 1, {
      page: page.toString(),
      limit: limit.toString(),
      total: total.toString(),
    });

    return { data, total };
  }

  /**
   * 견적 수정 (성능 모니터링)
   */
  @MeasurePerformance('updateEstimate')
  @TrackErrors()
  async updateEstimate(
    id: number,
    updateData: Partial<CreateEstimateDto>,
    username: string,
  ): Promise<EstimateManagement> {
    const estimate = await this.estimateRepository.findOne({ where: { id } });
    
    if (!estimate) {
      throw new Error(`견적을 찾을 수 없습니다: ID ${id}`);
    }

    // 수정 전 상태 기록
    const oldStatus = estimate.estimateStatus;
    
    // 견적 업데이트
    Object.assign(estimate, updateData);
    const updatedEstimate = await this.estimateRepository.save(estimate);

    // 수정 메트릭 기록
    this.apmService.recordMetric('estimate.updated', 1, {
      estimateId: id.toString(),
      oldStatus,
      newStatus: updateData.estimateStatus || oldStatus,
      employeeCode: username,
    });

    this.logger.log(`견적 수정 완료: ${estimate.estimateCode}`);
    return updatedEstimate;
  }

  /**
   * 견적 삭제 (성능 모니터링)
   */
  @MeasurePerformance('deleteEstimate')
  @TrackErrors()
  async deleteEstimate(id: number, username: string): Promise<void> {
    const estimate = await this.estimateRepository.findOne({ where: { id } });
    
    if (!estimate) {
      throw new Error(`견적을 찾을 수 없습니다: ID ${id}`);
    }

    // 관련 세부품목 삭제
    await this.estimateDetailRepository.delete({ estimateId: id });
    
    // 견적 삭제
    await this.estimateRepository.delete(id);

    // 삭제 메트릭 기록
    this.apmService.recordMetric('estimate.deleted', 1, {
      estimateId: id.toString(),
      estimateCode: estimate.estimateCode,
      employeeCode: username,
    });

    this.logger.log(`견적 삭제 완료: ${estimate.estimateCode}`);
  }

  /**
   * 견적 통계 조회 (성능 모니터링)
   */
  @MeasurePerformance('getEstimateStatistics')
  @MeasureDatabaseQuery('getEstimateStatistics')
  async getEstimateStatistics(): Promise<{
    totalEstimates: number;
    estimatesByStatus: Record<string, number>;
    estimatesByCustomer: Record<string, number>;
    averageEstimatePrice: number;
  }> {
    // 전체 견적 수
    const totalEstimates = await this.estimateRepository.count();

    // 상태별 견적 수
    const statusStats = await this.estimateRepository
      .createQueryBuilder('estimate')
      .select('estimate.estimateStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('estimate.estimateStatus')
      .getRawMany();

    const estimatesByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {});

    // 고객별 견적 수
    const customerStats = await this.estimateRepository
      .createQueryBuilder('estimate')
      .select('estimate.customerCode', 'customerCode')
      .addSelect('COUNT(*)', 'count')
      .groupBy('estimate.customerCode')
      .getRawMany();

    const estimatesByCustomer = customerStats.reduce((acc, stat) => {
      acc[stat.customerCode] = parseInt(stat.count);
      return acc;
    }, {});

    // 평균 견적 가격
    const avgResult = await this.estimateRepository
      .createQueryBuilder('estimate')
      .select('AVG(estimate.estimatePrice)', 'average')
      .getRawOne();

    const averageEstimatePrice = parseFloat(avgResult.average) || 0;

    // 통계 조회 메트릭
    this.apmService.recordMetric('estimate.statistics_viewed', 1, {
      totalEstimates: totalEstimates.toString(),
    });

    return {
      totalEstimates,
      estimatesByStatus,
      estimatesByCustomer,
      averageEstimatePrice,
    };
  }
}
