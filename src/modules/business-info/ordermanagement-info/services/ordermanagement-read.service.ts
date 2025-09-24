import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { Production } from '@/modules/production/equipment-production/entities/production.entity';
import { Shipping } from '@/modules/business-info/shipping-info/entities/shipping.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';

@Injectable()
export class OrderManagementReadService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    //모든 수주 목록 조회
    async getAllOrderManagement(
        page: number = 1,
        limit: number = 10,
        username: string,
        search?: string,
        startDate?: string,
        endDate?: string,
        customerName?: string,
        projectName?: string,
        productName?: string,
        orderType?: string,
    ) {
        try {
        const skip = (page - 1) * limit;

        const queryBuilder = this.orderManagementRepository
            .createQueryBuilder('orderManagement')
            .orderBy('orderManagement.id', 'DESC')
            .skip(skip)
            .take(limit);

        // 검색 조건 적용
        if (search) {
            queryBuilder.andWhere(
                '(orderManagement.orderCode LIKE :search OR orderManagement.customerName LIKE :search OR orderManagement.projectName LIKE :search OR orderManagement.productName LIKE :search OR orderManagement.orderType LIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (customerName) {
            queryBuilder.andWhere('orderManagement.customerName LIKE :customerName', { customerName: `%${customerName}%` });
        }

        if (projectName) {
            queryBuilder.andWhere('orderManagement.projectName LIKE :projectName', { projectName: `%${projectName}%` });
        }

        if (productName) {
            queryBuilder.andWhere('orderManagement.productName LIKE :productName', { productName: `%${productName}%` });
        }

        if (orderType) {
            queryBuilder.andWhere('orderManagement.orderType LIKE :orderType', { orderType: `%${orderType}%` });
        }

        if (startDate && endDate) {
            queryBuilder.andWhere('orderManagement.orderDate BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            });
        } else if (startDate) {
            queryBuilder.andWhere('orderManagement.orderDate >= :startDate', {
                startDate: new Date(startDate)
            });
        } else if (endDate) {
            queryBuilder.andWhere('orderManagement.orderDate <= :endDate', {
                endDate: new Date(endDate)
            });
        }

        const [orderManagement, total] = await queryBuilder.getManyAndCount();

        await this.logService.createDetailedLog({
            moduleName: '수주관리 조회',
            action: 'READ_SUCCESS',
            username,
            targetId: '',
            targetName: '수주 목록 검색',
            details: `수주 검색 조회: ${total}개 중 ${orderManagement.length}개 (검색어: ${search || '없음'}, 기간: ${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'})`,
        });

        return { orderManagement, total, page, limit, search, startDate, endDate, customerName, projectName, productName, orderType };
    } catch (error) {
        throw error;
    }
    }

    /**
     * ID로 수주를 조회합니다.
     */
    async getOrderManagementById(id: number, username: string): Promise<OrderManagement> {
        const orderManagement = await this.orderManagementRepository.findOne({
            where: { id },
        });

        if (!orderManagement) {
            throw new NotFoundException(`ID ${id}인 수주를 찾을 수 없습니다.`);
        }

        await this.logService.createDetailedLog({
            moduleName: '수주관리 조회',
            action: 'READ_SUCCESS',
            username,
            targetId: id.toString(),
            targetName: orderManagement.orderCode,
            details: `수주 조회: ${orderManagement.orderCode}`,
        });

        return orderManagement;
    }

    /**
     * 출하가 되거나 생산계획이 내려진 수주를 제외한 활성 수주 목록을 조회합니다.
     */
    async getActiveOrderManagement(
        page: number = 1,
        limit: number = 10,
        username: string,
        search?: string,
        startDate?: string,
        endDate?: string,
        customerName?: string,
        projectName?: string,
        productName?: string,
        orderType?: string,
    ) {
        try {
            const skip = (page - 1) * limit;

            const queryBuilder = this.orderManagementRepository
                .createQueryBuilder('orderManagement')
                // 생산 완료된 항목 제외를 위한 LEFT JOIN (수주코드로 비교)
                .leftJoin(Production, 'production', 'production.productCode = orderManagement.productCode AND production.productionStatus = :productionCompleted', { productionCompleted: '생산 완료' })
                // 출하 완료된 항목 제외를 위한 LEFT JOIN (수주코드로 비교)
                .leftJoin(Shipping, 'shipping', 'shipping.orderCode = orderManagement.orderCode AND shipping.shippingStatus = :shippingCompleted', { shippingCompleted: '지시 완료' })
                // 생산계획이 있는 항목 제외를 위한 LEFT JOIN (수주코드로 비교)
                .leftJoin(ProductionPlan, 'productionPlan', 'productionPlan.orderCode = orderManagement.orderCode')
                // 생산 완료, 출하 완료, 생산계획이 있는 항목들을 제외
                .where('production.id IS NULL')
                .andWhere('shipping.id IS NULL')
                .andWhere('productionPlan.id IS NULL')
                .orderBy('orderManagement.id', 'DESC')
                .skip(skip)
                .take(limit);

            // 검색 조건 적용
            if (search) {
                queryBuilder.andWhere(
                    '(orderManagement.orderCode LIKE :search OR orderManagement.customerName LIKE :search OR orderManagement.projectName LIKE :search OR orderManagement.productName LIKE :search OR orderManagement.orderType LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            if (customerName) {
                queryBuilder.andWhere('orderManagement.customerName LIKE :customerName', { customerName: `%${customerName}%` });
            }

            if (projectName) {
                queryBuilder.andWhere('orderManagement.projectName LIKE :projectName', { projectName: `%${projectName}%` });
            }

            if (productName) {
                queryBuilder.andWhere('orderManagement.productName LIKE :productName', { productName: `%${productName}%` });
            }

            if (orderType) {
                queryBuilder.andWhere('orderManagement.orderType LIKE :orderType', { orderType: `%${orderType}%` });
            }

            if (startDate && endDate) {
                queryBuilder.andWhere('orderManagement.orderDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                });
            } else if (startDate) {
                queryBuilder.andWhere('orderManagement.orderDate >= :startDate', {
                    startDate: new Date(startDate)
                });
            } else if (endDate) {
                queryBuilder.andWhere('orderManagement.orderDate <= :endDate', {
                    endDate: new Date(endDate)
                });
            }

            const [orderManagement, total] = await queryBuilder.getManyAndCount();

            await this.logService.createDetailedLog({
                moduleName: '수주관리 활성 조회',
                action: 'READ_ACTIVE_SUCCESS',
                username,
                targetId: '',
                targetName: '활성 수주 목록 검색',
                details: `활성 수주 검색 조회: ${total}개 중 ${orderManagement.length}개 (검색어: ${search || '없음'}, 기간: ${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'})`,
            });

            return { orderManagement, total, page, limit, search, startDate, endDate, customerName, projectName, productName, orderType };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '수주관리 활성 조회',
                action: 'READ_ACTIVE_FAIL',
                username,
                targetId: '',
                targetName: '활성 수주 목록 검색',
                details: `활성 수주 검색 실패: ${error.message}`,
            });
            throw error;
        }
    }
}
