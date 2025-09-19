import { Module } from "@nestjs/common";
import { QualityCriteriaModule } from "./criteria/quality-criteria.module";

@Module({
    imports: [
        QualityCriteriaModule,
    ],
    exports: [
        QualityCriteriaModule,
    ],
})

export class QualityModule {}