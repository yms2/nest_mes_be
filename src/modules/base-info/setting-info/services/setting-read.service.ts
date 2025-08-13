import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCode, SubCode } from '../entities/setting.entity';

@Injectable()
export class SettingReadService {
    constructor(
        @InjectRepository(BaseCode)
        private readonly baseCodeRepository: Repository<BaseCode>,
        @InjectRepository(SubCode)
        private readonly subCodeRepository: Repository<SubCode>,
    ) {}

    async getBaseCode() {
        const baseCode = await this.baseCodeRepository.find();
        return baseCode;
    }
    async getBaseCodeWithSubs(): Promise<BaseCode[]> {
        return this.baseCodeRepository.find({
          relations: ['subCodes'], // 관계 로딩
          order: {
            id: 'ASC', // 필요 시 정렬
          },
        });
      }
      
      async getSubCodesByBase(baseCodeId: number): Promise<SubCode[]> {
        return this.subCodeRepository.find({
          where: { baseCode: { id: baseCodeId } },
          order: { id: 'ASC' },
        });
      }


    }