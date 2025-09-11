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
}
