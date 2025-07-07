import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from '../entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  async createSimpleLog(params: { moduleName: string; action: string; username: string }): Promise<void> {
    const { moduleName, action, username } = params;

    const log = this.logRepository.create({
      moduleName,
      action,
      username,
    });

    await this.logRepository.save(log);
  }
}
