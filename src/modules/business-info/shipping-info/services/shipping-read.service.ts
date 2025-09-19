import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Shipping } from '../entities/shipping.entity';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ShippingReadService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    /**
     * 모든 출하 목록을 조회합니다. (검색 기능 포함)
     */
    async getAllShipping(
        page: number = 1,
        limit: number = 10,
        username: string,
        search?: string,
        startDate?: string,
        endDate?: string,
    ) {
        try {
            const skip = (page - 1) * limit;

            const queryBuilder = this.shippingRepository
                .createQueryBuilder('shipping')
                .leftJoinAndSelect('shipping.orderManagement', 'orderManagement')
                .orderBy('shipping.id', 'DESC')
                .skip(skip)
                .take(limit);

            // 검색 조건 적용
            if (search) {
                queryBuilder.andWhere(
                    '(shipping.shippingCode LIKE :search OR orderManagement.customerName LIKE :search OR orderManagement.projectName LIKE :search OR orderManagement.productName LIKE :search OR shipping.employeeName LIKE :search OR shipping.shippingStatus LIKE :search OR shipping.productName LIKE :search OR shipping.productCode LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // 날짜 범위 검색
            if (startDate && endDate) {
                queryBuilder.andWhere('shipping.shippingDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                });
            } else if (startDate) {
                queryBuilder.andWhere('shipping.shippingDate >= :startDate', {
                    startDate: new Date(startDate)
                });
            } else if (endDate) {
                queryBuilder.andWhere('shipping.shippingDate <= :endDate', {
                    endDate: new Date(endDate)
                });
            }

            const [shipping, total] = await queryBuilder.getManyAndCount();

            await this.logService.createDetailedLog({
                moduleName: '출하관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: '출하 목록 검색',
                details: `출하 검색 조회: ${total}개 중 ${shipping.length}개 (검색어: ${search || '없음'}, 기간: ${startDate || '시작일 없음'} ~ ${endDate || '종료일 없음'})`,
            });

            return { shipping, total, page, limit, search, startDate, endDate };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 출하 상세 조회
     */
    async getShippingById(id: number, username: string): Promise<Shipping> {
        try {
            const shipping = await this.shippingRepository.findOne({
                where: { id },
                relations: ['orderManagement']
            });

            if (!shipping) {
                throw new NotFoundException(`ID ${id}인 출하를 찾을 수 없습니다.`);
            }

            await this.logService.createDetailedLog({
                moduleName: '출하관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: id.toString(),
                targetName: shipping.shippingCode,
                details: `출하 상세 조회: ${shipping.shippingCode}`,
            });

            return shipping;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 출하 상태별 조회
     */
    async getShippingByStatus(
        status: string,
        page: number = 1,
        limit: number = 10,
        username: string
    ) {
        try {
            const skip = (page - 1) * limit;

            const [shipping, total] = await this.shippingRepository.findAndCount({
                where: { shippingStatus: status },
                relations: ['orderManagement'],
                order: { id: 'DESC' },
                skip,
                take: limit
            });

            await this.logService.createDetailedLog({
                moduleName: '출하관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: `출하 상태별 조회: ${status}`,
                details: `출하 상태별 조회: ${status} - ${total}개`,
            });

            return { shipping, total, page, limit, status };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 특정 필드별 검색을 위한 메서드
     */
    async searchShippingByField(
        field: string,
        value: string,
        page: number = 1,
        limit: number = 10,
        username: string,
        startDate?: string,
        endDate?: string
    ) {
        try {
            const skip = (page - 1) * limit;

            const queryBuilder = this.shippingRepository
                .createQueryBuilder('shipping')
                .leftJoinAndSelect('shipping.orderManagement', 'orderManagement')
                .orderBy('shipping.id', 'DESC')
                .skip(skip)
                .take(limit);

            // 특정 필드별 검색 조건
            switch (field) {
                case 'shippingCode':
                    queryBuilder.andWhere('shipping.shippingCode LIKE :value', { value: `%${value}%` });
                    break;
                case 'productName':
                    queryBuilder.andWhere('(shipping.productName LIKE :value OR orderManagement.productName LIKE :value)', { value: `%${value}%` });
                    break;
                case 'employeeName':
                    queryBuilder.andWhere('shipping.employeeName LIKE :value', { value: `%${value}%` });
                    break;
                case 'shippingStatus':
                    queryBuilder.andWhere('shipping.shippingStatus LIKE :value', { value: `%${value}%` });
                    break;
                case 'customerName':
                    queryBuilder.andWhere('orderManagement.customerName LIKE :value', { value: `%${value}%` });
                    break;
                case 'projectName':
                    queryBuilder.andWhere('orderManagement.projectName LIKE :value', { value: `%${value}%` });
                    break;
                default:
                    // 기본적으로 전체 검색
                    queryBuilder.andWhere(
                        '(shipping.shippingCode LIKE :value OR orderManagement.customerName LIKE :value OR orderManagement.projectName LIKE :value OR orderManagement.productName LIKE :value OR shipping.employeeName LIKE :value OR shipping.shippingStatus LIKE :value OR shipping.productName LIKE :value OR shipping.productCode LIKE :value)',
                        { value: `%${value}%` }
                    );
            }

            // 날짜 범위 검색
            if (startDate && endDate) {
                queryBuilder.andWhere('shipping.shippingDate BETWEEN :startDate AND :endDate', {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                });
            } else if (startDate) {
                queryBuilder.andWhere('shipping.shippingDate >= :startDate', {
                    startDate: new Date(startDate)
                });
            } else if (endDate) {
                queryBuilder.andWhere('shipping.shippingDate <= :endDate', {
                    endDate: new Date(endDate)
                });
            }

            const [shipping, total] = await queryBuilder.getManyAndCount();

            await this.logService.createDetailedLog({
                moduleName: '출하관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: `출하 ${field} 검색`,
                details: `출하 ${field} 검색: ${value} - ${total}개 중 ${shipping.length}개`,
            });

            return { shipping, total, page, limit, field, value, startDate, endDate };
        } catch (error) {
            throw error;
        }
    }
}
