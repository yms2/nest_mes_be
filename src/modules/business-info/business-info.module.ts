import { Module } from '@nestjs/common';
import { EstimateManagementModule } from './estimatemanagement-info/estimatemanagement.module';

@Module({
    imports: [EstimateManagementModule],
    exports: [EstimateManagementModule],
})
export class BusinessInfoModule {}