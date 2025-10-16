import { Module } from '@nestjs/common';
import { InventoryManagementModule } from './inventory-management/inventory-management.module';
import { InventoryLogsModule } from './inventory-logs/inventory-logs.module';
import { WarehouseManagementModule } from './warehouse/warehouse-management.module';
import { InventoryIssueModule } from './inventory-issue/inventory-issue.module';

@Module({
   imports: [
     InventoryManagementModule,
     InventoryLogsModule,
     WarehouseManagementModule,
     InventoryIssueModule,
   ],
   exports: [
     InventoryManagementModule,
     InventoryLogsModule,
     WarehouseManagementModule,
     InventoryIssueModule,
   ],
})
export class InventoryModule {}