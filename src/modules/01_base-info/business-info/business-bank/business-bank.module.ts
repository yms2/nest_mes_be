import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessBank } from './entities/business-bank.entity';
import {
  BusinessBankCreateService,
  BusinessBankReadService,
  BusinessBankUpdateService,
} from './services';
import {
  BusinessBankCreateController,
  BusinessBankReadController,
  BusinessBankUpdateController,
} from './controllers';
import { CommonModule } from '../../../../common/common.module'; // ✅ 공통 모듈 import
import { LogModule } from '../../../log/log.module';
import { BusinessBankHandler } from './handlers/business-bank.handler';
import { UpdateBusinessBankHandler } from './handlers/update-business-bank.handler';

@Module({
  imports: [
    CommonModule, // ✅ 공통 모듈 하나만 import
    LogModule, // ✅ 로그 모듈 import
    TypeOrmModule.forFeature([BusinessBank]), // forFeature는 모듈별로 추가
  ],
  controllers: [
    BusinessBankCreateController,
    BusinessBankReadController,
    BusinessBankUpdateController, // ✅ 컨트롤러 추가
  ],
  providers: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankUpdateService, // ✅ 서비스 추가
    // ✅ 핸들러 추가
    BusinessBankHandler,
    // ✅ 핸들러는 서비스와 함께 사용되므로 providers에 추가
    UpdateBusinessBankHandler, // ✅ 업데이트 서비스 추가
  ],
  exports: [
    BusinessBankCreateService,
    BusinessBankReadService,
    BusinessBankUpdateService,
  ], // 서비스는 다른 모듈에서 사용할 수 있도록 exports에 추가
})
export class BusinessBankModule {}