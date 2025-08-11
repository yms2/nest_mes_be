import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessInfo } from '../entities/process.entity';
import { CreateProcessInfoDto } from '../dto/process-create.dto';

@Injectable()
export class ProcessCreateService {
    constructor(
        @InjectRepository(ProcessInfo)
        private readonly processInfoRepository: Repository<ProcessInfo>,
    ) {}

    async createProcessInfo(
        createProcessInfoDto: CreateProcessInfoDto,
        createdBy: string,
    ): Promise<ProcessInfo> {
        const newProcessCode = await this.generateProcessCode();
        const processEntity = this.createProcessEntity(
            createProcessInfoDto,
            newProcessCode,
            createdBy,
        );
        return this.processInfoRepository.save(processEntity);
    }

    private async generateProcessCode(): Promise<string> {
        const [lastProcess] = await this.processInfoRepository.find({
          order: { processCode: 'DESC' },
          take: 1,
        });
    
        const nextNumber = lastProcess?.processCode
          ? parseInt(lastProcess.processCode.slice(1), 10) + 1
          : 1;
    
        return `PRC${nextNumber.toString().padStart(3, '0')}`;
      }
    
    private createProcessEntity(
        dto: CreateProcessInfoDto,
        processCode: string,
        createdBy: string,
    ): ProcessInfo {
        const entityData: Partial<ProcessInfo> = {
            processCode,
            processName: dto.processName,
            createdBy,
        };
        
        if (dto.description !== undefined) {
            entityData.description = dto.description;
        }
        
        return this.processInfoRepository.create(entityData);
    }
}