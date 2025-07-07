import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { authoritymanages } from './GroupPermission.entity';
import { MainMenus } from './MainMenu.entity';
import { SubMenus } from './SubMenu.entity';
import { GroupPermissionService } from './GroupPermission.service';
import { GroupPermissionController } from './GroupPermission.controller';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [
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
  controllers: [GroupPermissionController],
  providers: [GroupPermissionService, JwtAuthGuard],
  exports: [GroupPermissionService],
})
export class GroupPermissionModule {}
 