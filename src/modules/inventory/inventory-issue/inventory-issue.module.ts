import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryIssue } from './entities/inventory-issue.entity';
import { Inventory } from '../inventory-management/entities/inventory.entity';
import { InventoryIssueService } from './services/inventory-issue.service';
import { InventoryIssueController } from './controllers/inventory-issue.controller';
import { InventoryManagementModule } from '../inventory-management/inventory-management.module';
import { LogModule } from '@/modules/log/log.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryIssue, Inventory]),
        InventoryManagementModule,
        LogModule,
    ],
    controllers: [InventoryIssueController],
    providers: [InventoryIssueService],
    exports: [InventoryIssueService],
})
export class InventoryIssueModule {}
