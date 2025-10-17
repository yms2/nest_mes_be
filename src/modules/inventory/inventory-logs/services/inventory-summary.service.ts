import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { InventoryAdjustmentLog } from '../entities/inventory-adjustment-log.entity';
import { InventorySummaryQueryDto, InventorySummaryResponseDto, InventorySummaryItemDto } from '../dto/inventory-summary.dto';

@Injectable()
export class InventorySummaryService {
  constructor(
    @InjectRepository(InventoryAdjustmentLog)
    private readonly inventoryAdjustmentLogRepository: Repository<InventoryAdjustmentLog>,
  ) {}

  /**
   * 기간별 재고 현황 조회
   * @param queryDto 조회 조건
   * @returns 재고 현황 정보
   */
  async getInventorySummary(queryDto: InventorySummaryQueryDto): Promise<InventorySummaryResponseDto> {
    const { startDate, endDate, inventoryCode, inventoryName, page = 1, limit = 20 } = queryDto;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // 종료일의 마지막 시간으로 설정

    // 1. 기간 내 모든 재고 로그 조회
    const periodLogsQuery = this.inventoryAdjustmentLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt BETWEEN :startDate AND :endDate', { startDate: start, endDate: end })
      .andWhere('log.logStatus = :status', { status: 'SUCCESS' });

    if (inventoryCode) {
      periodLogsQuery.andWhere('log.inventoryCode = :inventoryCode', { inventoryCode });
    }

    if (inventoryName) {
      periodLogsQuery.andWhere('log.inventoryName LIKE :inventoryName', { 
        inventoryName: `%${inventoryName}%` 
      });
    }

    const periodLogs = await periodLogsQuery.getMany();

    // 2. 기간 이전 재고 상태 조회 (각 재고별로 기간 시작일 이전의 마지막 상태)
    const uniqueInventoryCodes = [...new Set(periodLogs.map(log => log.inventoryCode))];
    
    const previousStates = await Promise.all(
      uniqueInventoryCodes.map(async (code) => {
        const lastLogBeforePeriod = await this.inventoryAdjustmentLogRepository
          .createQueryBuilder('log')
          .where('log.inventoryCode = :inventoryCode', { inventoryCode: code })
          .andWhere('log.createdAt < :startDate', { startDate: start })
          .andWhere('log.logStatus = :status', { status: 'SUCCESS' })
          .orderBy('log.createdAt', 'DESC')
          .getOne();

        return {
          inventoryCode: code,
          previousQuantity: lastLogBeforePeriod ? lastLogBeforePeriod.afterQuantity : 0
        };
      })
    );

    // 3. 재고별 통계 계산
    const inventoryStats = new Map<string, {
      inventoryCode: string;
      inventoryName: string;
      previousQuantity: number;
      inboundQuantity: number;
      outboundQuantity: number;
      adjustmentQuantity: number;
      inboundCount: number;
      outboundCount: number;
      adjustmentCount: number;
      lastTransactionDate: Date;
    }>();

    // 초기화
    periodLogs.forEach(log => {
      if (!inventoryStats.has(log.inventoryCode)) {
        const previousState = previousStates.find(s => s.inventoryCode === log.inventoryCode);
        inventoryStats.set(log.inventoryCode, {
          inventoryCode: log.inventoryCode,
          inventoryName: log.inventoryName,
          previousQuantity: previousState?.previousQuantity || 0,
          inboundQuantity: 0,
          outboundQuantity: 0,
          adjustmentQuantity: 0,
          inboundCount: 0,
          outboundCount: 0,
          adjustmentCount: 0,
          lastTransactionDate: log.createdAt
        });
      }
    });

    // 통계 계산
    periodLogs.forEach(log => {
      const stats = inventoryStats.get(log.inventoryCode);
      if (stats) {
        if (log.quantityChange > 0) {
          // 입고
          stats.inboundQuantity += log.quantityChange;
          stats.inboundCount++;
        } else if (log.quantityChange < 0) {
          // 출고
          stats.outboundQuantity += Math.abs(log.quantityChange);
          stats.outboundCount++;
        }

        // 조정 (SET, RESET 타입)
        if (log.adjustmentType === 'SET' || log.adjustmentType === 'RESET') {
          stats.adjustmentQuantity += Math.abs(log.quantityChange);
          stats.adjustmentCount++;
        }

        // 마지막 거래일시 업데이트
        if (log.createdAt > stats.lastTransactionDate) {
          stats.lastTransactionDate = log.createdAt;
        }
      }
    });

    // 4. 결과 데이터 변환
    const summaryItems: InventorySummaryItemDto[] = Array.from(inventoryStats.values()).map(stats => ({
      inventoryCode: stats.inventoryCode,
      inventoryName: stats.inventoryName,
      previousQuantity: stats.previousQuantity,
      inboundQuantity: stats.inboundQuantity,
      outboundQuantity: stats.outboundQuantity,
      adjustmentQuantity: stats.adjustmentQuantity,
      currentQuantity: stats.previousQuantity + stats.inboundQuantity - stats.outboundQuantity + stats.adjustmentQuantity,
      inboundCount: stats.inboundCount,
      outboundCount: stats.outboundCount,
      adjustmentCount: stats.adjustmentCount,
      lastTransactionDate: stats.lastTransactionDate
    }));

    // 5. 페이지네이션 적용
    const total = summaryItems.length;
    const offset = (page - 1) * limit;
    const paginatedItems = summaryItems.slice(offset, offset + limit);

    // 6. 전체 통계 계산
    const totalStatistics = {
      totalItems: total,
      totalPreviousQuantity: summaryItems.reduce((sum, item) => sum + item.previousQuantity, 0),
      totalInboundQuantity: summaryItems.reduce((sum, item) => sum + item.inboundQuantity, 0),
      totalOutboundQuantity: summaryItems.reduce((sum, item) => sum + item.outboundQuantity, 0),
      totalAdjustmentQuantity: summaryItems.reduce((sum, item) => sum + item.adjustmentQuantity, 0),
      totalCurrentQuantity: summaryItems.reduce((sum, item) => sum + item.currentQuantity, 0),
      totalInboundCount: summaryItems.reduce((sum, item) => sum + item.inboundCount, 0),
      totalOutboundCount: summaryItems.reduce((sum, item) => sum + item.outboundCount, 0),
      totalAdjustmentCount: summaryItems.reduce((sum, item) => sum + item.adjustmentCount, 0)
    };

    // 7. 기간 정보 계산
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      data: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      statistics: totalStatistics,
      period: {
        startDate: startDate,
        endDate: endDate,
        periodDays
      }
    };
  }

  /**
   * 특정 재고의 상세 현황 조회
   * @param inventoryCode 재고 코드
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 재고 상세 현황
   */
  async getInventoryDetailSummary(
    inventoryCode: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    success: boolean;
    data: InventorySummaryItemDto;
    period: {
      startDate: string;
      endDate: string;
      periodDays: number;
    };
  }> {
    const queryDto: InventorySummaryQueryDto = {
      startDate,
      endDate,
      inventoryCode,
      page: 1,
      limit: 1
    };

    const result = await this.getInventorySummary(queryDto);
    
    if (result.data.length === 0) {
      throw new Error(`재고 코드 ${inventoryCode}에 대한 데이터를 찾을 수 없습니다.`);
    }

    return {
      success: true,
      data: result.data[0],
      period: result.period
    };
  }

  /**
   * 월말 재고 현황 조회 (특정 월의 마지막 날 기준)
   * @param year 년도
   * @param month 월 (1-12)
   * @param inventoryCode 재고 코드 (선택사항)
   * @returns 월말 재고 현황
   */
  async getMonthlyInventorySummary(
    year: number, 
    month: number, 
    inventoryCode?: string
  ): Promise<InventorySummaryResponseDto> {
    // 해당 월의 첫날과 마지막날 계산
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const queryDto: InventorySummaryQueryDto = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      inventoryCode,
      page: 1,
      limit: 1000 // 월말 현황은 보통 모든 재고를 조회
    };

    return this.getInventorySummary(queryDto);
  }
}
