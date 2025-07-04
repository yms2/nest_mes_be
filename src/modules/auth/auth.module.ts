import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterModule } from '../register/register.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { GroupPermissionModule } from './GroupPermission/GroupPermission.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    RegisterModule,
    GroupPermissionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
