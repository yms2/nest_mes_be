import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/warehouse-create.dto';

@Injectable()
export class WarehouseUpdateService {
    
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
    ) {}

    async updateWarehouse(
        id: number,
        createWarehouseDto: CreateWarehouseDto,
        updatedBy: string,
    ): Promise<Warehouse> {
        const existingWarehouse = await this.findWarehouseById(id);

        const updatedWarehouse = {
            ...existingWarehouse,
            ...createWarehouseDto,
            updatedBy,
            updatedAt: new Date(),
        };

        return this.warehouseRepository.save(updatedWarehouse);
    }

    private async findWarehouseById(id: number): Promise<Warehouse> {
        const warehouse = await this.warehouseRepository.findOne({
            where: { id },
        });

        if (!warehouse) {
            throw new NotFoundException('창고 정보를 찾을 수 없습니다.');
        }

        return warehouse;
    }
}