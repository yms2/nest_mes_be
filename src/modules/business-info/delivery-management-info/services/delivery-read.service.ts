import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Delivery } from '../entities/delivery.entity';

@Injectable()
export class DeliveryReadService {
    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
    ) {}

    /**
     * 모든 납품 목록 조회 (페이징)
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @param search 검색어
     * @returns 납품 목록과 총 개수
     */
    async getAllDeliveries(
        page: number = 1,
        limit: number = 10,
        search?: string | {
            search?: string;
            customerName?: string;
            productName?: string;
            projectName?: string;
            startDate?: string;
            endDate?: string;
        }
    ): Promise<{ deliveries: Delivery[]; total: number; page: number; limit: number }> {
        const queryBuilder = this.deliveryRepository
            .createQueryBuilder('delivery')
            .where('delivery.deletedAt IS NULL')
            .orderBy('delivery.createdAt', 'DESC');

        // 검색 조건 추가
        if (typeof search === 'string' && search) {
            queryBuilder.andWhere(
                '(delivery.deliveryCode LIKE :search OR ' +
                'delivery.customerCode LIKE :search OR ' +
                'delivery.customerName LIKE :search OR ' +
                'delivery.productCode LIKE :search OR ' +
                'delivery.productName LIKE :search OR ' +
                'delivery.projectCode LIKE :search OR ' +
                'delivery.projectName LIKE :search)',
                { search: `%${search}%` }
            );
        } else if (typeof search === 'object' && search) {
            // 개별 필터 조건들
            if (search.search) {
                queryBuilder.andWhere(
                    '(delivery.deliveryCode LIKE :search OR ' +
                    'delivery.customerCode LIKE :search OR ' +
                    'delivery.customerName LIKE :search OR ' +
                    'delivery.productCode LIKE :search OR ' +
                    'delivery.productName LIKE :search OR ' +
                    'delivery.projectCode LIKE :search OR ' +
                    'delivery.projectName LIKE :search)',
                    { search: `%${search.search}%` }
                );
            }
            
            if (search.customerName) {
                queryBuilder.andWhere('delivery.customerName LIKE :customerName', { 
                    customerName: `%${search.customerName}%` 
                });
            }
            
            if (search.productName) {
                queryBuilder.andWhere('delivery.productName LIKE :productName', { 
                    productName: `%${search.productName}%` 
                });
            }
            
            if (search.projectName) {
                queryBuilder.andWhere('delivery.projectName LIKE :projectName', { 
                    projectName: `%${search.projectName}%` 
                });
            }
            
            if (search.startDate) {
                queryBuilder.andWhere('delivery.deliveryDate >= :startDate', { 
                    startDate: search.startDate 
                });
            }
            
            if (search.endDate) {
                queryBuilder.andWhere('delivery.deliveryDate <= :endDate', { 
                    endDate: search.endDate 
                });
            }
        }

        // 총 개수 조회
        const total = await queryBuilder.getCount();

        // 페이징 적용
        const deliveries = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            deliveries,
            total,
            page,
            limit
        };
    }
}
