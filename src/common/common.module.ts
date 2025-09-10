import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { DevAuthGuard } from './guards/dev-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { AuthorityManages } from '../modules/base-info/permission-info/entities/permission.entity';

@Global() // ✅ 모든 모듈에서 자동으로 사용 가능
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AuthorityManages]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [DevAuthGuard, PermissionGuard],
  exports: [ConfigModule, TypeOrmModule, JwtModule, DevAuthGuard, PermissionGuard],
})
export class CommonModule {}
