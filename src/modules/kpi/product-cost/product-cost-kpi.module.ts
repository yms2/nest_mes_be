import { Module } from '@nestjs/common';
import { ProductCostKpiService } from './services/product-cost-kpi.service';
import { ProductCostKpiController } from './controllers/product-cost-kpi.controller';

@Module({
    controllers: [
        ProductCostKpiController,
    ],
    providers: [
        ProductCostKpiService,
    ],
    exports: [
        ProductCostKpiService,
    ],
})
export class ProductCostKpiModule {}
