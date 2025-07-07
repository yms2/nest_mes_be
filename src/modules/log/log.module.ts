import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';
import { LogService } from './Services/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  providers: [LogService],
  exports: [LogService],
}) 

export class LogModule {}