import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessInfo } from '../entities/process.entity';
import { SearchProcessInfoDto } from '../dto/process-search.dto';
import { DateFormatter } from 'src/common/utils/date-formatter.util';

@Injectable()
export class ProcessReadService {
    constructor(
        @InjectRepository(ProcessInfo)
        private readonly processInfoRepository: Repository<ProcessInfo>,
    ) {}

    async getProcessInfoByNumber(
        searchProcessInfoDto: SearchProcessInfoDto,
    ): Promise<ProcessInfo> {
        const { processCode } = searchProcessInfoDto;

        const processInfo = await this.processInfoRepository.findOne({
            where: { processCode },
        });

        if (!processInfo) {
            throw new NotFoundException('공정 정보를 찾을 수 없습니다.');
        }

        return DateFormatter.formatBusinessInfoDates(processInfo);
    }

    async getAllProcessInfo(
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: ProcessInfo[]; total: number; page: number; limit: number }> {
        const offset = (page - 1) * limit;

        const [data, total] = await this.processInfoRepository.findAndCount({
            order: { processCode: 'ASC' },
            skip: offset,
            take: limit,
        });

        return {
            data,
            total,
            page,
            limit,
        };
    }
}