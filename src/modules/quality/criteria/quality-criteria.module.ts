import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityCriteria } from './entities/quality-criteria.entity';
import { LogModule } from '@/modules/log/log.module';
import { CriteriaHandler } from './handler/criteria.handler';
import { MulterModule } from '@nestjs/platform-express';

import * as controllers from './controllers';
import * as services from './services';

const controllerArray = Object.values(controllers);
const serviceArray = Object.values(services);

@Module({
    imports: [
        TypeOrmModule.forFeature([QualityCriteria]),
        LogModule,
        MulterModule.register({
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB 제한
            },
        }),
    ],
    controllers: controllerArray,
    providers: [...serviceArray, CriteriaHandler],
    exports: [...serviceArray],
})
export class QualityCriteriaModule {}