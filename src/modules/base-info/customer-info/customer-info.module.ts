import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerInfo } from './entities/custmoer-info.entity';
import { CustomerInfoCreateService, CustomerInfoReadService,CustomerInfoSearchService, CustomerInfoUpdateService, CustomerInfoDeleteService  } from './services';
import { CustomerInfoCreateController, CustomerInfoReadController, CustomerInfoUpdateController, CustomerInfoDeleteController } from './controllers';
import { CommonModule } from '../../../common/common.module'; // ✅ 공통 모듈 import
import { LogModule } from '../../log/log.module';
import { CustomerInfoHandler } from './handlers/customer-info.handler';
@Module({
  imports: [
    CommonModule, // ✅ 공통 모듈 하나만 import
    LogModule, // ✅ 로그 모듈 import
    TypeOrmModule.forFeature([CustomerInfo]), // forFeature는 모듈별로 추가
  ],
  controllers: [
    CustomerInfoCreateController,
    CustomerInfoReadController,
    CustomerInfoUpdateController,
    CustomerInfoDeleteController, // 삭제 컨트롤러 추가
  ], // 컨트롤러는 아직 정의되지 않았으므로 빈 배열
  providers: [
    CustomerInfoCreateService, 
    CustomerInfoReadService, 
    CustomerInfoSearchService, 
    CustomerInfoUpdateService,
    CustomerInfoDeleteService, // 삭제 서비스 추가
    // ✅ 핸들러 추가
    CustomerInfoHandler
  ],
  exports: [
    CustomerInfoCreateService ,
    CustomerInfoReadService,
    CustomerInfoSearchService,
    CustomerInfoUpdateService,
    CustomerInfoDeleteService, // 삭제 서비스 추가
  ], // 서비스는 다른 모듈에서 사용할 수 있도록 exports에 추가
})
export class CustomerInfoModule {}
