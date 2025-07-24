// purchase-order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './02-2_purchase/entities/purchase-file.entities';
import { PurchaseOrderService } from './02-2_purchase/services/purchase-file.service';
import { PurchaseOrderController } from './02-2_purchase/controllers/purchase-file.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder])],
  providers: [PurchaseOrderService],
  controllers: [PurchaseOrderController],
})
export class salesMoudule {}
