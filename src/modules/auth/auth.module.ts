import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterModule } from '../register/register.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { GroupPermissionService } from './GroupPermission/GroupPermission.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authoritymanages } from './GroupPermission/GroupPermission.entity';
import { MainMenus } from './GroupPermission/MainMenu.entity';
import { SubMenus } from './GroupPermission/SubMenu.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    RegisterModule,
    TypeOrmModule.forFeature([authoritymanages, MainMenus, SubMenus]),
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
  providers: [AuthService, GroupPermissionService, JwtAuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
