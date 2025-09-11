
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../entities/order-info.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { CreateOrderInfoDto } from '../dto/create-order-info.dto';

@Injectable()
export class OrderCreateService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        private readonly logService: logService,
    ) {}

    /**
     * 발주 정보를 등록합니다.
     */
    async createOrderInfo(createOrderInfoDto: CreateOrderInfoDto) {
        try {

            // 발주 정보 생성
            const orderInfo = this.orderInfoRepository.create({
                ...createOrderInfoDto,
                orderDate: this.convertToDate(createOrderInfoDto.orderDate),
                deliveryDate: this.convertToDate(createOrderInfoDto.deliveryDate),
                createdBy: 'system',
                updatedBy: 'system'
            } as Partial<OrderInfo>);

            // 발주 정보 저장
            const savedOrderInfo = await this.orderInfoRepository.save(orderInfo);


            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 등록',
                action: 'CREATE_SUCCESS',
                username: 'system',
                targetId: savedOrderInfo.id.toString(),
                targetName: savedOrderInfo.orderName,
                details: `발주 등록 완료: ${savedOrderInfo.orderCode}`,
            });

            return {
                success: true,
                message: '발주가 성공적으로 등록되었습니다.',
                orderInfo: savedOrderInfo
            };

        } catch (error) {
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 등록',
                action: 'CREATE_FAILED',
                username: 'system',
                targetId: '발주 등록',
                targetName: createOrderInfoDto.orderName,
                details: `발주 등록 실패: ${error.message}`,
            });

            throw error;
        }
    }

    /**
     * 발주 아이템들을 데이터베이스에 저장합니다.
     */
    async savePurchaseOrderItems(purchaseOrderItems: any[], username: string = 'system') {
        try {
            if (!purchaseOrderItems || purchaseOrderItems.length === 0) {
                throw new Error('저장할 발주 아이템이 없습니다.');
            }


            // 기존 발주 아이템 삭제 (같은 수주 코드의 기존 발주 아이템들)
            const baseOrderCode = purchaseOrderItems[0].orderCode.split('_')[0]; // 기본 수주 코드 추출
            await this.orderInfoRepository
                .createQueryBuilder()
                .delete()
                .where("orderCode LIKE :baseOrderCode", { baseOrderCode: `${baseOrderCode}_%` })
                .execute();

            // 새로운 발주 아이템들 저장
            const savedItems: any[] = [];
            for (const item of purchaseOrderItems) {
                // 날짜 형식 변환
                const processedItem = {
                    ...item,
                    orderDate: this.convertToDate(item.orderDate),
                    deliveryDate: this.convertToDate(item.deliveryDate),
                    createdBy: username,
                    updatedBy: username
                };
                
                const orderInfo = this.orderInfoRepository.create(processedItem);
                const savedItem = await this.orderInfoRepository.save(orderInfo);
                savedItems.push(savedItem);
            }


            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 저장',
                action: 'CREATE_SUCCESS',
                username,
                targetId: baseOrderCode,
                targetName: purchaseOrderItems[0].projectName,
                details: `발주 아이템 ${savedItems.length}개 저장 완료`,
            });

            return {
                success: true,
                message: `발주 아이템 ${savedItems.length}개가 성공적으로 저장되었습니다.`,
                savedCount: savedItems.length,
                orderCode: baseOrderCode,
                projectCode: purchaseOrderItems[0].projectCode,
                projectName: purchaseOrderItems[0].projectName,
                savedItems: savedItems
            };

        } catch (error) {
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 저장',
                action: 'CREATE_FAILED',
                username,
                targetId: '발주 저장',
                targetName: '발주 아이템',
                details: `발주 아이템 저장 실패: ${error.message}`,
            });

            throw error;
        }
    }

    /**
     * 발주 아이템을 직접 생성하고 저장합니다.
     */
    async createAndSavePurchaseOrder(purchaseOrderItems: any[], username: string = 'system') {
        try {
            
            // 발주 아이템 저장
            const saveResult = await this.savePurchaseOrderItems(purchaseOrderItems, username);
            
            
            return saveResult;

        } catch (error) {
            throw error;
        }
    }

    /**
     * 날짜 문자열을 Date 객체로 변환합니다.
     */
    private convertToDate(dateValue: any): Date | null {
        if (!dateValue) {
            return null;
        }

        // 이미 Date 객체인 경우
        if (dateValue instanceof Date) {
            return dateValue;
        }

        // 문자열인 경우
        if (typeof dateValue === 'string') {
            // ISO 8601 형식인지 확인
            if (dateValue.includes('T') || dateValue.includes('Z')) {
                return new Date(dateValue);
            }
            
            // YYYY-MM-DD 형식인지 확인
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return new Date(dateValue + 'T00:00:00.000Z');
            }
            
            // 다른 형식의 날짜 문자열
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }

        // 숫자인 경우 (타임스탬프)
        if (typeof dateValue === 'number') {
            return new Date(dateValue);
        }

        return null;
    }

}
