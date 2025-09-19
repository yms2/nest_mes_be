import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Delivery } from '../entities/delivery.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { CustomerInfo } from '../../../base-info/customer-info/entities/customer-info.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';

@Injectable()
export class DeliveryUploadService {
    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(CustomerInfo)
        private readonly customerRepository: Repository<CustomerInfo>,
        @InjectRepository(ProductInfo)
        private readonly productRepository: Repository<ProductInfo>,
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryLotService: InventoryLotService,
    ) {}

    /**
     * 엑셀 파일에서 납품 데이터를 읽어와서 저장
     * @param file 업로드된 엑셀 파일
     * @param username 업로드자
     * @returns 업로드 결과
     */
    async uploadDeliveriesFromExcel(file: Express.Multer.File, username: string): Promise<{
        success: number;
        failed: number;
        errors: string[];
        deliveries: Delivery[];
    }> {
        try {
            // 엑셀 파일 읽기
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // JSON으로 변환
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
                throw new BadRequestException('엑셀 파일에 데이터가 없습니다.');
            }

            // 헤더 검증 (필수 헤더만 확인)
            const headers = jsonData[0] as string[];
            const requiredHeaders = ['납품일자', '거래처명', '품목명', '프로젝트명', '수주유형', '납품수량'];
            
            if (!this.validateRequiredHeaders(headers, requiredHeaders)) {
                throw new BadRequestException('엑셀 파일에 필수 헤더(납품일자, 거래처명, 품목명, 프로젝트명, 수주유형, 납품수량)가 없습니다.');
            }

            // 헤더 인덱스 매핑
            const headerMap = this.mapHeaders(headers);

            const deliveries: Delivery[] = [];
            const errors: string[] = [];
            let success = 0;
            let failed = 0;

            // 데이터 처리 (헤더 제외)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];
                
                if (!row || row.every(cell => !cell)) {
                    continue; // 빈 행 건너뛰기
                }

                try {
                    const delivery = await this.createDeliveryFromRow(row, headerMap, username);
                    deliveries.push(delivery);
                    success++;
                } catch (error) {
                    failed++;
                    errors.push(`행 ${i + 1}: ${error.message}`);
                }
            }

            // 배치 저장
            if (deliveries.length > 0) {
                await this.deliveryRepository.save(deliveries);
                
                // 재고 차감 처리
                for (const delivery of deliveries) {
                    await this.decreaseInventory(delivery, username);
                }
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPLOAD',
                action: `납품 엑셀 업로드`,
                username,
                targetId: file.originalname,
                details: `성공: ${success}건, 실패: ${failed}건`
            });

            return {
                success,
                failed,
                errors,
                deliveries
            };

        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPLOAD_ERROR',
                action: `납품 엑셀 업로드 실패`,
                username,
                targetId: file.originalname,
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 필수 헤더 검증
     */
    private validateRequiredHeaders(headers: string[], requiredHeaders: string[]): boolean {
        return requiredHeaders.every(required => 
            headers.some(header => header && header.trim() === required)
        );
    }

    /**
     * 헤더 인덱스 매핑
     */
    private mapHeaders(headers: string[]): { [key: string]: number } {
        const headerMap: { [key: string]: number } = {};
        
        headers.forEach((header, index) => {
            if (header) {
                const cleanHeader = header.trim();
                headerMap[cleanHeader] = index;
            }
        });
        
        return headerMap;
    }

    /**
     * 행 데이터로부터 납품 엔티티 생성
     */
    private async createDeliveryFromRow(row: any[], headerMap: { [key: string]: number }, username: string): Promise<Delivery> {
        const deliveryDate = row[headerMap['납품일자']];
        const customerName = row[headerMap['거래처명']];
        const productName = row[headerMap['품목명']];
        const projectName = row[headerMap['프로젝트명']];
        const orderType = row[headerMap['수주유형']];
        const deliveryQuantity = row[headerMap['납품수량']];
        const deliveryStatus = headerMap['납품상태'] !== undefined ? row[headerMap['납품상태']] : null;
        const remark = headerMap['비고'] !== undefined ? row[headerMap['비고']] : null;

        // 필수 필드 검증
        if (!deliveryDate || !customerName || !productName || !projectName || !orderType || !deliveryQuantity) {
            throw new BadRequestException('납품일자, 거래처명, 품목명, 프로젝트명, 수주유형, 납품수량은 필수입니다.');
        }

        // 중복 체크 제거 - 동일한 납품일자로 여러 건 등록 가능

        // 거래처명으로 거래처코드 조회
        const customerCode = await this.getCustomerCodeByName(customerName.toString().trim());
        
        // 품목명으로 품목코드 조회
        const productCode = await this.getProductCodeByName(productName.toString().trim());

        // 프로젝트명으로 프로젝트코드 조회
        const projectCode = await this.getProjectCodeByName(projectName.toString().trim());

        // 납품 엔티티 생성
        const delivery = new Delivery();
        delivery.deliveryCode = await this.generateDeliveryCode();
        delivery.deliveryDate = new Date(deliveryDate);
        delivery.shippingCode = ''; // 엑셀 업로드 시에는 출하코드 없음
        delivery.customerCode = customerCode;
        delivery.customerName = customerName.toString().trim();
        delivery.productCode = productCode;
        delivery.productName = productName.toString().trim();
        delivery.projectCode = projectCode;
        delivery.projectName = projectName.toString().trim();
        delivery.orderType = orderType.toString().trim();
        delivery.deliveryQuantity = parseInt(deliveryQuantity.toString());
        delivery.deliveryStatus = deliveryStatus ? deliveryStatus.toString().trim() : '납품대기';
        delivery.remark = remark ? remark.toString().trim() : '';
        delivery.createdBy = username;
        delivery.updatedBy = username;
        delivery.createdAt = new Date();
        delivery.updatedAt = new Date();

        return delivery;
    }

    /**
     * 거래처명으로 거래처코드 조회
     */
    private async getCustomerCodeByName(customerName: string): Promise<string> {
        const customer = await this.customerRepository.findOne({
            where: { customerName }
        });

        if (!customer) {
            throw new BadRequestException(`거래처명 '${customerName}'에 해당하는 거래처를 찾을 수 없습니다.`);
        }

        return customer.customerCode;
    }

    /**
     * 품목명으로 품목코드 조회
     */
    private async getProductCodeByName(productName: string): Promise<string> {
        const product = await this.productRepository.findOne({
            where: { productName }
        });

        if (!product) {
            throw new BadRequestException(`품목명 '${productName}'에 해당하는 품목을 찾을 수 없습니다.`);
        }

        return product.productCode;
    }


    /**
     * 프로젝트명으로 프로젝트코드 조회 (OrderManagement에서)
     */
    private async getProjectCodeByName(projectName: string): Promise<string> {
        const orderManagement = await this.orderManagementRepository.findOne({
            where: { projectName }
        });
        
        if (!orderManagement) {
            throw new BadRequestException(`프로젝트명 '${projectName}'에 해당하는 프로젝트를 찾을 수 없습니다.`);
        }

        return orderManagement.projectCode;
    }
    /**
     * 납품코드 자동 생성
     */
    private async generateDeliveryCode(): Promise<string> {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        const lastDelivery = await this.deliveryRepository
            .createQueryBuilder('delivery')
            .where('delivery.deliveryCode LIKE :prefix', { prefix: `DEL${dateStr}%` })
            .orderBy('delivery.deliveryCode', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastDelivery) {
            const lastSequence = parseInt(lastDelivery.deliveryCode.slice(-3), 10);
            sequence = lastSequence + 1;
        }

        return `DEL${dateStr}${sequence.toString().padStart(3, '0')}`;
    }

    /**
     * 납품 시 재고 차감 처리
     */
    private async decreaseInventory(delivery: Delivery, username: string): Promise<void> {
        try {
            // 전체 재고 차감
            const changeQuantityDto: ChangeQuantityDto = {
                inventoryCode: delivery.productCode, // 재고 코드는 품목 코드와 동일
                quantityChange: -delivery.deliveryQuantity, // 음수로 차감
                reason: `납품 - 납품코드: ${delivery.deliveryCode}`
            };

            await this.inventoryManagementService.changeInventoryQuantity(changeQuantityDto, username);

            // 재고 차감 로그
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_DECREASE',
                username,
                targetId: delivery.productCode,
                targetName: delivery.productName,
                details: `납품으로 인한 재고 차감: ${delivery.deliveryQuantity}개 (납품코드: ${delivery.deliveryCode})`
            });

        } catch (error) {
            // 재고 차감 실패 로그
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_DECREASE_FAIL',
                username,
                targetId: delivery.productCode,
                targetName: delivery.productName,
                details: `납품 재고 차감 실패: ${error.message} (납품코드: ${delivery.deliveryCode})`
            });

            // 재고 차감 실패해도 납품은 성공으로 처리 (비즈니스 로직에 따라 결정)
            console.error('재고 차감 실패:', error);
        }
    }
}
