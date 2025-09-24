import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityInspection } from '../entities/quality-inspection.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { logService } from '@/modules/log/Services/log.service';
import { NotificationCreateService } from '@/modules/notification/services/notification-create.service';

@Injectable()
export class QualityInspectionApprovalService {
    constructor(
        @InjectRepository(QualityInspection)
        private readonly inspectionRepository: Repository<QualityInspection>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        private readonly logService: logService,
        private readonly notificationCreateService: NotificationCreateService,
    ) {}

    /**
     * 품질검사 승인 처리
     */
    async approveInspection(inspectionId: number, approver: string, username: string = 'system') {
        try {
            // 품질검사 정보 조회
            const inspection = await this.inspectionRepository.findOne({
                where: { id: inspectionId }
            });

            if (!inspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            if (inspection.inspectionStatus !== 'PENDING') {
                throw new BadRequestException('승인 대기 중인 품질검사만 승인할 수 있습니다.');
            }

            // 품질검사 상태를 승인으로 변경
            inspection.inspectionStatus = 'APPROVED';
            inspection.approvedBy = approver;
            inspection.approvedAt = new Date();
            inspection.updatedBy = username;

            const updatedInspection = await this.inspectionRepository.save(inspection);

            // 재고에 반영
            await this.updateInventoryFromInspection(inspection);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '품질검사 승인',
                action: 'APPROVE_SUCCESS',
                username: username,
                targetId: inspection.id.toString(),
                targetName: inspection.inspectionCode,
                details: `품질검사 승인 완료: ${inspection.inspectionCode}, 검사수량: ${inspection.inspectionQuantity}`,
            });

            // 승인 완료 알림 생성 (평직원용)
            try {
                await this.notificationCreateService.createApprovalCompleteNotification(
                    '품질검사관리',
                    inspection.inspectionCode,
                    `품질검사 ${inspection.inspectionCode} - ${inspection.productName}`,
                    inspection.createdBy || 'system', // 품질검사 등록자
                    '품질검사',
                    approver
                );
            } catch (notificationError) {
                console.error('승인 완료 알림 생성 실패:', notificationError);
            }

            return {
                success: true,
                message: '품질검사 승인이 완료되었습니다.',
                inspection: updatedInspection,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 승인',
                action: 'APPROVE_FAIL',
                username: username,
                targetId: inspectionId.toString(),
                targetName: '',
                details: `품질검사 승인 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '품질검사 승인 실패',
                error: error.message,
            };
        }
    }

    /**
     * 품질검사 거부 처리
     */
    async rejectInspection(inspectionId: number, rejector: string, reason: string, username: string = 'system') {
        try {
            // 품질검사 정보 조회
            const inspection = await this.inspectionRepository.findOne({
                where: { id: inspectionId }
            });

            if (!inspection) {
                throw new NotFoundException('품질검사를 찾을 수 없습니다.');
            }

            if (inspection.inspectionStatus !== 'PENDING') {
                throw new BadRequestException('승인 대기 중인 품질검사만 거부할 수 있습니다.');
            }

            // 품질검사 상태를 거부로 변경
            inspection.inspectionStatus = 'REJECTED';
            inspection.rejectedBy = rejector;
            inspection.rejectedAt = new Date();
            inspection.rejectionReason = reason;
            inspection.updatedBy = username;

            const updatedInspection = await this.inspectionRepository.save(inspection);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '품질검사 거부',
                action: 'REJECT_SUCCESS',
                username: username,
                targetId: inspection.id.toString(),
                targetName: inspection.inspectionCode,
                details: `품질검사 거부: ${inspection.inspectionCode}, 거부사유: ${reason}`,
            });

            return {
                success: true,
                message: '품질검사 거부가 완료되었습니다.',
                inspection: updatedInspection,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 거부',
                action: 'REJECT_FAIL',
                username: username,
                targetId: inspectionId.toString(),
                targetName: '',
                details: `품질검사 거부 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '품질검사 거부 실패',
                error: error.message,
            };
        }
    }

    /**
     * 승인 대기 중인 품질검사 목록 조회
     */
    async getPendingInspections(page: number = 1, limit: number = 20, username: string = 'system') {
        try {
            const offset = (page - 1) * limit;

            const [inspections, total] = await this.inspectionRepository.findAndCount({
                where: { inspectionStatus: 'PENDING' },
                order: { createdAt: 'DESC' },
                skip: offset,
                take: limit
            });

            await this.logService.createDetailedLog({
                moduleName: '품질검사 승인대기',
                action: 'READ_PENDING_SUCCESS',
                username,
                targetId: '',
                targetName: '승인 대기 품질검사 목록',
                details: `승인 대기 품질검사 조회: ${total}개 중 ${inspections.length}개`,
            });

            return {
                success: true,
                message: '승인 대기 품질검사 목록을 성공적으로 조회했습니다.',
                data: {
                    inspections,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '품질검사 승인대기',
                action: 'READ_PENDING_FAIL',
                username,
                targetId: '',
                targetName: '승인 대기 품질검사 목록',
                details: `승인 대기 품질검사 조회 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '승인 대기 품질검사 목록 조회 실패',
                error: error.message,
            };
        }
    }

    /**
     * 품질검사 승인 시 재고 업데이트
     */
    private async updateInventoryFromInspection(inspection: QualityInspection) {
        try {
            // 기존 재고 조회
            let inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: inspection.productCode || inspection.productionCode }
            });

            if (inventory) {
                // 기존 재고가 있으면 수량 증가
                inventory.inventoryQuantity += inspection.inspectionQuantity;
                inventory.updatedAt = new Date();
                await this.inventoryRepository.save(inventory);
            } else {
                // 기존 재고가 없으면 새로 생성
                const newInventory = this.inventoryRepository.create({
                    inventoryCode: inspection.productCode || inspection.productionCode,
                    inventoryName: inspection.productName,
                    inventoryType: '완제품',
                    inventoryQuantity: inspection.inspectionQuantity,
                    inventoryUnit: '개',
                    inventoryLocation: '창고',
                    inventoryStatus: '정상',
                    safeInventory: 0,
                    createdBy: 'system',
                    updatedBy: 'system'
                });
                await this.inventoryRepository.save(newInventory);
            }
        } catch (error) {
            console.error('재고 업데이트 실패:', error);
            throw new Error(`재고 업데이트 실패: ${error.message}`);
        }
    }
}
