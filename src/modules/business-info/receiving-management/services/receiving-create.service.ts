import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { CreateReceivingDto } from '../dto/create-receiving.dto';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
import { InventoryLot } from '../../../inventory/inventory-management/entities/inventory-lot.entity';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';
import { OrderInfo } from '../../order-info/entities/order-info.entity';

@Injectable()
export class ReceivingCreateService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        @InjectRepository(InventoryLot)
        private readonly inventoryLotRepository: Repository<InventoryLot>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryLotService: InventoryLotService,
    ) {}

    /**
     * 입고 정보를 생성합니다.
     */
    async createReceiving(createReceivingDto: CreateReceivingDto, username: string = 'system') {
        try {
            // 발주 정보 조회 및 미입고 수량 계산
            let orderInfo: OrderInfo | null = null;
            let unreceivedQuantity = 0;
            
            if (createReceivingDto.orderCode) {
                orderInfo = await this.orderInfoRepository.findOne({
                    where: { orderCode: createReceivingDto.orderCode }
                });
                
                if (orderInfo) {
                    // 기존 입고 수량 조회
                    const existingReceivings = await this.receivingRepository.find({
                        where: { orderCode: createReceivingDto.orderCode }
                    });
                    
                    const totalReceivedQuantity = existingReceivings.reduce((sum, r) => sum + (r.quantity || 0), 0);
                    const remainingQuantity = Math.max(0, (orderInfo.orderQuantity || 0) - totalReceivedQuantity);
                    
                    // 입고 수량이 남은 수량을 초과하는지 확인
                    if ((createReceivingDto.quantity || 0) > remainingQuantity) {
                        throw new BadRequestException(
                            `입고 수량(${createReceivingDto.quantity})이 남은 수량(${remainingQuantity})을 초과합니다.`
                        );
                    }
                    
                    // 미입고 수량 계산 (입고 후 남을 수량)
                    unreceivedQuantity = Math.max(0, remainingQuantity - (createReceivingDto.quantity || 0));
                }
            }

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

            // 불량수량 및 상세 정보 처리
            const defectQuantity = createReceivingDto.defectQuantity || 0;
            const defectDetails = createReceivingDto.defectDetails || [];
            const totalQuantity = createReceivingDto.quantity || 0;
            const goodQuantity = totalQuantity - defectQuantity; // 정상품 수량

            // LOT 코드 자동 생성 (입고용: 1+품목코드+날짜+001)
            let lotCode = createReceivingDto.lotCode;
            console.log(`[입고등록] 받은 LOT 코드: ${lotCode}`);
            console.log(`[입고등록] 품목 코드: ${createReceivingDto.productCode}`);
            
            if (!lotCode && createReceivingDto.productCode) {
                lotCode = await this.generateReceivingLotNumber(createReceivingDto.productCode);
                console.log(`[입고등록] 자동 생성된 LOT 코드: ${lotCode}`);
            } else if (lotCode) {
                console.log(`[입고등록] 클라이언트에서 제공한 LOT 코드 사용: ${lotCode}`);
            }

            // 입고 정보 생성
            const receiving = this.receivingRepository.create({
                receivingCode: createReceivingDto.receivingCode || nextCode,
                receivingDate: createReceivingDto.receivingDate ? new Date(createReceivingDto.receivingDate) : new Date(),
                orderCode: createReceivingDto.orderCode || '',
                productCode: createReceivingDto.productCode || orderInfo?.productCode || '',
                productName: createReceivingDto.productName || orderInfo?.productName || '',
                quantity: totalQuantity,
                defectiveQuantity: defectQuantity,  // DTO의 defectQuantity를 엔티티의 defectiveQuantity에 매핑
                defectDetails: defectDetails,
                customerCode: createReceivingDto.customerCode || orderInfo?.customerCode || '',
                customerName: createReceivingDto.customerName || orderInfo?.customerName || '',
                unit: createReceivingDto.unit || orderInfo?.productOrderUnit || 'EA',
                warehouseCode: createReceivingDto.warehouseCode || '',
                warehouseName: createReceivingDto.warehouseName || '',
                warehouseZone: createReceivingDto.warehouseZone || '',
                lotCode: lotCode || '',
                remark: createReceivingDto.remark || '',
                approvalStatus: createReceivingDto.approvalStatus || '대기',
                // 클라이언트에서 보낸 값 우선 사용, 없으면 자동 계산
                unreceivedQuantity: createReceivingDto.unreceivedQuantity !== undefined ? createReceivingDto.unreceivedQuantity : unreceivedQuantity,
                unitPrice: createReceivingDto.unitPrice !== undefined ? createReceivingDto.unitPrice : (orderInfo?.unitPrice || 0),
                supplyPrice: createReceivingDto.supplyPrice !== undefined ? createReceivingDto.supplyPrice : ((orderInfo?.unitPrice || 0) * totalQuantity),
                vat: createReceivingDto.vat !== undefined ? createReceivingDto.vat : Math.round(((orderInfo?.unitPrice || 0) * totalQuantity) * 0.1),
                total: createReceivingDto.total !== undefined ? createReceivingDto.total : Math.round(((orderInfo?.unitPrice || 0) * totalQuantity) * 1.1),
                projectCode: createReceivingDto.projectCode || orderInfo?.projectCode || '',
                projectName: createReceivingDto.projectName || orderInfo?.projectName || ''
            });

            // 저장
            const savedReceiving = await this.receivingRepository.save(receiving);

            // 정상품 수량 계산
            const savedGoodQuantity = (savedReceiving.quantity || 0) - (savedReceiving.defectiveQuantity || 0);

            // 재고 수량 증가 처리 (정상품만 재고에 추가)
            if (savedReceiving.productCode && savedGoodQuantity > 0) {
                try {
                    // 1. 일반 재고 수량 증가 (정상품만)
                    const changeQuantityDto: ChangeQuantityDto = {
                        inventoryCode: savedReceiving.productCode,
                        quantityChange: savedGoodQuantity,
                        reason: `입고 처리 - ${savedReceiving.receivingCode}${savedReceiving.defectiveQuantity > 0 ? ` (불량 ${savedReceiving.defectiveQuantity}개 제외)` : ''}`
                    };

                    await this.inventoryManagementService.changeInventoryQuantity(
                        changeQuantityDto,
                        username
                    );

                    // 2. LOT별 재고 처리 (정상품만)
                    if (savedReceiving.lotCode) {
                        await this.inventoryLotService.createOrUpdateLotInventory(
                            savedReceiving.productCode,
                            savedReceiving.lotCode,
                            savedGoodQuantity,
                            savedReceiving.productName,
                            savedReceiving.unit || 'EA',
                            savedReceiving.warehouseName || '기본창고',
                            savedReceiving.receivingCode,
                            username,
                            savedReceiving.warehouseCode,
                            savedReceiving.warehouseName,
                            savedReceiving.warehouseZone
                        );
                    }

                    // 재고 증가 로그 기록
                    let logDetails = `입고로 인한 재고 증가: ${savedReceiving.productCode} (${savedReceiving.productName}) +${savedGoodQuantity}`;
                    
                    if (savedReceiving.defectiveQuantity > 0) {
                        const defectInfo = savedReceiving.defectDetails && savedReceiving.defectDetails.length > 0
                            ? savedReceiving.defectDetails.map(d => `${d.type} ${d.quantity}개`).join(', ')
                            : `${savedReceiving.defectiveQuantity}개`;
                        logDetails += ` (총 입고: ${savedReceiving.quantity}, 불량: ${defectInfo})`;
                    }
                    
                    if (savedReceiving.lotCode) {
                        logDetails += ` [LOT: ${savedReceiving.lotCode}]`;
                    }

                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_INCREASE',
                        username,
                        targetId: savedReceiving.productCode,
                        details: logDetails
                    });

                } catch (inventoryError) {
                    // 재고 처리 실패 시 로그만 기록하고 입고는 성공으로 처리
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_INCREASE_FAILED',
                        username,
                        targetId: savedReceiving.productCode,
                        details: `입고 후 재고 증가 실패: ${savedReceiving.productCode} - ${inventoryError.message}`
                    });
                }
            }

            // 로그 기록
            let createLogDetails = `입고 정보 생성: ${savedReceiving.receivingCode} (품목: ${savedReceiving.productName}, `;
            
            if (savedReceiving.defectiveQuantity > 0) {
                const defectInfo = savedReceiving.defectDetails && savedReceiving.defectDetails.length > 0
                    ? savedReceiving.defectDetails.map(d => `${d.type} ${d.quantity}개`).join(', ')
                    : `${savedReceiving.defectiveQuantity}개`;
                createLogDetails += `총수량: ${savedReceiving.quantity}, 정상: ${savedGoodQuantity}, 불량: ${defectInfo}, `;
            } else {
                createLogDetails += `수량: ${savedReceiving.quantity}, `;
            }
            
            createLogDetails += `승인상태: ${savedReceiving.approvalStatus})`;

            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedReceiving.receivingCode,
                details: createLogDetails
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

    /**
     * 입고용 LOT 번호를 생성합니다.
     * 형식: 1 + 품목코드 + 날짜(YYYYMMDD) + 001
     * @param productCode 제품 코드
     * @returns 생성된 LOT 번호
     */
    private async generateReceivingLotNumber(productCode: string): Promise<string> {
        try {
            const today = new Date();
            const dateString = today.getFullYear().toString() + 
                              (today.getMonth() + 1).toString().padStart(2, '0') + 
                              today.getDate().toString().padStart(2, '0');
            
            // 오늘 날짜로 생성된 LOT 번호 중 가장 높은 번호 조회
            const prefix = `1${productCode}${dateString}`;
            console.log(`[입고LOT번호생성] prefix: ${prefix}`);
            
            const existingLots = await this.inventoryLotRepository
                .createQueryBuilder('lot')
                .where('lot.lotCode LIKE :prefix', { prefix: `${prefix}%` })
                .orderBy('lot.lotCode', 'DESC')
                .getMany();
            
            console.log(`[입고LOT번호생성] 기존 LOT 개수: ${existingLots.length}`);
            
            let sequence = 1;
            if (existingLots.length > 0) {
                // 기존 LOT 번호에서 시퀀스 번호 추출하여 +1
                const lastLotCode = existingLots[0].lotCode;
                const lastSequence = parseInt(lastLotCode.substring(lastLotCode.length - 3));
                sequence = lastSequence + 1;
                console.log(`[입고LOT번호생성] 마지막 LOT: ${lastLotCode}, 다음 시퀀스: ${sequence}`);
            }
            
            const finalLotNumber = `${prefix}${sequence.toString().padStart(3, '0')}`;
            console.log(`[입고LOT번호생성완료] 최종 LOT 번호: ${finalLotNumber}`);
            
            return finalLotNumber;
        } catch (error) {
            console.error(`[입고LOT번호생성실패] ${productCode}: ${error.message}`);
            throw error;
        }
    }
}
