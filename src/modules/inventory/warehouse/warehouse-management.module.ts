import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';

import * as controllers from './controllers';
import * as services from './services';

import { CommonModule } from '@/common/common.module';
import { LogModule } from '@/modules/log/log.module';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([Warehouse]),
        CommonModule,
        LogModule,
    ],
    controllers: controllerArray,
    providers: [...serviceArray],
    exports: [...serviceArray],
})
export class WarehouseManagementModule {}