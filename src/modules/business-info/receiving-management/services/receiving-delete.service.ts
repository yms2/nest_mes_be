import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ReceivingDeleteService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        private readonly logService: logService,
    ) {}

    /**
     * ID로 입고 정보를 삭제합니다.
     */
    async deleteReceiving(id: number, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!existingReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 삭제 실행
            await this.receivingRepository.delete(id);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'DELETE_SUCCESS',
                username,
                targetId: existingReceiving.receivingCode,
                details: `입고 정보 삭제: ${existingReceiving.receivingCode} (품목: ${existingReceiving.productName}, 수량: ${existingReceiving.quantity})`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 삭제되었습니다.',
                deletedReceiving: existingReceiving
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'DELETE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`입고 정보 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
