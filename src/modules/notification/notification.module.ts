import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { OrderInfo } from '@/modules/business-info/order-info/entities/order-info.entity';
import { QualityInspection } from '@/modules/quality/inspection/entities/quality-inspection.entity';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { LogModule } from '@/modules/log/log.module';
import { NotificationCreateService } from './services/notification-create.service';
import { NotificationCreateController } from './controllers/notification-create.controller';
import { NotificationReadService } from './services/notification-read.service';
import { NotificationReadController } from './controllers/notification-read.controller';
import { UnifiedApprovalService } from './services/unified-approval.service';
import { UnifiedApprovalController } from './controllers/unified-approval.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, OrderInfo, QualityInspection, OrderManagement]),
        LogModule
    ],
    providers: [NotificationCreateService, NotificationReadService, UnifiedApprovalService],
    controllers: [NotificationCreateController, NotificationReadController, UnifiedApprovalController],
    exports: [NotificationCreateService, NotificationReadService, UnifiedApprovalService]
})
export class NotificationModule {}
