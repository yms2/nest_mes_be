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
  targetId?: string; // 예: 사업자번호, 거래처코드 등
  targetName?: string; // 예: 사업장명, 거래처명 등
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class logService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  // 공용 단순 로그
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

  // 공용 상세 로그
  async createDetailedLog(params: DetailedLogParams): Promise<void> {
    const { moduleName, action, username, details, targetId, targetName, ipAddress, userAgent } = params;

    let logDetails = `${moduleName} - ${action}`;

    if (targetId) logDetails += ` | 대상 ID: ${targetId}`;
    if (targetName) logDetails += ` | 대상명: ${targetName}`;
    if (details) logDetails += ` | ${details}`;
    if (ipAddress) logDetails += ` | IP: ${ipAddress}`;
    if (userAgent) logDetails += ` | UserAgent: ${userAgent}`;

    const log = this.logRepository.create({
      moduleName,
      action,
      username,
      details: logDetails,
    });

    await this.logRepository.save(log);
  }

  // 모듈별 편의 메서드 (선택)
  async createModuleLog(
    moduleName: string,
    params: Omit<DetailedLogParams, 'moduleName'>,
  ): Promise<void> {
    await this.createDetailedLog({
      moduleName,
      ...params,
    });
  }
}
