import { Module } from '@nestjs/common';
import { ClaimCountKpiModule } from './claim-count/claim-count-kpi.module';
import { ProductCostKpiModule } from './product-cost/product-cost-kpi.module';

@Module({
    imports: [
        ClaimCountKpiModule,
        ProductCostKpiModule,
    ],
    exports: [
        ClaimCountKpiModule,
        ProductCostKpiModule,
    ],
})
export class KpiModule {}
