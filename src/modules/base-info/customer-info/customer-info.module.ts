import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerInfo } from './entities/custmoer-info.entity';
import { CustomerInfoCreateService } from './services';
import { CustomerInfoCreateController } from './controllers';
import { CommonModule } from '../../../common/common.module'; // ✅ 공통 모듈 import
import { LogModule } from '../../log/log.module';
@Module({
  imports: [
    CommonModule, // ✅ 공통 모듈 하나만 import
    LogModule, // ✅ 로그 모듈 import
    TypeOrmModule.forFeature([CustomerInfo]), // forFeature는 모듈별로 추가
  ],
  controllers: [CustomerInfoCreateController ], // 컨트롤러는 아직 정의되지 않았으므로 빈 배열
  providers: [CustomerInfoCreateService],
  exports: [CustomerInfoCreateService],
})
export class CustomerInfoModule {}
