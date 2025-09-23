
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../entities/order-info.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { CreateOrderInfoDto } from '../dto/create-order-info.dto';
import { NotificationCreateService } from '../../../notification/services/notification-create.service';

@Injectable()
export class OrderCreateService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        private readonly logService: logService,
        private readonly notificationCreateService: NotificationCreateService,
    ) {}

    /**
     * 발주 정보를 등록합니다.
     */
    async createOrderInfo(createOrderInfoDto: CreateOrderInfoDto, username: string = 'system') {
        try {

            // 발주 정보 생성
            const orderInfo = this.orderInfoRepository.create({
                ...createOrderInfoDto,
                orderDate: this.convertToDate(createOrderInfoDto.orderDate),
                deliveryDate: this.convertToDate(createOrderInfoDto.deliveryDate),
                createdBy: username,
                updatedBy: username
            } as Partial<OrderInfo>);

            // 발주 정보 저장
            const savedOrderInfo = await this.orderInfoRepository.save(orderInfo);


            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 등록',
                action: 'CREATE_SUCCESS',
                username: username,
                targetId: savedOrderInfo.id.toString(),
                targetName: savedOrderInfo.orderName,
                details: `발주 등록 완료: ${savedOrderInfo.orderCode}`,
            });

            // 알림 생성
            try {
                await this.notificationCreateService.createOrderNotification({
                    orderCode: savedOrderInfo.orderCode,
                    orderName: savedOrderInfo.orderName,
                    customerName: savedOrderInfo.customerName,
                    createdBy: username,
                    productCode: savedOrderInfo.productCode,
                    productName: savedOrderInfo.productName,
                    orderQuantity: savedOrderInfo.orderQuantity,
                    unitPrice: savedOrderInfo.unitPrice,
                    total: savedOrderInfo.total
                });
            } catch (notificationError) {
                // 알림 생성 실패는 로그만 남기고 발주 등록은 성공으로 처리
                console.error('알림 생성 실패:', notificationError);
            }

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
                username: username,
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
                // 기본 수주 코드 추출 (예: ORD20250919005_PRD007_005 -> ORD20250919005)
                const baseOrderCode = item.orderCode.split('_')[0];
                
                // 날짜 형식 변환
                const processedItem = {
                    ...item,
                    orderManagementCode: baseOrderCode, // 수주 코드 추가
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

            // 수주기반 발주등록 알림 생성
            try {
                // 품목별 상세 정보 생성
                const productDetails = savedItems.map(item => 
                    `${item.productCode}(${item.productName}) - 수량:${item.orderQuantity}, 단가:${item.unitPrice?.toLocaleString()}원`
                ).join(', ');
                
                await this.notificationCreateService.createNotification({
                    notificationType: 'ORDER_CREATE_FROM_ORDER',
                    notificationTitle: '수주기반 발주가 등록되었습니다',
                    notificationContent: `수주코드: ${baseOrderCode}, 프로젝트: ${purchaseOrderItems[0].projectName}, 발주 아이템: ${savedItems.length}개 | 품목: ${productDetails}`,
                    sender: username,
                    receiver: '관리자',
                    status: 'UNREAD'
                });
            } catch (notificationError) {
                console.error('수주기반 발주등록 알림 생성 실패:', notificationError);
            }

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

    /**
     * 단일 발주 정보를 등록합니다.
     */
    async createSingleOrderInfo(createOrderInfoDto: CreateOrderInfoDto, username: string = 'system') {
        try {
            
            // 발주 정보 생성
            const orderInfo = this.orderInfoRepository.create({
                ...createOrderInfoDto,
                orderDate: this.convertToDate(createOrderInfoDto.orderDate),
                deliveryDate: this.convertToDate(createOrderInfoDto.deliveryDate),
                createdBy: username,
                updatedBy: username
            } as Partial<OrderInfo>);

            // 발주 정보 저장
            const savedOrderInfo = await this.orderInfoRepository.save(orderInfo);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 등록',
                action: 'CREATE_SUCCESS',
                username: username,
                targetId: savedOrderInfo.id.toString(),
                targetName: savedOrderInfo.orderName,
                details: `단일 발주 등록 완료: ${savedOrderInfo.orderCode}`,
            });

            // 알림 생성
            try {
                await this.notificationCreateService.createOrderNotification({
                    orderCode: savedOrderInfo.orderCode,
                    orderName: savedOrderInfo.orderName,
                    customerName: savedOrderInfo.customerName,
                    createdBy: username,
                    productCode: savedOrderInfo.productCode,
                    productName: savedOrderInfo.productName,
                    orderQuantity: savedOrderInfo.orderQuantity,
                    unitPrice: savedOrderInfo.unitPrice,
                    total: savedOrderInfo.total
                });
            } catch (notificationError) {
                console.error('알림 생성 실패:', notificationError);
            }

            return {
                success: true,
                message: '단일 발주가 성공적으로 등록되었습니다.',
                orderInfo: savedOrderInfo
            };

        } catch (error) {
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 등록',
                action: 'CREATE_FAILED',
                username: username,
                targetId: '단일 발주 등록',
                targetName: createOrderInfoDto.orderName,
                details: `단일 발주 등록 실패: ${error.message}`,
            });

            throw error;
        }
    }

    /**
     * 개별 발주 정보를 생성합니다.
     */
    async createIndividualOrder(orderData: any, username: string = 'system') {
        try {
            // 필수 필드 검증
            const requiredFields = ['customerCode', 'customerName', 'projectCode', 'projectName', 'orderName', 'orderDate', 'productCode', 'productName', 'orderQuantity', 'unitPrice', 'supplyPrice', 'vat', 'total', 'deliveryDate'];
            const missingFields = requiredFields.filter(field => !orderData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
            }

            // 수주 코드가 없으면 자동 생성
            let orderCode = orderData.orderCode;
            if (!orderCode) {
                orderCode = await this.generateOrderCode();
            }

            // 발주 코드 생성 (수주코드_순번 형식)
            const existingOrders = await this.orderInfoRepository
                .createQueryBuilder('order')
                .where('order.orderCode LIKE :pattern', { pattern: `${orderCode}_%` })
                .getCount();
            
            const sequence = existingOrders + 1;
            const finalOrderCode = `${orderCode}_${sequence.toString().padStart(3, '0')}`;

            // 발주 정보 생성
            const orderInfo = new OrderInfo();
            orderInfo.customerCode = orderData.customerCode;
            orderInfo.customerName = orderData.customerName;
            orderInfo.orderCode = finalOrderCode;
            orderInfo.projectCode = orderData.projectCode;
            orderInfo.projectName = orderData.projectName;
            orderInfo.projectVersion = orderData.projectVersion || '';
            orderInfo.orderName = orderData.orderName;
            orderInfo.orderDate = this.convertToDate(orderData.orderDate) || new Date();
            orderInfo.productCode = orderData.productCode;
            orderInfo.productName = orderData.productName;
            orderInfo.usePlanQuantity = orderData.usePlanQuantity || orderData.orderQuantity;
            orderInfo.orderQuantity = orderData.orderQuantity;
            orderInfo.unitPrice = orderData.unitPrice;
            orderInfo.supplyPrice = orderData.supplyPrice;
            orderInfo.vat = orderData.vat;
            orderInfo.total = orderData.total;
            orderInfo.discountAmount = orderData.discountAmount || 0;
            orderInfo.totalAmount = orderData.totalAmount || orderData.total;
            orderInfo.deliveryDate = this.convertToDate(orderData.deliveryDate) || new Date();
            orderInfo.approvalInfo = orderData.approvalInfo || '대기';
            orderInfo.remark = orderData.remark || '';
            orderInfo.createdBy = username;
            orderInfo.updatedBy = username;

            // 발주 정보 저장
            const savedOrderInfo = await this.orderInfoRepository.save(orderInfo);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '개별 발주 생성',
                action: 'CREATE_SUCCESS',
                username: username,
                targetId: savedOrderInfo.id.toString(),
                targetName: savedOrderInfo.orderName,
                details: `개별 발주 생성 완료: ${savedOrderInfo.orderCode} (프로젝트: ${savedOrderInfo.projectName}, 품목: ${savedOrderInfo.productName})`,
            });

            // 알림 생성
            try {
                await this.notificationCreateService.createOrderNotification({
                    orderCode: savedOrderInfo.orderCode,
                    orderName: savedOrderInfo.orderName,
                    customerName: savedOrderInfo.customerName,
                    createdBy: username,
                    productCode: savedOrderInfo.productCode,
                    productName: savedOrderInfo.productName,
                    orderQuantity: savedOrderInfo.orderQuantity,
                    unitPrice: savedOrderInfo.unitPrice,
                    total: savedOrderInfo.total
                });
            } catch (notificationError) {
                console.error('알림 생성 실패:', notificationError);
            }

            return {
                success: true,
                message: '개별 발주가 성공적으로 생성되었습니다.',
                orderInfo: savedOrderInfo
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '개별 발주 생성',
                action: 'CREATE_FAILED',
                username: username,
                targetId: '개별 발주 생성',
                targetName: orderData.orderName || '알 수 없음',
                details: `개별 발주 생성 실패: ${error.message}`,
            });

            throw error;
        }
    }

    /**
     * 개별 발주용 수주 코드를 자동 생성합니다.
     */
    private async generateOrderCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 개별 발주용 코드 패턴으로 생성된 수주 코드 개수 조회
        const count = await this.orderInfoRepository
            .createQueryBuilder('order')
            .where('order.orderCode LIKE :pattern', { pattern: `IND${dateStr}%` })
            .getCount();
        
        // 순번 생성 (3자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `IND${dateStr}${sequence}`;
    }
}
