import { Module } from '@nestjs/common';
import { InventoryManagementModule } from './inventory-management/inventory-management.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';

@Module({
   imports: [
     InventoryManagementModule,
     InventoryLogsModule,
   ],
   exports: [
     InventoryManagementModule,
     InventoryLogsModule,
   ],
})
export class InventoryModule {}