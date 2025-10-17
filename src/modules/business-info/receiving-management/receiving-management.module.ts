import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderInfo } from '../order-info/entities/order-info.entity';
import { Receiving } from './entities/receiving.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { InventoryLot } from '@/modules/inventory/inventory-management/entities/inventory-lot.entity';
import { InventoryAdjustmentLog } from '@/modules/inventory/inventory-logs/entities/inventory-adjustment-log.entity';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';
import { InventoryManagementModule } from '@/modules/inventory/inventory-management/inventory-management.module';
import { InventoryLogsModule } from '@/modules/inventory/inventory-logs/inventory-logs.module';
import * as controllers from './controllers';
import * as services from './services';
import { ReceivingCreateService } from './services/receiving-create.service';
import { ReceivingCreateController } from './controllers/receiving-create.controller';
import { ReceivingUpdateService } from './services/receiving-update.service';
import { ReceivingUpdateController } from './controllers/receiving-update.controller';
import { ReceivingDeleteService } from './services/receiving-delete.service';
import { ReceivingDeleteController } from './controllers/receiving-delete.controller';


const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderInfo, Receiving, Inventory, InventoryLot, InventoryAdjustmentLog]),
        CommonModule,
        LogModule,
        InventoryManagementModule,
        InventoryLogsModule,
    ],
    controllers: [...controllerArray, ReceivingCreateController, ReceivingUpdateController, ReceivingDeleteController],
    providers: [...serviceArray, ReceivingCreateService, ReceivingUpdateService, ReceivingDeleteService],
    exports: [...serviceArray, ReceivingCreateService, ReceivingUpdateService, ReceivingDeleteService],
})
export class ReceivingManagementModule {}
