import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { logService } from '@/modules/log/Services/log.service';

@Injectable()
export class WarehouseDeleteService {
    constructor(
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
        private readonly logService: logService,
    ) {}

    async deleteWarehouse(id: number, username: string): Promise<Warehouse> {
        const existingWarehouse = await this.warehouseRepository.findOne({
            where: { id },
        });

        if (!existingWarehouse) {
            throw new NotFoundException(`ID ${id}인 창고를 찾을 수 없습니다.`);
        }

        const deletedWarehouse = await this.warehouseRepository.remove(existingWarehouse);
        
        await this.logService.createDetailedLog({
            moduleName: '창고관리 삭제',
            action: 'DELETE_SUCCESS',
            username,
            targetId: id.toString(),
            targetName: existingWarehouse.warehouseName,
        });

        return deletedWarehouse;
    }

}