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
        warehouseZone?: string,
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
                    '(warehouse.warehouseCode LIKE :search OR warehouse.warehouseName LIKE :search OR warehouse.warehouseLocation LIKE :search OR warehouse.warehouseBigo LIKE :search OR warehouse.warehouseZone LIKE :search)',
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

            if (!search && warehouseZone && warehouseZone.trim()) {
                queryBuilder.andWhere('warehouse.warehouseZone LIKE :warehouseZone', { warehouseZone: `%${warehouseZone.trim()}%` });
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

            return { warehouse, total, page, limit, search, warehouseName, warehouseLocation, warehouseBigo, warehouseZone };
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

    /**
     * 창고별 구역 정보를 그룹핑하여 조회
     * 창고1에 구역이 없으면 "전체", 있으면 구역별로 표시
     */
    async getWarehouseWithZones(username: string) {
        try {
            const warehouses = await this.warehouseRepository.find({
                order: { warehouseName: 'ASC', warehouseZone: 'ASC' }
            });

            // 창고명별로 그룹핑
            const warehouseGroups = warehouses.reduce((acc, warehouse) => {
                const warehouseName = warehouse.warehouseName;
                
                if (!acc[warehouseName]) {
                    acc[warehouseName] = {
                        warehouseName,
                        hasZones: false,
                        zones: [],
                        mainWarehouse: null
                    };
                }

                // 구역이 있는지 확인
                if (warehouse.warehouseZone) {
                    acc[warehouseName].hasZones = true;
                    acc[warehouseName].zones.push({
                        id: warehouse.id,
                        warehouseCode: warehouse.warehouseCode,
                        warehouseZone: warehouse.warehouseZone,
                        warehouseLocation: warehouse.warehouseLocation,
                        warehouseBigo: warehouse.warehouseBigo
                    });
                } else {
                    // 구역이 없는 경우 전체 창고로 처리
                    acc[warehouseName].mainWarehouse = {
                        id: warehouse.id,
                        warehouseCode: warehouse.warehouseCode,
                        warehouseZone: '전체',
                        warehouseLocation: warehouse.warehouseLocation,
                        warehouseBigo: warehouse.warehouseBigo
                    };
                }

                return acc;
            }, {});

            // 배열 형태로 변환
            const result = Object.values(warehouseGroups);

            await this.logService.createDetailedLog({
                moduleName: '창고관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: '창고 구역 그룹핑 조회',
                details: `창고 구역 정보 조회: ${result.length}개 창고`,
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 특정 창고의 구역 목록 조회
     */
    async getWarehouseZones(warehouseName: string, username: string) {
        try {
            const warehouses = await this.warehouseRepository.find({
                where: { warehouseName },
                order: { warehouseZone: 'ASC' }
            });

            if (warehouses.length === 0) {
                throw new NotFoundException(`${warehouseName} 창고를 찾을 수 없습니다.`);
            }

            const zones = warehouses.map(warehouse => ({
                id: warehouse.id,
                warehouseCode: warehouse.warehouseCode,
                warehouseName: warehouse.warehouseName,
                warehouseZone: warehouse.warehouseZone || '전체',
                warehouseLocation: warehouse.warehouseLocation,
                warehouseBigo: warehouse.warehouseBigo
            }));

            await this.logService.createDetailedLog({
                moduleName: '창고관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: warehouseName,
                targetName: `${warehouseName} 구역 목록`,
                details: `${warehouseName} 구역 조회: ${zones.length}개`,
            });

            return zones;
        } catch (error) {
            throw error;
        }
    }
}