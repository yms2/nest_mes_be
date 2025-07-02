import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';
import { SampleService } from './sample.service';
import { Sample } from './sample.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Sample])],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
