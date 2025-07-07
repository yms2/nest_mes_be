import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';
import { logService } from './Services/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  providers: [logService],
  exports: [logService],
})
export class LogModule {}
