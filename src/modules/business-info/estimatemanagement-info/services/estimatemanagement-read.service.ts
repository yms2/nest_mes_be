import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual } from 'typeorm';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class EstimateManagementReadService {
  constructor(
    @InjectRepository(EstimateManagement)
    private readonly estimateRepository: Repository<EstimateManagement>,
    private readonly logService: logService,
  ) {}

  /**
   * 모든 견적 목록을 조회합니다.
   */
  async getAllEstimates(page: number = 1, limit: number = 10, username: string) {
    try {
      const skip = (page - 1) * limit;
      const [estimates, total] = await this.estimateRepository.findAndCount({
        relations: ['estimateDetails'],
        order: { id: 'DESC' },
        skip,
        take: limit,
      });

      await this.logService.createDetailedLog({
        moduleName: '견적관리 조회',
        action: 'READ_SUCCESS',
        username,
        targetId: '',
        targetName: '전체 견적 목록',
        details: `견적 목록 조회: ${total}개 중 ${estimates.length}개`,
      });

      return { estimates, total, page, limit };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 최근 30일 내 견적 목록을 조회합니다.
   */
  async getRecentEstimates(page: number = 1, limit: number = 10, username: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const skip = (page - 1) * limit;
      const [estimates, total] = await this.estimateRepository.findAndCount({
        where: {
          estimateDate: MoreThan(thirtyDaysAgo)
        },
        relations: ['estimateDetails'],
        order: { id: 'DESC' },
        skip,
        take: limit,
      });

      // 각 견적에 경과일수 추가
      const estimatesWithDays = estimates.map(estimate => {
        const estimateDate = new Date(estimate.estimateDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - estimateDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...estimate,
          daysSinceEstimate: diffDays
        };
      });

      await this.logService.createDetailedLog({
        moduleName: '견적관리 조회',
        action: 'READ_SUCCESS',
        username,
        targetId: '',
        targetName: '최근 30일 내 견적 목록',
        details: `최근 30일 내 견적 조회: ${total}개 중 ${estimates.length}개`,
      });

      return { estimates: estimatesWithDays, total, page, limit };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 30일이 경과한 견적 목록을 조회합니다.
   */
  async getExpiredEstimates(page: number = 1, limit: number = 10, username: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const skip = (page - 1) * limit;
      const [estimates, total] = await this.estimateRepository.findAndCount({
        where: {
          estimateDate: LessThanOrEqual(thirtyDaysAgo)
        },
        relations: ['estimateDetails'],
        order: { id: 'DESC' },
        skip,
        take: limit,
      });

      // 각 견적에 경과일수 추가
      const estimatesWithDays = estimates.map(estimate => {
        const estimateDate = new Date(estimate.estimateDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - estimateDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          ...estimate,
          daysSinceEstimate: diffDays
        };
      });

      await this.logService.createDetailedLog({
        moduleName: '견적관리 조회',
        action: 'READ_SUCCESS',
        username,
        targetId: '',
        targetName: '30일 경과 견적 목록',
        details: `30일 경과 견적 조회: ${total}개 중 ${estimates.length}개`,
      });

      return { estimates: estimatesWithDays, total, page, limit };
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID로 견적을 조회합니다.
   */
  async getEstimateById(id: number, username: string): Promise<EstimateManagement> {
    const estimate = await this.estimateRepository.findOne({
      where: { id },
      relations: ['estimateDetails'],
    });

    if (!estimate) {
      throw new NotFoundException(`ID ${id}인 견적을 찾을 수 없습니다.`);
    }

    await this.logService.createDetailedLog({
      moduleName: '견적관리 조회',
      action: 'READ_SUCCESS',
      username,
      targetId: id.toString(),
      targetName: estimate.estimateCode,
      details: `견적 조회: ${estimate.estimateCode}`,
    });

    return estimate;
  }


}
