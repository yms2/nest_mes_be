import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Notice } from './notice.entity';
import { QueryNoticeDto } from './notice.dto';

@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  notices(
    @Query() QueryNoticeDto: QueryNoticeDto,
  ): Promise<{ notices: Notice[]; totalCount: number }> {
    return this.noticeService.notices(QueryNoticeDto);
  }

  @Get(':id')
  getNotice(@Param('id') id: string): Promise<Notice> {
    return this.noticeService.notice(id);
  }

  @Post()
  createNotice(@Body() notice: Notice): Promise<Notice> {
    return this.noticeService.createNotice(notice);
  }

  @Delete(':id')
  deleteNotice(@Param('id') id: string): Promise<void> {
    return this.noticeService.deleteNotice(id);
  }

  @Put(':id')
  updateNotice(@Param('id') id: string, @Body() data: Notice): Promise<Notice> {
    return this.noticeService.updateNotice(id, data);
  }
}
