import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../../quality/claim/entities/claim.entity';
import { ClaimCountKpiService } from './services/claim-count-kpi.service';
import { ClaimCountKpiController } from './controllers/claim-count-kpi.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Claim]),
    ],
    controllers: [
        ClaimCountKpiController,
    ],
    providers: [
        ClaimCountKpiService,
    ],
    exports: [
        ClaimCountKpiService,
    ],
})
export class ClaimCountKpiModule {}
