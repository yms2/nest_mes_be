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
   * 모든 견적 목록을 조회합니다. (검색 기능 포함)
   */
  async getAllEstimates(
    page: number = 1, 
    limit: number = 10, 
    username: string,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      
      // 검색 조건 구성
      const whereConditions: any = {};
      
      // 일반 검색 (견적코드, 견적명, 고객명, 프로젝트명, 제품명)
      if (search) {
        whereConditions.search = search;
      }
      
      // 견적일 범위 검색
      if (startDate || endDate) {
        if (startDate && endDate) {
          whereConditions.estimateDate = {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          };
        } else if (startDate) {
          whereConditions.estimateDate = {
            startDate: new Date(startDate)
          };
        } else if (endDate) {
          whereConditions.estimateDate = {
            endDate: new Date(endDate)
          };
        }
      }

      // 쿼리 빌더로 검색 조건 적용
      const queryBuilder = this.estimateRepository
        .createQueryBuilder('estimate')
        .leftJoinAndSelect('estimate.estimateDetails', 'estimateDetails')
        .orderBy('estimate.id', 'DESC')
        .skip(skip)
        .take(limit);

      // 검색 조건 적용
      if (search) {
        queryBuilder.andWhere(
          '(estimate.estimateCode LIKE :search OR estimate.estimateName LIKE :search OR estimate.customerName LIKE :search OR estimate.projectName LIKE :search OR estimate.productName LIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('estimate.estimateDate BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      } else if (startDate) {
        queryBuilder.andWhere('estimate.estimateDate >= :startDate', {
          startDate: new Date(startDate)
        });
      } else if (endDate) {
        queryBuilder.andWhere('estimate.estimateDate <= :endDate', {
          endDate: new Date(endDate)
        });
      }

      const [estimates, total] = await queryBuilder.getManyAndCount();

      await this.logService.createDetailedLog({
        moduleName: '견적관리 조회',
        action: 'READ_SUCCESS',
        username,
        targetId: '',
        targetName: '견적 목록 검색',
        details: `견적 검색 조회: ${total}개 중 ${estimates.length}개 (검색어: ${search || '없음'}, 기간: ${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'})`,
      });

      return { estimates, total, page, limit, search, startDate, endDate };
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
