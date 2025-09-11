import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';

import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class WarehouseReadService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
        private readonly logService: logService,
    ) {}

    async getAllWarehouse(
        page: number = 1,
        limit: number = 10,
        username: string,
        search?: string,
        warehouseName?: string,
        warehouseLocation?: string,
        warehouseBigo?: string,
    ) {
        try {
            const skip = (page - 1) * limit;

            const queryBuilder = this.warehouseRepository
                .createQueryBuilder('warehouse')
                .orderBy('warehouse.warehouseCode', 'ASC')
                .skip(skip)
                .take(limit);

            // 전체 검색 (keyword 파라미터가 있을 때만)
            if (search && search.trim()) {
                queryBuilder.andWhere(
                    '(warehouse.warehouseCode LIKE :search OR warehouse.warehouseName LIKE :search OR warehouse.warehouseLocation LIKE :search OR warehouse.warehouseBigo LIKE :search)',
                    { search: `%${search.trim()}%` }
                );
            }

            // 개별 필드 검색 (전체 검색이 아닐 때만)
            if (!search && warehouseName && warehouseName.trim()) {
                queryBuilder.andWhere('warehouse.warehouseName LIKE :warehouseName', { warehouseName: `%${warehouseName.trim()}%` });
            }

            if (!search && warehouseLocation && warehouseLocation.trim()) {
                queryBuilder.andWhere('warehouse.warehouseLocation LIKE :warehouseLocation', { warehouseLocation: `%${warehouseLocation.trim()}%` });
            }

            if (!search && warehouseBigo && warehouseBigo.trim()) {
                queryBuilder.andWhere('warehouse.warehouseBigo LIKE :warehouseBigo', { warehouseBigo: `%${warehouseBigo.trim()}%` });
            }

            const [warehouse, total] = await queryBuilder.getManyAndCount();

            await this.logService.createDetailedLog({
                moduleName: '창고관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: '창고 목록 검색',
                details: `창고 검색 조회: ${total}개 중 ${warehouse.length}개 (검색어: ${search || '없음'})`,
            });

            return { warehouse, total, page, limit, search, warehouseName, warehouseLocation, warehouseBigo };
        } catch (error) {
            throw error;
        }
    }

    async getAllWarehouses(): Promise<Warehouse[]> {
        return this.warehouseRepository.find({
            order: { warehouseCode: 'ASC' }
        });
    }

    async getWarehouseById(id: number, username: string): Promise<Warehouse> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id },
        });

        if (!warehouse) {
            throw new NotFoundException(`ID ${id}인 창고를 찾을 수 없습니다.`);
        }

        await this.logService.createDetailedLog({
            moduleName: '창고관리 조회',
            action: 'READ_SUCCESS',
            username,
            targetId: id.toString(),
            targetName: warehouse.warehouseName,
            details: `창고 상세 조회: ${warehouse.warehouseName}`,
        });

        return warehouse;
    }
}