import { Module } from '@nestjs/common';
import { APMService } from './services/apm.service';
import { APMController } from './controllers/apm.controller';
import { APMMiddleware } from './middleware/apm.middleware';

@Module({
  providers: [APMService],
  controllers: [APMController],
  exports: [APMService],
})
export class APMModule {}
