import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from '../entities/log.entity';

export interface SimpleLogParams {
  moduleName: string;
  action: string;
  username: string;
  details?: string;
}

export interface DetailedLogParams extends SimpleLogParams {
  businessNumber?: string;
  businessName?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class logService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  async createSimpleLog(params: SimpleLogParams): Promise<void> {
    const { moduleName, action, username, details } = params;

    const log = this.logRepository.create({
      moduleName,
      action,
      username,
      details: details || `${moduleName} - ${action}`,
    });

    await this.logRepository.save(log);
  }

  async createDetailedLog(params: DetailedLogParams): Promise<void> {
    const { moduleName, action, username, details, businessNumber, businessName } = params;

    let logDetails = `${moduleName} - ${action}`;

    if (businessNumber) {
      logDetails += ` | 사업자번호: ${businessNumber}`;
    }

    if (businessName) {
      logDetails += ` | 사업장명: ${businessName}`;
    }

    if (details) {
      logDetails += ` | ${details}`;
    }

    const log = this.logRepository.create({
      moduleName,
      action,
      username,
      details: logDetails,
    });

    await this.logRepository.save(log);
  }

  async createBusinessLog(params: {
    action: string;
    username: string;
    businessNumber?: string;
    businessName?: string;
    details?: string;
  }): Promise<void> {
    await this.createDetailedLog({
      moduleName: '사업장관리',
      ...params,
    });
  }
}
