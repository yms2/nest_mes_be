import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseCode, SubCode } from './entities/setting.entity';
import * as services from './services';
import * as controllers from './controllers';
import { CommonModule } from '@/common/common.module';
import { LogModule } from '@/modules/log/log.module';

const serviceArray = Object.values(services);
const controllerArray = Object.values(controllers);

@Module({
    imports: [
        CommonModule,
        LogModule,
        TypeOrmModule.forFeature([
            BaseCode,  // 기본 코드 엔티티
            SubCode,   // 서브 코드 엔티티
        ]),
    ],
    controllers: controllerArray,
    providers: serviceArray,
    exports: serviceArray,
})
export class SettingInfoModule {}
