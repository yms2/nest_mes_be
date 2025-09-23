import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationCreateService } from './services/notification-create.service';
import { NotificationCreateController } from './controllers/notification-create.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification])
    ],
    providers: [NotificationCreateService],
    controllers: [NotificationCreateController],
    exports: [NotificationCreateService]
})
export class NotificationModule {}
