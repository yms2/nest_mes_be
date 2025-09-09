import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';

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
}
