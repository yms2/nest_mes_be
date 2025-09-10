import { Module } from '@nestjs/common';
import { InventoryManagementModule } from './inventory-management/inventory-management.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';
import { WarehouseManagementModule } from './warehouse/warehouse-management.module';

@Module({
   imports: [
     InventoryManagementModule,
     InventoryLogsModule,
     WarehouseManagementModule,
   ],
   exports: [
     InventoryManagementModule,
     InventoryLogsModule,
     WarehouseManagementModule,
   ],
})
export class InventoryModule {}