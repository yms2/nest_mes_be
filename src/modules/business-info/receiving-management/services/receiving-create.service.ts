import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { CreateReceivingDto } from '../dto/create-receiving.dto';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class ReceivingCreateService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        private readonly logService: logService,
    ) {}

    /**
     * 입고 정보를 생성합니다.
     */
    async createReceiving(createReceivingDto: CreateReceivingDto, username: string = 'system') {
        try {
            // 입고 코드 자동 생성
            const lastReceiving = await this.receivingRepository
                .createQueryBuilder('receiving')
                .orderBy('receiving.createdAt', 'DESC')
                .getOne();
            
            let nextCode = 'RCV001';
            if (lastReceiving && lastReceiving.receivingCode) {
                const lastNumber = parseInt(lastReceiving.receivingCode.replace('RCV', ''));
                nextCode = `RCV${String(lastNumber + 1).padStart(3, '0')}`;
            }

            // 입고 정보 생성
            const receiving = this.receivingRepository.create({
                receivingCode: nextCode,
                receivingDate: createReceivingDto.receivingDate ? new Date(createReceivingDto.receivingDate) : new Date(),
                orderCode: createReceivingDto.orderCode || '',
                productCode: createReceivingDto.productCode || '',
                productName: createReceivingDto.productName || '',
                quantity: createReceivingDto.quantity || 0,
                customerCode: createReceivingDto.customerCode || '',
                customerName: createReceivingDto.customerName || '',
                unit: createReceivingDto.unit || '',
                warehouseCode: createReceivingDto.warehouseCode || '',
                warehouseName: createReceivingDto.warehouseName || '',
                lotCode: createReceivingDto.lotCode || '',
                remark: createReceivingDto.remark || '',
                approvalStatus: createReceivingDto.approvalStatus || '대기',
                // 기본값 설정
                unreceivedQuantity: 0,
                unitPrice: 0,
                supplyPrice: 0,
                vat: 0,
                total: 0,
                projectCode: '',
                projectName: ''
            });

            // 저장
            const savedReceiving = await this.receivingRepository.save(receiving);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedReceiving.receivingCode,
                details: `입고 정보 생성: ${savedReceiving.receivingCode} (품목: ${savedReceiving.productName}, 수량: ${savedReceiving.quantity}, 승인상태: ${savedReceiving.approvalStatus})`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 등록되었습니다.',
                receiving: savedReceiving
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'CREATE_FAILED',
                username,
                targetId: createReceivingDto.orderCode || 'UNKNOWN',
                details: error.message
            });

            throw new BadRequestException(`입고 정보 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
