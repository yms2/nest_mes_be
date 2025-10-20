import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/warehouse-create.dto';

@Injectable()
export class WarehouseCreateService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
    ) {}

    async createWarehouse(
        createWarehouseDto: CreateWarehouseDto,
        createdBy: string,
    ): Promise<Warehouse> {
        const newWarehouseCode = await this.generateWarehouseCode();
        const warehouseEntity = this.createWarehouseEntity(
            createWarehouseDto,
            newWarehouseCode,
            createdBy,
        );
        return this.warehouseRepository.save(warehouseEntity);
    }

    private async generateWarehouseCode(): Promise<string> {
        const [lastWarehouse] = await this.warehouseRepository.find({
            order: { warehouseCode: 'DESC' },
            take: 1,
        });
        const nextNumber = lastWarehouse?.warehouseCode
            ? parseInt(lastWarehouse.warehouseCode.slice(3), 10) + 1
            : 1;
        return `WH${nextNumber.toString().padStart(3, '0')}`;
    }

    async checkWarehouseCodeDuplicate(warehouseCode: string): Promise<boolean> {
        const existingWarehouse = await this.warehouseRepository.findOne({
            where: { warehouseCode },
        });
        return !!existingWarehouse;
    }

    private createWarehouseEntity(
        dto: CreateWarehouseDto,
        warehouseCode: string,
        createdBy: string,
    ): Warehouse {
        return this.warehouseRepository.create({
            ...dto,
            warehouseCode,
            warehouseZone: dto.warehouseZone || '전체', // 구역이 없으면 '전체'를 기본값으로 설정
            createdBy,
        });
    }
}
