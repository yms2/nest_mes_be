import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryAdjustmentLog } from '../entities/inventory-adjustment-log.entity';

@Injectable()
export class InventoryAdjustmentLogService {
  constructor(
    @InjectRepository(InventoryAdjustmentLog)
    private readonly inventoryAdjustmentLogRepository: Repository<InventoryAdjustmentLog>,
  ) {}

  /**
   * 재고 조정 이력 기록
   * @param inventoryCode 재고 코드
   * @param inventoryName 재고명
   * @param adjustmentType 조정 유형
   * @param beforeQuantity 조정 전 수량
   * @param afterQuantity 조정 후 수량
   * @param quantityChange 수량 변경량
   * @param reason 조정 사유
   * @param createdBy 생성자
   * @returns 생성된 이력
   */
  async logAdjustment(
    inventoryCode: string,
    inventoryName: string,
    adjustmentType: 'CHANGE' | 'SET' | 'RESET',
    beforeQuantity: number,
    afterQuantity: number,
    quantityChange: number,
    reason: string,
    createdBy: string,
  ): Promise<InventoryAdjustmentLog> {
    const log = this.inventoryAdjustmentLogRepository.create({
      inventoryCode,
      inventoryName,
      adjustmentType,
      beforeQuantity,
      afterQuantity,
      quantityChange,
      adjustmentReason: reason,
      logStatus: 'SUCCESS',
      createdBy,
    });
    return this.inventoryAdjustmentLogRepository.save(log);
  }

  /**
   * 재고 조정 실패 이력 기록
   * @param inventoryCode 재고 코드
   * @param inventoryName 재고명
   * @param adjustmentType 조정 유형
   * @param errorMessage 에러 메시지
   * @param createdBy 생성자
   * @returns 생성된 이력
   */
  async logFailedAdjustment(
    inventoryCode: string,
    inventoryName: string,
    adjustmentType: 'CHANGE' | 'SET' | 'RESET',
    errorMessage: string,
    createdBy: string,
  ): Promise<InventoryAdjustmentLog> {
    const log = this.inventoryAdjustmentLogRepository.create({
      inventoryCode,
      inventoryName,
      adjustmentType,
      beforeQuantity: 0,
      afterQuantity: 0,
      quantityChange: 0,
      adjustmentReason: '조정 실패',
      logStatus: 'FAILED',
      errorMessage,
      createdBy,
    });
    return this.inventoryAdjustmentLogRepository.save(log);
  }

  /**
   * 특정 재고의 조정 이력 조회
   * @param inventoryCode 재고 코드
   * @param limit 조회 개수 제한
   * @returns 조정 이력 목록
   */
  async getInventoryAdjustmentLogs(inventoryCode: string, limit?: number): Promise<InventoryAdjustmentLog[]> {
    return this.inventoryAdjustmentLogRepository.find({
      where: { inventoryCode },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 모든 재고 조정 이력 조회
   * @param limit 조회 개수 제한
   * @param offset 오프셋
   * @returns 조정 이력 목록
   */
  async getAllAdjustmentLogs(limit?: number, offset?: number): Promise<InventoryAdjustmentLog[]> {
    return this.inventoryAdjustmentLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * 조정 유형별 이력 조회
   * @param adjustmentType 조정 유형
   * @param limit 조회 개수 제한
   * @returns 조정 이력 목록
   */
  async getLogsByAdjustmentType(adjustmentType: string, limit?: number): Promise<InventoryAdjustmentLog[]> {
    return this.inventoryAdjustmentLogRepository.find({
      where: { adjustmentType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 기간별 이력 조회
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @param limit 조회 개수 제한
   * @returns 조정 이력 목록
   */
  async getLogsByDateRange(startDate: Date, endDate: Date, limit?: number): Promise<InventoryAdjustmentLog[]> {
    return this.inventoryAdjustmentLogRepository.find({
      where: { createdAt: Between(startDate, endDate) },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 사용자별 이력 조회
   * @param createdBy 생성자
   * @param limit 조회 개수 제한
   * @returns 조정 이력 목록
   */
  async getLogsByUser(createdBy: string, limit?: number): Promise<InventoryAdjustmentLog[]> {
    return this.inventoryAdjustmentLogRepository.find({
      where: { createdBy },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 재고 조정 통계 조회
   * @param inventoryCode 재고 코드 (선택사항)
   * @param startDate 시작 날짜 (선택사항)
   * @param endDate 종료 날짜 (선택사항)
   * @returns 조정 통계
   */
  async getAdjustmentStatistics(
    inventoryCode?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalAdjustments: number;
    successfulAdjustments: number;
    failedAdjustments: number;
    totalQuantityChanged: number;
    averageQuantityChange: number;
  }> {
    let query = this.inventoryAdjustmentLogRepository.createQueryBuilder('log');

    if (inventoryCode) {
      query = query.where('log.inventoryCode = :inventoryCode', { inventoryCode });
    }

    if (startDate && endDate) {
      query = query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const logs = await query.getMany();

    const totalAdjustments = logs.length;
    const successfulAdjustments = logs.filter(log => log.logStatus === 'SUCCESS').length;
    const failedAdjustments = logs.filter(log => log.logStatus === 'FAILED').length;
    const totalQuantityChanged = logs
      .filter(log => log.logStatus === 'SUCCESS')
      .reduce((sum, log) => sum + Math.abs(log.quantityChange), 0);
    const averageQuantityChange = successfulAdjustments > 0 ? totalQuantityChanged / successfulAdjustments : 0;

    return {
      totalAdjustments,
      successfulAdjustments,
      failedAdjustments,
      totalQuantityChanged,
      averageQuantityChange: Math.round(averageQuantityChange * 100) / 100,
    };
  }

  /**
   * 재고 입출고 내역 조회
   * @param filters 필터 조건
   * @returns 입출고 내역 목록
   */
  async getInboundOutboundLogs(filters: {
    inventoryCode?: string;
    inventoryName?: string;
    transactionType?: 'INBOUND' | 'OUTBOUND';
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    const queryBuilder = this.inventoryAdjustmentLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    // 재고 코드 필터
    if (filters.inventoryCode) {
      queryBuilder.andWhere('log.inventoryCode = :inventoryCode', { 
        inventoryCode: filters.inventoryCode 
      });
    }

    // 품목명 필터 (부분 검색)
    if (filters.inventoryName) {
      queryBuilder.andWhere('log.inventoryName LIKE :inventoryName', { 
        inventoryName: `%${filters.inventoryName}%` 
      });
    }

    // 거래 유형 필터 (입고/출고)
    if (filters.transactionType) {
      if (filters.transactionType === 'INBOUND') {
        queryBuilder.andWhere('log.quantityChange > 0');
      } else if (filters.transactionType === 'OUTBOUND') {
        queryBuilder.andWhere('log.quantityChange < 0');
      }
    }

    // 날짜 범위 필터
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', {
        startDate: filters.startDate
      });
    } else if (filters.endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', {
        endDate: filters.endDate
      });
    }

    // 성공한 로그만 조회
    queryBuilder.andWhere('log.logStatus = :status', { status: 'SUCCESS' });

    // 총 개수 조회
    const total = await queryBuilder.getCount();

    // 페이지네이션 적용
    const offset = (filters.page - 1) * filters.limit;
    const logs = await queryBuilder
      .skip(offset)
      .take(filters.limit)
      .getMany();

    // 입출고 내역 데이터 변환
    const inboundOutboundLogs = logs.map(log => {
      const isInbound = log.quantityChange > 0;
      return {
        id: log.id,
        inventoryCode: log.inventoryCode,
        inventoryName: log.inventoryName,
        transactionType: isInbound ? 'INBOUND' : 'OUTBOUND',
        transactionTypeName: isInbound ? '입고' : '생산',
        quantity: Math.abs(log.quantityChange),
        beforeQuantity: log.beforeQuantity,
        afterQuantity: log.afterQuantity,
        reason: log.adjustmentReason,
        createdBy: log.createdBy,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        // 추가 정보
        adjustmentType: log.adjustmentType,
        logStatus: log.logStatus
      };
    });

    // 통계 정보 계산
    const inboundCount = inboundOutboundLogs.filter(log => log.transactionType === 'INBOUND').length;
    const outboundCount = inboundOutboundLogs.filter(log => log.transactionType === 'OUTBOUND').length;
    const totalInboundQuantity = inboundOutboundLogs
      .filter(log => log.transactionType === 'INBOUND')
      .reduce((sum, log) => sum + log.quantity, 0);
    const totalOutboundQuantity = inboundOutboundLogs
      .filter(log => log.transactionType === 'OUTBOUND')
      .reduce((sum, log) => sum + log.quantity, 0);

    return {
      success: true,
      data: inboundOutboundLogs,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit)
      },
      statistics: {
        inboundCount,
        outboundCount,
        totalInboundQuantity,
        totalOutboundQuantity,
        netQuantity: totalInboundQuantity - totalOutboundQuantity,
        inboundLabel: '입고',
        outboundLabel: '생산'
      }
    };
  }
}
