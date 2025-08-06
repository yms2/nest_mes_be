import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProcessInfo } from '../entities/process.entity';
import { CreateProcessInfoDto } from '../dto/process-create.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProcessUpdateService {
    constructor(
        @InjectRepository(ProcessInfo)
        private readonly processInfoRepository: Repository<ProcessInfo>,
    ) {}

    async updateProcessInfo(
        id: number,
        createProcessInfoDto: CreateProcessInfoDto,
        updatedBy: string,
    ): Promise<ProcessInfo> {
        const existingProcessInfo = await this.findProcessInfoById(id);

        if (
            createProcessInfoDto.processCode &&
            createProcessInfoDto.processCode !== existingProcessInfo.processCode
        ) {
            await this.checkProcessCodeDuplicate(createProcessInfoDto.processCode, id);
        }

        const updatedProcessInfo = {
            ...existingProcessInfo,
            ...createProcessInfoDto,
            updatedBy,
            updatedAt: new Date(),
        };

        return this.processInfoRepository.save(updatedProcessInfo);
    }

    private async findProcessInfoById(id: number): Promise<ProcessInfo> {
        const processInfo = await this.processInfoRepository.findOne({
            where: { id },
        });

        if (!processInfo) {
            throw new NotFoundException('공정 정보를 찾을 수 없습니다.');
        }

        return processInfo;
    }

    private async checkProcessCodeDuplicate(processCode: string, currentProcessId?: number): Promise<void> {
        const existingProcess = await this.processInfoRepository.findOne({
            where: { processCode },
        });

        if (existingProcess && existingProcess.id !== currentProcessId) {
            throw new BadRequestException('이미 존재하는 공정 코드입니다.');
        }
    }
}