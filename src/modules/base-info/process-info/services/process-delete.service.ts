import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessInfo } from '../entities/process.entity';
import { ProcessUpdateService } from './process-update.service';

@Injectable()
export class ProcessDeleteService {
    constructor(
        @InjectRepository(ProcessInfo)
        private readonly processInfoRepository: Repository<ProcessInfo>,
        private readonly processUpdateService: ProcessUpdateService,
    ) {}

    async hardDeleteProcessInfo(id: number): Promise<void> {
        const existingProcessInfo = await this.processUpdateService.findProcessInfoById(id);

        await this.processInfoRepository.remove(existingProcessInfo);
    }
}
