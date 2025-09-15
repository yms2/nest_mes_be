import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from '../entities/delivery.entity';
import { Shipping } from '../../shipping-info/entities/shipping.entity';
import { Repository } from 'typeorm';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class DeliveryCreateService {
    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        private readonly logService: logService,
    ) {}

    /**
     * 출하코드로부터 납품 등록
     */
    async createDeliveryFromShipping(
        shippingCode: string,
        deliveryQuantity: number,
        deliveryDate?: string,
        deliveryStatus?: string,
        remark?: string,
        username: string = 'system'
    ) {
        try {
            // 출하 데이터 조회
            const shippingData = await this.getShippingDataByCode(shippingCode);
            
            // 납품코드 자동 생성
            const deliveryCode = await this.generateDeliveryCode();
            
            // 납품 데이터 생성
            const deliveryData = this.createDeliveryData(
                shippingData,
                deliveryCode,
                deliveryQuantity,
                deliveryDate,
                deliveryStatus,
                remark,
                username
            );
            
            // 납품 데이터 저장
            const savedDelivery = await this.deliveryRepository.save(deliveryData);
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '납품관리 생성',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedDelivery.id.toString(),
                targetName: savedDelivery.deliveryCode,
                details: `출하코드 ${shippingCode}로부터 납품 등록: ${savedDelivery.deliveryCode}`,
            });
            
            return savedDelivery;
            
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '납품관리 생성',
                action: 'CREATE_FAIL',
                username,
                targetId: '',
                targetName: shippingCode,
                details: `납품 등록 실패: ${error.message}`,
            }).catch(() => {});
            
            throw error;
        }
    }

    /**
     * 출하없이 납품 등록
     */
    async createDeliveryWithoutShipping(
        customerCode: string,
        customerName: string,
        productCode: string,
        productName: string,
        projectCode: string,
        projectName: string,
        deliveryQuantity: number,
        deliveryDate?: string,
        deliveryStatus?: string,
        remark?: string,
        username: string = 'system'
    ) {
        try {
            // 납품코드 자동 생성
            const deliveryCode = await this.generateDeliveryCode();
            
            // 납품 데이터 생성 (출하 없이)
            const deliveryData = this.deliveryRepository.create({
                deliveryCode,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
                shippingCode: '', // 출하코드 없음
                customerCode,
                customerName,
                productCode,
                productName,
                projectCode,
                projectName,
                deliveryQuantity,
                deliveryStatus: deliveryStatus || '납품완료',
                remark: remark || '',
                createdBy: username,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            // 납품 데이터 저장
            const savedDelivery = await this.deliveryRepository.save(deliveryData);
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '납품관리 생성',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedDelivery.id.toString(),
                targetName: savedDelivery.deliveryCode,
                details: `출하없이 납품 등록: ${savedDelivery.deliveryCode}`,
            });
            
            return savedDelivery;
            
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '납품관리 생성',
                action: 'CREATE_FAIL',
                username,
                targetId: '',
                targetName: '출하없이 납품',
                details: `출하없이 납품 등록 실패: ${error.message}`,
            }).catch(() => {});
            
            throw error;
        }
    }

    /**
     * 출하코드로 출하 데이터 조회
     */
    private async getShippingDataByCode(shippingCode: string): Promise<Shipping> {
        const shippingData = await this.shippingRepository.findOne({
            where: { shippingCode: shippingCode.trim() }
        });
        
        if (!shippingData) {
            throw new NotFoundException(`출하코드 '${shippingCode}'에 해당하는 출하 데이터를 찾을 수 없습니다.`);
        }
        
        return shippingData;
    }

    /**
     * 납품코드 자동 생성
     */
    private async generateDeliveryCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 오늘 날짜로 생성된 납품코드 개수 조회
        const count = await this.deliveryRepository
            .createQueryBuilder('delivery')
            .where('delivery.deliveryCode LIKE :pattern', { pattern: `DEL${dateStr}%` })
            .getCount();
        
        // 순번 생성 (3자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `DEL${dateStr}${sequence}`;
    }

    /**
     * 납품 데이터 생성
     */
    private createDeliveryData(
        shippingData: Shipping,
        deliveryCode: string,
        deliveryQuantity: number,
        deliveryDate?: string,
        deliveryStatus?: string,
        remark?: string,
        username: string = 'system'
    ): Partial<Delivery> {
        return {
            deliveryCode,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
            shippingCode: shippingData.shippingCode,
            customerCode: shippingData.orderManagement?.customerCode || '',
            customerName: shippingData.orderManagement?.customerName || '',
            productCode: shippingData.productCode || '',
            productName: shippingData.productName || '',
            projectCode: shippingData.projectCode || '',
            projectName: shippingData.projectName || '',
            deliveryQuantity,
            deliveryStatus: deliveryStatus || '납품완료',
            remark: remark || '',
            createdBy: username
        };
    }

    /**
     * 출하코드 목록 조회 (납품 등록용)
     */
    async getAvailableShippingCodes(username: string = 'system') {
        try {
            // 모든 출하 데이터 조회
            const shippings = await this.shippingRepository.find({
                select: [
                    'shippingCode',
                    'shippingDate',
                    'productCode',
                    'productName',
                    'projectCode',
                    'projectName',
                    'shippingOrderQuantity',
                    'shippingStatus',
                    'employeeCode',
                    'employeeName',
                    'remark'
                ],
                relations: ['orderManagement'],
                order: { shippingDate: 'DESC' }
            });

            // 각 출하에 대해 납품 등록된 수량 계산
            const shippingsWithDeliveredQuantity = await Promise.all(
                shippings.map(async (shipping) => {
                    const { deliveredQuantity } = await this.calculateDeliveredQuantity(
                        shipping.shippingCode
                    );
                    const remainingQuantity = shipping.shippingOrderQuantity - deliveredQuantity;

                    return {
                        ...shipping,
                        remainingQuantity: Math.max(0, remainingQuantity), // 음수 방지
                        deliveredQuantity
                    };
                })
            );

            // 납품 가능한 출하만 필터링 (남은 수량이 0보다 큰 것)
            const availableShippings = shippingsWithDeliveredQuantity.filter(
                shipping => shipping.remainingQuantity > 0
            );
            
            await this.logService.createDetailedLog({
                moduleName: '납품관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: '출하코드 목록',
                details: `납품 등록 가능한 출하코드 목록 조회: ${availableShippings.length}개`,
            });
            
            return availableShippings;
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * 출하별 납품 등록 수량 계산
     */
    private async calculateDeliveredQuantity(
        shippingCode: string
    ): Promise<{ deliveredQuantity: number; remainingQuantity: number }> {
        // 해당 출하코드로 등록된 납품들의 총 납품수량 합계
        const totalDeliveredQuantity = await this.deliveryRepository
            .createQueryBuilder('delivery')
            .select('SUM(delivery.deliveryQuantity)', 'totalDelivered')
            .where('delivery.shippingCode = :shippingCode', { shippingCode })
            .getRawOne();

        const deliveredQuantity = this.safeParseInt(totalDeliveredQuantity?.totalDelivered, 0);
        
        return {
            deliveredQuantity,
            remainingQuantity: 0 // 이 값은 호출하는 곳에서 shippingOrderQuantity와 함께 계산
        };
    }

    /**
     * 안전한 parseInt 함수 (NaN 방지)
     */
    private safeParseInt(value: any, defaultValue: number = 0): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}