import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { UpdateReceivingDto } from '../dto/update-receiving.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ReceivingUpdateService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        private readonly logService: logService,
    ) {}

    /**
     * ID로 입고 정보를 수정합니다.
     */
    async updateReceiving(id: number, updateReceivingDto: UpdateReceivingDto, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!existingReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 날짜 변환 처리
            const processedData: any = { ...updateReceivingDto };
            if (updateReceivingDto.receivingDate) {
                processedData.receivingDate = new Date(updateReceivingDto.receivingDate);
            }

            // 업데이트 실행
            await this.receivingRepository.update(id, processedData);

            // 업데이트된 정보 조회
            const updatedReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!updatedReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: updatedReceiving.receivingCode,
                details: `입고 정보 수정: ${updatedReceiving.receivingCode} (품목: ${updatedReceiving.productName}, 수량: ${updatedReceiving.quantity}, 승인상태: ${updatedReceiving.approvalStatus})`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 수정되었습니다.',
                receiving: updatedReceiving
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`입고 정보 수정 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
