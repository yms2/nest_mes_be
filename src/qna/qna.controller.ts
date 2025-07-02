import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { QnaService } from './qna.service';
import { Qna } from './qna.entity';
import { QueryQnaDto } from './qna.dto';

@Controller('qnas')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Get()
  qnas(@Query() QueryQnaDto: QueryQnaDto): Promise<{ qnas: Qna[]; totalCount: number }> {
    return this.qnaService.qnas(QueryQnaDto);
  }

  @Get(':id')
  getQna(@Param('id') id: string): Promise<Qna> {
    return this.qnaService.qna(id);
  }

  @Post()
  createQna(@Body() qna: Qna): Promise<Qna> {
    return this.qnaService.createQna(qna);
  }

  @Delete(':id')
  deleteQna(@Param('id') id: string): Promise<void> {
    return this.qnaService.deleteQna(id);
  }

  @Post(':id/reply')
  async replyQna(@Param('id') id: string, @Body('reply') reply: string): Promise<Qna> {
    const qna = await this.qnaService.replyQna(id, reply);
    await this.qnaService.sendEmail(id, reply);
    return qna;
  }

  @Post('send')
  sendEmail(@Param('id') id: string, @Body('text') text: string): Promise<Qna> {
    return this.qnaService.sendEmail(id, text);
  }

  @Put(':id')
  updateQna(@Param('id') id: string, @Body() data: Qna): Promise<Qna> {
    return this.qnaService.updateQna(id, data);
  }
}
