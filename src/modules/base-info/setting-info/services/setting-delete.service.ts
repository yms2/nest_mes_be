import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCode } from '../entities/setting.entity';

@Injectable()
export class SettingDeleteService {
    constructor(
        @InjectRepository(SubCode)
        private readonly subCodeRepository: Repository<SubCode>,
    ) {}

    async deleteSubCode(id: number): Promise<void> {
        await this.subCodeRepository.delete(id);
    }

    async findSubCodeById(id: number): Promise<SubCode> {
        const subCode = await this.subCodeRepository.findOne({ where: { id } });
        if (!subCode) {
            throw new NotFoundException('서브 코드를 찾을 수 없습니다.');
        }
        return subCode;
    }
}