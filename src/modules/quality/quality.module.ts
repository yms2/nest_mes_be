import { Module } from "@nestjs/common";
import { QualityCriteriaModule } from "./criteria/quality-criteria.module";
import { QualityInspectionModule } from "./inspection/quality-inspection.module";
import { ClaimModule } from "./claim/claim.module";

@Module({
    imports: [
        QualityCriteriaModule,
        QualityInspectionModule,
        ClaimModule,
    ],
    exports: [
        QualityCriteriaModule,
        QualityInspectionModule,
        ClaimModule,
    ],
})

export class QualityModule {}