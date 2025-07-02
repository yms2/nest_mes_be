import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { Qna } from './qna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Qna])],
  controllers: [QnaController],
  providers: [QnaService],
})
export class QnaModule {}
