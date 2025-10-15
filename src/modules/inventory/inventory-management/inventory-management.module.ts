import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryLot } from './entities/inventory-lot.entity';
import { ProductInfo } from 'src/modules/base-info/product-info/product_sample/entities/product-info.entity';

import * as controllers from './controllers';
import * as services from './services';
import { InventoryLotService } from './services/inventory-lot.service';
import { InventoryLotController } from './controllers/inventory-lot.controller';
import { InventoryListController } from './controllers/inventory-list.controller';
import { InventoryLogsModule } from '../inventory-logs/inventory-logs.module';
import { LogModule } from 'src/modules/log/log.module';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryLot, ProductInfo]),
    InventoryLogsModule,
    LogModule,
  ],
  controllers: [...controllerArray, InventoryLotController, InventoryListController],
  providers: [...serviceArray, InventoryLotService],
  exports: [...serviceArray, InventoryLotService],
})
export class InventoryManagementModule {}
