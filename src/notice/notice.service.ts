import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from './notice.entity';
import { Like, Repository } from 'typeorm';
import { QueryNoticeDto } from './notice.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async notices(
    QueryNoticeDto: QueryNoticeDto,
  ): Promise<{ notices: Notice[]; totalCount: number; page: number; limit: number }> {
    const { page, limit, search } = QueryNoticeDto;
    const [notices, total] = await this.noticeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
      where: {
        title: search ? Like(`%${search}%`) : undefined,
      },
    });
    return {
      notices,
      totalCount: total,
      page,
      limit,
    };
  }

  async notice(id: string): Promise<Notice> {
    const notice = await this.noticeRepository.findOneBy({ id: parseInt(id) });
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    return notice;
  }

  async createNotice(notice: Notice): Promise<Notice> {
    return this.noticeRepository.save(notice);
  }

  async deleteNotice(id: string): Promise<void> {
    await this.noticeRepository.delete(parseInt(id));
  }

  async updateNotice(id: string, data: Notice): Promise<Notice> {
    const notice = await this.noticeRepository.findOneBy({ id: parseInt(id) });
    if (!notice) {
      throw new NotFoundException('Notice not found');
    }
    notice.title = data.title;
    notice.content = data.content;
    return this.noticeRepository.save(notice);
  }
}
