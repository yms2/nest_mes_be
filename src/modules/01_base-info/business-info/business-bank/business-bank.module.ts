import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessBank } from './entities/business-bank.entity';
import {
  BusinessBankCreateService,
  BusinessBankReadService,
  BusinessBankSearchService,
} from './services';
import {
  BusinessBankCreateController,
  BusinessBankReadController,
} from './controllers';
import { CommonModule } from '../../../../common/common.module'; // ✅ 공통 모듈 import
import { LogModule } from '../../../log/log.module';
import { BusinessBankHandler } from './handlers/business-bank.handler';

@Module({
  imports: [
    CommonModule, // ✅ 공통 모듈 하나만 import
    LogModule, // ✅ 로그 모듈 import
    TypeOrmModule.forFeature([BusinessBank]), // forFeature는 모듈별로 추가
  ],
  controllers: [
    BusinessBankCreateController,
    BusinessBankReadController,
  ],
  providers: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankSearchService,
    // ✅ 핸들러 추가
    BusinessBankHandler,
  ],
  exports: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankSearchService,
  ], // 서비스는 다른 모듈에서 사용할 수 있도록 exports에 추가
})
export class BusinessBankModule {}