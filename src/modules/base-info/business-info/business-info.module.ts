import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessInfo } from './entities/business-info.entity';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoCreateService } from './services/business-info-create.service';
import { BusinessInfoReadService } from './services/business-info-read.service';
import { BusinessInfoSearchService } from './services/business-info-search.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfo]),
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
    JwtAuthGuard,
  ],
  exports: [BusinessInfoCreateService, BusinessInfoReadService, BusinessInfoSearchService],
})
export class BusinessInfoModule {}
