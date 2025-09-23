import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationCreateService } from './services/notification-create.service';
import { NotificationCreateController } from './controllers/notification-create.controller';
import { NotificationReadService } from './services/notification-read.service';
import { NotificationReadController } from './controllers/notification-read.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification])
    ],
    providers: [NotificationCreateService, NotificationReadService],
    controllers: [NotificationCreateController, NotificationReadController],
    exports: [NotificationCreateService, NotificationReadService]
})
export class NotificationModule {}
