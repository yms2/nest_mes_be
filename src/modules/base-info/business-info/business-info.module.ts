import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoCreateService, BusinessInfoReadService, BusinessInfoSearchService, BusinessInfoUpdateService, BusinessInfoDeleteService } from './services';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { LogModule } from '../../log/log.module';
import { BusinessInfoController, BusinessInfoCreateController, BusinessInfoUpdateController, BusinessInfoDeleteController} from './controllers'

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
