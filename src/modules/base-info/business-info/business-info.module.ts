import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoController } from './controllers/business-info.controller';
import { BusinessInfoCreateService } from './services/business-info-create.service';
import { BusinessInfoReadService } from './services/business-info-read.service';
import { BusinessInfoSearchService } from './services/business-info-search.service';
import { BusinessInfoUpdateService } from './services/business-info-update.service';
import { BusinessInfoDeleteService } from './services/business-info-delete.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { LogModule } from '../../log/log.module';
import { BusinessInfoCreateController } from './controllers/business-info-create.controller';
import { BusinessInfoUpdateController } from './controllers/business-info-update.controller';
import { BusinessInfoDeleteController } from './controllers/business-info-delete.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfo]),
    LogModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [
    BusinessInfoController,
    BusinessInfoCreateController,
    BusinessInfoUpdateController,
    BusinessInfoDeleteController,
  ],
  providers: [
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
  ],
  exports: [
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
  ],
})
export class BusinessInfoModule {}
