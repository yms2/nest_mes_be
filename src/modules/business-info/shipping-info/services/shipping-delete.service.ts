import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from '../entities/shipping.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ShippingDeleteService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        private readonly logService: logService,
    ) {}

    /**
     * 출하 정보 삭제
     */
    async deleteShipping(id: number, username: string): Promise<{ message: string }> {
        try {
            // 출하 정보 조회
            const shipping = await this.shippingRepository.findOne({
                where: { id },
                relations: ['orderManagement']
            });

            if (!shipping) {
                throw new NotFoundException(`ID ${id}인 출하를 찾을 수 없습니다.`);
            }

            // 출하 정보 삭제
            await this.shippingRepository.delete(id);

            await this.logService.createDetailedLog({
                moduleName: '출하관리 삭제',
                action: 'DELETE_SUCCESS',
                username,
                targetId: id.toString(),
                targetName: shipping.shippingCode,
                details: `출하 정보 삭제: ${shipping.shippingCode}`,
            });

            return { message: `출하정보가 성공적으로 삭제되었습니다.` };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '출하관리 삭제',
                action: 'DELETE_FAIL',
                username,
                targetId: id.toString(),
                targetName: '출하 삭제 실패',
                details: `출하 삭제 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }

    /**
     * 출하 정보 일괄 삭제
     */
    async deleteMultipleShipping(
        ids: number[],
        username: string
    ): Promise<{ deletedCount: number; failedIds: number[]; message: string }> {
        try {
            const failedIds: number[] = [];
            let deletedCount = 0;
            const deletedShippingCodes: string[] = [];

            for (const id of ids) {
                try {
                    const shipping = await this.shippingRepository.findOne({
                        where: { id },
                        relations: ['orderManagement']
                    });

                    if (!shipping) {
                        failedIds.push(id);
                        continue;
                    }

                    await this.shippingRepository.delete(id);
                    deletedShippingCodes.push(shipping.shippingCode);
                    deletedCount++;
                } catch (error) {
                    failedIds.push(id);
                }
            }

            await this.logService.createDetailedLog({
                moduleName: '출하관리 일괄삭제',
                action: 'BATCH_DELETE_SUCCESS',
                username,
                targetId: '',
                targetName: '출하 일괄 삭제',
                details: `출하 일괄 삭제: ${deletedCount}개 성공, ${failedIds.length}개 실패`,
            });

            const message = deletedCount > 0 
                ? `${deletedCount}개의 출하가 성공적으로 삭제되었습니다.${failedIds.length > 0 ? ` (${failedIds.length}개 실패)` : ''}`
                : '삭제된 출하가 없습니다.';

            return { deletedCount, failedIds, message };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 수주코드별 출하 삭제
     */
    async deleteShippingByOrderCode(orderCode: string, username: string): Promise<{ deletedCount: number; message: string }> {
        try {
            // 해당 수주코드의 모든 출하 조회
            const shippings = await this.shippingRepository.find({
                where: { orderCode },
                relations: ['orderManagement']
            });

            if (shippings.length === 0) {
                throw new NotFoundException(`수주코드 '${orderCode}'에 해당하는 출하가 없습니다.`);
            }

            // 출하 정보 삭제
            await this.shippingRepository.delete({ orderCode });

            const shippingCodes = shippings.map(s => s.shippingCode);

            await this.logService.createDetailedLog({
                moduleName: '출하관리 수주별삭제',
                action: 'DELETE_BY_ORDER_SUCCESS',
                username,
                targetId: '',
                targetName: `수주코드: ${orderCode}`,
                details: `수주코드 '${orderCode}'의 출하 ${shippings.length}개 삭제: ${shippingCodes.join(', ')}`,
            });

            return { 
                deletedCount: shippings.length, 
                message: `수주코드 '${orderCode}'의 출하 ${shippings.length}개가 성공적으로 삭제되었습니다.` 
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '출하관리 수주별삭제',
                action: 'DELETE_BY_ORDER_FAIL',
                username,
                targetId: '',
                targetName: `수주코드: ${orderCode}`,
                details: `수주코드 '${orderCode}' 출하 삭제 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }
}
