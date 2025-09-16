import { Module } from '@nestjs/common';
import { ProductionPlanModule } from './plan/production-plan.module';

@Module({
    imports: [ProductionPlanModule],
    exports: [ProductionPlanModule],
})
export class ProductionModule {}