import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from './qna.entity';
import { Like, Repository } from 'typeorm';
import { QueryQnaDto } from './qna.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class QnaService {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,
  ) {}

  async qnas(
    QueryQnaDto: QueryQnaDto,
  ): Promise<{ qnas: Qna[]; totalCount: number; page: number; limit: number }> {
    const { page, limit, search, category } = QueryQnaDto;

    const whereCondition = [
      {
        isReplied:
          category === 'all'
            ? undefined
            : category === 'replied'
              ? true
              : category === 'unReplied'
                ? false
                : undefined,
        title: Like(`%${search}%`),
      },
      {
        isReplied:
          category === 'all'
            ? undefined
            : category === 'replied'
              ? true
              : category === 'unReplied'
                ? false
                : undefined,
        email: Like(`%${search}%`),
      },
    ];

    const [qnas, total] = await this.qnaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
      where: whereCondition,
    });

    return {
      qnas,
      totalCount: total,
      page,
      limit,
    };
  }

  async qna(id: string): Promise<Qna> {
    const qna = await this.qnaRepository.findOneBy({ id: parseInt(id) });
    if (!qna) {
      throw new NotFoundException('Qna not found');
    }
    return qna;
  }

  async createQna(qna: Qna): Promise<Qna> {
    return this.qnaRepository.save(qna);
  }

  async deleteQna(id: string): Promise<void> {
    await this.qnaRepository.delete(parseInt(id));
  }

  async replyQna(id: string, reply: string): Promise<Qna> {
    const qna = await this.qnaRepository.findOneBy({ id: parseInt(id) });
    if (!qna) {
      throw new NotFoundException('Qna not found');
    }
    qna.reply = reply;
    qna.isReplied = true;
    return this.qnaRepository.save(qna);
  }

  async sendEmail(id: string, text: string): Promise<nodemailer.SentMessageInfo> {
    const qna = await this.qnaRepository.findOneBy({ id: parseInt(id) });
    if (!qna) {
      throw new NotFoundException('Qna not found');
    }
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: process.env.NODE_ENV === 'production' ? 465 : 587,
        secure: process.env.NODE_ENV === 'production',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const message = {
        from: process.env.EMAIL_USER,
        to: qna.email,
        subject: 'Q&A 답변 안내',
        text: text,
      };
      const result = await transporter.sendMail(message);
      if (result.accepted.length === 0) {
        throw new BadRequestException('Failed to send email');
      }
      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('이메일 전송 중 오류가 발생했습니다: ' + error.message);
    }
  }

  async updateQna(id: string, data: Qna): Promise<Qna> {
    const qna = await this.qnaRepository.findOneBy({ id: parseInt(id) });
    if (!qna) {
      throw new NotFoundException('Qna not found');
    }
    qna.reply = data.reply;
    qna.isReplied = data.isReplied;
    return this.qnaRepository.save(qna);
  }
}
