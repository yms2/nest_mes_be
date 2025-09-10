import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryAdjustmentLog } from './entities/inventory-adjustment-log.entity';

import * as controllers from './controllers';
import * as services from './services';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryAdjustmentLog]),
  ],
  controllers: controllerArray,
  providers: [...serviceArray],
  exports: [...serviceArray],
})
export class InventoryLogsModule {}
