import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoCreateService } from './services/business-info-create.service';
import { BusinessInfoReadService } from './services/business-info-read.service';
import { BusinessInfoSearchService } from './services/business-info-search.service';
import { BusinessInfoUpdateService } from './services/business-info-update.service';
import { BusinessInfoDeleteService } from './services/business-info-delete.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LogModule } from '../../log/log.module';

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
  controllers: [BusinessInfoController],
  providers: [
    BusinessInfoCreateService,
    BusinessInfoReadService,
    BusinessInfoSearchService,
    BusinessInfoUpdateService,
    BusinessInfoDeleteService,
    JwtAuthGuard,
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
