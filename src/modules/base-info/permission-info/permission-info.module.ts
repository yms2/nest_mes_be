import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorityManages, SubMenu, mainMenu } from './entities/permission.entity';
import { PermissionReadService } from './services/permission-read.service';
import { PermissionReadController } from './controllers/permission-read.controller';
import { PermissionCreateService } from './services/permission-create.service';
import { PermissionCreateController } from './controllers/permission-create.controller';
import { PermissionCreateHandler } from './handlers/permission-create.handler';
import { PermissionUpdateService } from './services/permission-update.service';
import { PermissionUpdateController } from './controllers/permission-update.controller';
import { PermissionUpdateHandler } from './handlers/permission-update.handler';
import { PermissionDeleteService } from './services/permission-delete.service';
import { PermissionDeleteController } from './controllers/permission-delete.controller';
import { PermissionDeleteHandler } from './handlers/permission-delete.handler';
import { CommonModule } from '../../../common/common.module';
import { LogModule } from '../../log/log.module';

@Module({
  imports: [
    CommonModule,
    LogModule,
    TypeOrmModule.forFeature([
      AuthorityManages,  // 권한 관리 정보 엔티티
      SubMenu,           // 서브 메뉴 엔티티
      mainMenu,          // 메인 메뉴 엔티티
    ]),
  ],
  controllers: [
    PermissionReadController,  // 권한 정보 조회 컨트롤러
    PermissionCreateController, // 권한 정보 등록 컨트롤러
    PermissionUpdateController, // 권한 정보 업데이트 컨트롤러
    PermissionDeleteController, // 권한 정보 삭제 컨트롤러
  ],
  providers: [
    PermissionReadService,     // 권한 정보 조회 서비스
    PermissionCreateService,   // 권한 정보 등록 서비스
    PermissionCreateHandler,   // 권한 정보 등록 핸들러
    PermissionUpdateService,   // 권한 정보 업데이트 서비스
    PermissionUpdateHandler,   // 권한 정보 업데이트 핸들러
    PermissionDeleteService,   // 권한 정보 삭제 서비스
    PermissionDeleteHandler,   // 권한 정보 삭제 핸들러
  ],
  exports: [
    PermissionReadService,     // 다른 모듈에서 사용할 수 있도록 서비스 내보내기
    PermissionCreateService,   // 다른 모듈에서 사용할 수 있도록 등록 서비스 내보내기
    PermissionUpdateService,   // 다른 모듈에서 사용할 수 있도록 업데이트 서비스 내보내기
    PermissionDeleteService,   // 다른 모듈에서 사용할 수 있도록 삭제 서비스 내보내기
  ],
})
export class PermissionInfoModule {}
