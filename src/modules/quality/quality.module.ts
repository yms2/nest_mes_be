import { Module } from "@nestjs/common";
import { QualityCriteriaModule } from "./criteria/quality-criteria.module";
import { QualityInspectionModule } from "./inspection/quality-inspection.module";

@Module({
    imports: [
        QualityCriteriaModule,
        QualityInspectionModule,
    ],
    exports: [
        QualityCriteriaModule,
        QualityInspectionModule,
    ],
})

export class QualityModule {}