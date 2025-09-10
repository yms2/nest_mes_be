import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class OrderManagementDeleteService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    async deleteOrderManagement(id: number, username: string): Promise<OrderManagement> {
        try {
            const existingOrderManagement = await this.orderManagementRepository.findOne({
                where: { id },
            });

            if (!existingOrderManagement) {
                throw new NotFoundException(`ID ${id}인 수주를 찾을 수 없습니다.`);
            }

            const deletedOrderManagement = await this.orderManagementRepository.remove(existingOrderManagement);
            
            await this.logService.createDetailedLog({
                moduleName: '수주관리 삭제',
                action: 'DELETE_SUCCESS',
                username,
                targetId: id.toString(),
                targetName: `${existingOrderManagement.orderCode} - ${existingOrderManagement.customerName}`,
                details: `수주 삭제 성공: ${existingOrderManagement.orderCode} (고객: ${existingOrderManagement.customerName}, 프로젝트: ${existingOrderManagement.projectName})`,
            });

            return deletedOrderManagement;
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '수주관리 삭제',
                action: 'DELETE_FAIL',
                username,
                targetId: id.toString(),
                targetName: '',
                details: `수주 삭제 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }

    async deleteMultipleOrderManagements(ids: number[], username: string): Promise<OrderManagement[]> {
        try {
            const deletedOrderManagements: OrderManagement[] = [];

            for (const id of ids) {
                try {
                    const deletedOrderManagement = await this.deleteOrderManagement(id, username);
                    deletedOrderManagements.push(deletedOrderManagement);
                } catch (error) {
                    await this.logService.createDetailedLog({
                        moduleName: '수주관리 일괄삭제',
                        action: 'BATCH_DELETE_PARTIAL_FAIL',
                        username,
                        targetId: id.toString(),
                        targetName: '',
                        details: `수주 일괄 삭제 중 개별 실패: ${error.message}`,
                    }).catch(() => {});
                    
                }
            }

            await this.logService.createDetailedLog({
                moduleName: '수주관리 일괄삭제',
                action: 'BATCH_DELETE_SUCCESS',
                username,
                targetId: ids.join(','),
                targetName: '',
                details: `수주 일괄 삭제 완료: ${deletedOrderManagements.length}개 성공`,
            });

            return deletedOrderManagements;
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '수주관리 일괄삭제',
                action: 'BATCH_DELETE_FAIL',
                username,
                targetId: ids.join(','),
                targetName: '',
                details: `수주 일괄 삭제 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }
}

