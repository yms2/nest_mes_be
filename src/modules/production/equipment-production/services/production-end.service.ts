import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Production } from '../entities/production.entity';
import { ProductionDefectQuantity } from '../entities/productionDefect.entity';
import { BomProcess } from '@/modules/base-info/bom-info/entities/bom-process.entity';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { EndProductionDto, DefectReasonDto } from '../dto/end-production.dto';
import { InventoryAdjustmentLogService } from '@/modules/inventory/inventory-logs/services/inventory-adjustment-log.service';
import { InventoryLot } from '@/modules/inventory/inventory-management/entities/inventory-lot.entity';
import { Warehouse } from '@/modules/inventory/warehouse/entities/warehouse.entity';


@Injectable()
export class ProductionEndService {
    constructor(
        @InjectRepository(Production)
        private readonly productionRepository: Repository<Production>,
        @InjectRepository(ProductionDefectQuantity)
        private readonly productionDefectRepository: Repository<ProductionDefectQuantity>,
        @InjectRepository(BomProcess)
        private readonly bomProcessRepository: Repository<BomProcess>,
        @InjectRepository(BomInfo)
        private readonly bomInfoRepository: Repository<BomInfo>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(ProductionInstruction)
        private readonly productionInstructionRepository: Repository<ProductionInstruction>,
        @InjectRepository(InventoryLot)
        private readonly inventoryLotRepository: Repository<InventoryLot>,
        @InjectRepository(Warehouse)
        private readonly warehouseRepository: Repository<Warehouse>,
        private readonly inventoryAdjustmentLogService: InventoryAdjustmentLogService,
    ) {}


    /**
     * 생산을 종료합니다.
     * @param dto 생산 종료 DTO
     * @param username 사용자명
     * @returns 생산 종료 정보
     */
    async endProduction(
        dto: EndProductionDto,
        username: string,
    ): Promise<Production> {
        // 1. 생산 조회
        const production = await this.productionRepository.findOne({
            where: { productionCode: dto.productionCode },
        });

        if (!production) {
            throw new NotFoundException(`생산을 찾을 수 없습니다: ${dto.productionCode}`);
        }

        // 2. 생산 정보 업데이트
        // 실제 완료수량 = 생산지시수량 - 불량수량
        const actualProductionQuantity = production.productionInstructionQuantity - dto.totalDefectQuantity;
        production.productionCompletionQuantity = actualProductionQuantity;
        production.productionDefectQuantity = dto.totalDefectQuantity;
        production.productionStatus = '완료';
        production.productionCompletionDate = new Date();
        production.employeeCode = dto.employeeCode; // 생산 종료 시 사원 정보 필수
        production.employeeName = dto.employeeName; // 생산 종료 시 사원 정보 필수
        production.remark = dto.remark || '생산 완료';
        production.updatedBy = username;

        // 3. 생산 정보 저장
        const updatedProduction = await this.productionRepository.save(production);

        // 4. 불량 사유가 있으면 불량 테이블에 저장
        if (dto.defectReasons && dto.defectReasons.length > 0) {
            await this.saveDefectReasons(dto.productionCode, production.productionDefectCode, dto.defectReasons, dto.employeeCode, dto.employeeName, username);
        }

        // 5. 생산지시 테이블 업데이트 (실제 생산수량, 총 불량수량)
        await this.updateProductionInstruction(production.productionInstructionCode, actualProductionQuantity, dto.totalDefectQuantity, username);

        // 6. 다음 공정이 있는지 확인하고 이동
        const nextProcess = await this.getNextProcess(production.productCode, production.productionProcessCode);
        if (nextProcess) {
            // 이미 계산된 actualProductionQuantity 사용
            await this.moveToNextProcess(production, nextProcess, actualProductionQuantity, dto.employeeCode, dto.employeeName, username);
        } else {
            // 모든 공정이 완료된 경우 최종 완료 처리
            console.log(`[최종완료] 제품: ${production.productCode}, 생산수량: ${actualProductionQuantity}개`);
            
            production.productionStatus = '최종완료';
            await this.productionRepository.save(production);
            
            // BOM 재료 재고 확인 및 차감 (생산 완료 시 즉시 처리)
            await this.checkAndUpdateBomInventory(production.productCode, actualProductionQuantity);
            
            // 완제품 재고 증가
            await this.updateFinishedProductInventory(production.productCode, production.productName, actualProductionQuantity, dto);
        }

        return updatedProduction;
    }

    /**
     * 생산지시 테이블을 업데이트합니다.
     * @param productionInstructionCode 생산지시 코드
     * @param actualProductionQuantity 실제 생산수량
     * @param totalDefectQuantity 총 불량수량
     * @param username 사용자명
     */
    private async updateProductionInstruction(
        productionInstructionCode: string,
        actualProductionQuantity: number,
        totalDefectQuantity: number,
        username: string,
    ): Promise<void> {
        const productionInstruction = await this.productionInstructionRepository.findOne({
            where: { productionInstructionCode },
        });

        if (productionInstruction) {
            productionInstruction.actualProductionQuantity = actualProductionQuantity;
            productionInstruction.totalDefectQuantity = totalDefectQuantity;
            productionInstruction.updatedBy = username;
            await this.productionInstructionRepository.save(productionInstruction);
            
            console.log(`[생산지시업데이트] ${productionInstructionCode}: 실제생산수량=${actualProductionQuantity}, 총불량수량=${totalDefectQuantity}`);
        }
    }

    /**
     * 불량 사유를 저장합니다.
     * @param productionCode 생산 코드
     * @param productionDefectCode 생산 불량 코드 (생산 테이블에서 가져온 값)
     * @param defectReasons 불량 사유 목록
     * @param employeeCode 담당자 코드
     * @param employeeName 담당자 이름
     * @param username 사용자명
     */
    private async saveDefectReasons(
        productionCode: string,
        productionDefectCode: string,
        defectReasons: DefectReasonDto[],
        employeeCode: string,
        employeeName: string,
        username: string,
    ): Promise<void> {
        const defectEntities = defectReasons.map(defect => 
            this.productionDefectRepository.create({
                productionDefectCode: productionDefectCode, // 생산 테이블의 불량코드 사용
                productionDefectQuantity: defect.defectQuantity,
                productionDefectReason: defect.defectReason,
                employeeCode: employeeCode, // 입력받은 담당자 코드 사용
                employeeName: employeeName, // 입력받은 담당자 이름 사용
                remark: `생산코드: ${productionCode}`,
                createdBy: username,
                updatedBy: username,
            })
        );

        await this.productionDefectRepository.save(defectEntities);
    }

    /**
     * 다음 공정을 찾습니다.
     * @param productCode 제품 코드
     * @param currentProcessCode 현재 공정 코드
     * @returns 다음 공정 정보
     */
    private async getNextProcess(productCode: string, currentProcessCode: string): Promise<BomProcess | null> {
        // 현재 공정의 순서 조회
        const currentProcess = await this.bomProcessRepository.findOne({
            where: { 
                productCode, 
                processCode: currentProcessCode 
            }
        });

        if (!currentProcess) {
            return null;
        }

        // 다음 순서의 공정 조회
        const nextProcess = await this.bomProcessRepository.findOne({
            where: { 
                productCode, 
                processOrder: currentProcess.processOrder + 1 
            }
        });

        return nextProcess;
    }

    /**
     * 다음 공정으로 이동합니다.
     * @param production 생산 정보
     * @param nextProcess 다음 공정 정보
     * @param actualProductionQuantity 실제 생산수량 (생산지시수량 - 불량수량)
     * @param employeeCode 담당자 코드
     * @param employeeName 담당자 이름
     * @param username 사용자명
     */
    private async moveToNextProcess(
        production: Production,
        nextProcess: BomProcess,
        actualProductionQuantity: number,
        employeeCode: string,
        employeeName: string,
        username: string,
    ): Promise<void> {
        // 현재 공정 완료 처리
        production.productionStatus = '공정완료';
        production.updatedBy = username;
        await this.productionRepository.save(production);

        // 다음 공정으로 새로운 생산 레코드 생성
        const nextProductionCode = await this.generateNextProductionCode(production.productionCode);
        
        const nextProduction = this.productionRepository.create({
            productionCode: nextProductionCode,
            productionInstructionCode: production.productionInstructionCode,
            productCode: production.productCode,
            productName: production.productName,
            productType: production.productType,
            productSize: production.productSize,
            productionInstructionQuantity: actualProductionQuantity, // 실제 생산수량으로 설정
            productionDefectCode: production.productionDefectCode,
            productionDefectQuantity: 0, // 다음 공정에서는 불량수량 초기화
            productionCompletionQuantity: 0, // 다음 공정에서는 완료수량 초기화
            productionProcessCode: nextProcess.processCode,
            productionProcessName: nextProcess.processName,
            productionStatus: '진행중',
            employeeCode: employeeCode, // 생산 종료 시 입력받은 사원 정보
            employeeName: employeeName, // 생산 종료 시 입력받은 사원 정보
            productionStartDate: new Date(), // 다음 공정 시작일
            productionCompletionDate: undefined, // 다음 공정은 아직 완료되지 않음
            remark: `공정 이동: ${production.productionProcessName} → ${nextProcess.processName} (이전공정 생산수량: ${actualProductionQuantity})`,
            createdBy: username,
            updatedBy: username,
        });

        await this.productionRepository.save(nextProduction);
    }

    /**
     * 다음 생산 코드를 생성합니다.
     * @param currentProductionCode 현재 생산 코드
     * @returns 다음 생산 코드
     */
    private async generateNextProductionCode(currentProductionCode: string): Promise<string> {
        // 현재 생산 코드에서 순서 번호 추출
        const match = currentProductionCode.match(/PRO(\d{8})(\d{3})/);
        if (!match) {
            throw new Error(`잘못된 생산 코드 형식: ${currentProductionCode}`);
        }

        const datePart = match[1];
        const sequence = parseInt(match[2]);
        const nextSequence = (sequence + 1).toString().padStart(3, '0');
        
        return `PRO${datePart}${nextSequence}`;
    }

    /**
     * 완제품 재고를 증가시킵니다.
     * @param productCode 제품 코드
     * @param productName 제품명
     * @param quantity 생산 수량
     */
    private async updateFinishedProductInventory(productCode: string, productName: string, quantity: number, dto: EndProductionDto): Promise<void> {
        try {
            // 생산용 LOT번호 생성 (형식: 2 + 품목코드 + 날짜(YYYYMMDD) + 001)
            const productionLotCode = await this.generateProductionLotNumber(productCode);
            
            // 완제품 재고 조회
            let inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: productCode }
            });

            if (inventory) {
                // 기존 재고가 있으면 수량 증가
                const currentStock = inventory.inventoryQuantity;
                const newStock = currentStock + quantity;
                
                await this.inventoryRepository.update(
                    { inventoryCode: productCode },
                    { 
                        inventoryQuantity: newStock,
                        updatedBy: 'system',
                        updatedAt: new Date()
                    }
                );

                console.log(`[완제품재고증가] ${productCode}(${productName}): ${currentStock}개 → ${newStock}개 (+${quantity}개)`);

                // 재고 조정 로그 기록 (LOT번호 사용)
                try {
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        productionLotCode, // LOT번호 사용
                        productName,
                        'PRODUCTION',
                        currentStock,
                        newStock,
                        quantity,
                        `생산 완료 - 완제품 입고 (LOT: ${productionLotCode})`,
                        'system'
                    );
                } catch (logError) {
                    console.error(`[재고로그기록실패] ${productCode}: ${logError.message}`);
                }
            } else {
                // 재고가 없으면 새로 생성
                const newInventory = this.inventoryRepository.create({
                    inventoryCode: productCode,
                    inventoryName: productName,
                    inventoryType: '완제품',
                    inventoryQuantity: quantity,
                    inventoryUnit: 'EA',
                    inventoryLocation: '메인창고',
                    safeInventory: 0,
                    inventoryStatus: '정상',
                    createdBy: 'system',
                    updatedBy: 'system',
                });

                await this.inventoryRepository.save(newInventory);

                console.log(`[완제품재고생성] ${productCode}(${productName}): ${quantity}개 생성`);

                // 재고 조정 로그 기록 (LOT번호 사용)
                try {
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        productionLotCode, // LOT번호 사용
                        productName,
                        'PRODUCTION',
                        0,
                        quantity,
                        quantity,
                        `생산 완료 - 완제품 입고 (신규 재고 생성, LOT: ${productionLotCode})`,
                        'system'
                    );
                } catch (logError) {
                    console.error(`[재고로그기록실패] ${productCode}: ${logError.message}`);
                }

            }

            // LOT 재고 생성 (기존 재고 있든 없든 항상 실행)
            console.log(`[LOT재고생성호출] ${productCode}(${productName}): 수량=${quantity}개`);
            await this.updateLotInventory(productCode, productName, quantity, 'system', dto.warehouseCode, dto.warehouseName, dto.warehouseZone);
            
        } catch (error) {
            console.error(`[완제품재고처리실패] ${productCode}: ${error.message}`);
            throw error;
        }
    }

    /**
     * BOM 재료 재고를 확인하고 차감합니다.
     * @param productCode 제품 코드
     * @param quantity 생산 수량
     */
    private async checkAndUpdateBomInventory(productCode: string, quantity: number): Promise<void> {
        
        // BOM 정보 조회 (자재 정보)
        const bomItems = await this.bomInfoRepository.find({
            where: { parentProductCode: productCode }
        });


        // 1단계: 재고 부족 확인
        const insufficientItems: string[] = [];
        
        for (const bomItem of bomItems) {
            const inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: bomItem.childProductCode }
            });

            if (!inventory) {
                insufficientItems.push(`${bomItem.childProductCode} (재고 정보 없음)`);
                continue;
            }

            const currentStock = inventory.inventoryQuantity;
            const requiredQuantity = bomItem.quantity * quantity;
            
            if (currentStock < requiredQuantity) {
                insufficientItems.push(`${bomItem.childProductCode} (현재: ${currentStock}, 필요: ${requiredQuantity})`);
            }
        }

        // 재고 부족 시 생산 종료 불가
        if (insufficientItems.length > 0) {
            const errorMessage = `재고 부족으로 생산을 완료할 수 없습니다:\n${insufficientItems.join('\n')}\n\n재고를 보충한 후 다시 시도해주세요.`;
            console.error(`[생산종료실패] 재고부족 - 제품: ${productCode}, 생산수량: ${quantity}개`);
            console.error(`[부족재고목록] ${insufficientItems.join(', ')}`);
            throw new NotFoundException(errorMessage);
        }

        // 2단계: LOT 재고 우선 차감 시도
        for (const bomItem of bomItems) {
            const requiredQuantity = bomItem.quantity * quantity;
            console.log(`[BOM재료차감시작] ${bomItem.childProductCode}: 필요수량=${requiredQuantity}개`);
            
            // LOT 재고에서 먼저 차감 시도
            const lotDeductedQuantity = await this.deductFromLotInventory(
                bomItem.childProductCode, 
                requiredQuantity
            );
            
            console.log(`[LOT차감결과] ${bomItem.childProductCode}: LOT에서 ${lotDeductedQuantity}개 차감`);
            
            // LOT에서 차감되지 않은 수량이 있으면 일반 재고에서 차감
            const remainingQuantity = requiredQuantity - lotDeductedQuantity;
            if (remainingQuantity > 0) {
                console.log(`[일반재고차감] ${bomItem.childProductCode}: ${remainingQuantity}개 차감`);
                await this.deductFromGeneralInventory(bomItem.childProductCode, remainingQuantity, productCode, quantity, bomItem.quantity);
            }
        }
    }

    /**
     * LOT 번호를 생성합니다.
     * 형식: 2 + 품목코드 + 날짜(YYYYMMDD) + 001
     * @param productCode 제품 코드
     * @returns 생성된 LOT 번호
     */
    private async generateLotNumber(productCode: string): Promise<string> {
        try {
            const today = new Date();
            const dateString = today.getFullYear().toString() + 
                              (today.getMonth() + 1).toString().padStart(2, '0') + 
                              today.getDate().toString().padStart(2, '0');
            
            // 오늘 날짜로 생성된 LOT 번호 중 가장 높은 번호 조회
            const prefix = `2${productCode}${dateString}`;
            console.log(`[LOT번호생성] prefix: ${prefix}`);
            
            const existingLots = await this.inventoryLotRepository
                .createQueryBuilder('lot')
                .where('lot.lotCode LIKE :prefix', { prefix: `${prefix}%` })
                .orderBy('lot.lotCode', 'DESC')
                .getMany();
            
            console.log(`[LOT번호생성] 기존 LOT 개수: ${existingLots.length}`);
            
            let sequence = 1;
            if (existingLots.length > 0) {
                // 기존 LOT 번호에서 시퀀스 번호 추출하여 +1
                const lastLotCode = existingLots[0].lotCode;
                const lastSequence = parseInt(lastLotCode.substring(lastLotCode.length - 3));
                sequence = lastSequence + 1;
                console.log(`[LOT번호생성] 마지막 LOT: ${lastLotCode}, 다음 시퀀스: ${sequence}`);
            }
            
            const finalLotNumber = `${prefix}${sequence.toString().padStart(3, '0')}`;
            console.log(`[LOT번호생성완료] 최종 LOT 번호: ${finalLotNumber}`);
            
            return finalLotNumber;
        } catch (error) {
            console.error(`[LOT번호생성실패] ${productCode}: ${error.message}`);
            throw error;
        }
    }

    /**
     * LOT 재고를 증가시킵니다.
     * @param productCode 제품 코드
     * @param productName 제품명
     * @param quantity 생산 수량
     * @param username 사용자명
     */
    private async updateLotInventory(productCode: string, productName: string, quantity: number, username: string, warehouseCode?: string, warehouseName?: string, warehouseZone?: string): Promise<void> {
        try {
            console.log(`[LOT재고생성시작] ${productCode}(${productName}): 수량=${quantity}개`);
            
            // 창고 정보 결정 (DTO에서 받은 정보 우선, 없으면 기본 창고 사용)
            let warehouseInfo;
            if (warehouseCode) {
                // DTO에서 창고 정보를 받은 경우
                warehouseInfo = {
                    warehouseCode: warehouseCode,
                    warehouseName: warehouseName || await this.getWarehouseNameByCode(warehouseCode),
                    warehouseZone: warehouseZone || null
                };
                console.log(`[DTO창고정보사용] ${JSON.stringify(warehouseInfo)}`);
            } else {
                // 기본 창고 정보 조회
                warehouseInfo = await this.getDefaultWarehouse();
                console.log(`[기본창고조회] ${JSON.stringify(warehouseInfo)}`);
            }
            
            // LOT 번호 생성
            const lotNumber = await this.generateLotNumber(productCode);
            console.log(`[LOT번호생성완료] ${productCode}: LOT번호=${lotNumber}`);
            
            // 먼저 동일한 LOT 코드가 이미 존재하는지 확인
            const existingLot = await this.inventoryLotRepository.findOne({
                where: { lotCode: lotNumber }
            });
            
            if (existingLot) {
                console.log(`[LOT재고업데이트] 기존 LOT 발견: ${lotNumber}, 수량 증가`);
                existingLot.lotQuantity += quantity;
                existingLot.updatedBy = username;
                await this.inventoryLotRepository.save(existingLot);
                console.log(`[LOT재고업데이트완료] LOT번호: ${existingLot.lotCode}, 총수량: ${existingLot.lotQuantity}`);
                return;
            }
            
            // 새로운 LOT 재고 생성 (매번 새로운 LOT 번호로 생성)
            const newLotInventory = this.inventoryLotRepository.create({
                productCode: productCode,
                productName: productName,
                lotCode: lotNumber,
                lotQuantity: quantity,
                unit: 'EA',
                storageLocation: warehouseInfo.warehouseName + (warehouseInfo.warehouseZone ? `-${warehouseInfo.warehouseZone}` : ''),
                warehouseCode: warehouseInfo.warehouseCode,
                warehouseName: warehouseInfo.warehouseName,
                warehouseZone: warehouseInfo.warehouseZone || undefined,
                lotStatus: '정상',
                createdBy: username,
                updatedBy: username,
            });

            console.log(`[LOT재고객체생성완료] ${JSON.stringify({
                productCode: newLotInventory.productCode,
                productName: newLotInventory.productName,
                lotCode: newLotInventory.lotCode,
                lotQuantity: newLotInventory.lotQuantity,
                unit: newLotInventory.unit,
                storageLocation: newLotInventory.storageLocation,
                warehouseCode: newLotInventory.warehouseCode,
                warehouseName: newLotInventory.warehouseName,
                warehouseZone: newLotInventory.warehouseZone
            })}`);

            const savedLotInventory = await this.inventoryLotRepository.save(newLotInventory);
            console.log(`[LOT재고저장완료] ID: ${(savedLotInventory as any).id}, LOT번호: ${(savedLotInventory as any).lotCode}`);
            
        } catch (error) {
            console.error(`[LOT재고처리실패] ${productCode}: ${error.message}`);
            console.error(`[LOT재고처리실패] 스택: ${error.stack}`);
            throw error;
        }
    }

    /**
     * 기본 창고 정보를 조회합니다.
     * 메인창고를 우선으로 하고, 없으면 첫 번째 창고를 반환합니다.
     */
    private async getDefaultWarehouse(): Promise<{warehouseCode: string, warehouseName: string, warehouseZone: string | null}> {
        try {
            // 메인창고 또는 첫 번째 창고 조회
            let warehouse = await this.warehouseRepository.findOne({
                where: { warehouseName: '메인창고' }
            });

            // 메인창고가 없으면 첫 번째 창고 조회
            if (!warehouse) {
                warehouse = await this.warehouseRepository.findOne({
                    order: { id: 'ASC' }
                });
            }

            if (warehouse) {
                console.log(`[기본창고조회] 실제 창고 사용: ${warehouse.warehouseName}`);
                return {
                    warehouseCode: warehouse.warehouseCode,
                    warehouseName: warehouse.warehouseName,
                    warehouseZone: warehouse.warehouseZone
                };
            } else {
                // 창고가 없는 경우 기본값 사용
                console.log(`[기본창고조회] 창고가 없어 기본값 사용`);
                return {
                    warehouseCode: 'WHS001',
                    warehouseName: '메인창고',
                    warehouseZone: null
                };
            }
        } catch (error) {
            console.error(`[기본창고조회실패] ${error.message}`);
            // 실패 시 기본값 반환
            return {
                warehouseCode: 'WHS001',
                warehouseName: '메인창고',
                warehouseZone: null
            };
        }
    }

    /**
     * 창고 코드로 창고명을 조회합니다.
     */
    private async getWarehouseNameByCode(warehouseCode: string): Promise<string> {
        try {
            const warehouse = await this.warehouseRepository.findOne({
                where: { warehouseCode: warehouseCode }
            });
            
            if (warehouse) {
                return warehouse.warehouseName;
            } else {
                // 창고 코드가 없으면 코드를 그대로 사용
                console.log(`[창고코드조회실패] ${warehouseCode} - 코드를 그대로 사용`);
                return warehouseCode;
            }
        } catch (error) {
            console.error(`[창고코드조회실패] ${warehouseCode}: ${error.message}`);
            return warehouseCode;
        }
    }

    /**
     * LOT 재고에서 FIFO 방식으로 차감합니다.
     * 가장 일찍 들어온 LOT부터 차감합니다.
     */
    private async deductFromLotInventory(productCode: string, requiredQuantity: number): Promise<number> {
        try {
            console.log(`[LOT차감시작] ${productCode}: 필요수량=${requiredQuantity}개`);
            
            // 해당 품목의 LOT 재고를 입고일 순으로 조회 (FIFO)
            const lotInventories = await this.inventoryLotRepository.find({
                where: { productCode: productCode },
                order: { createdAt: 'ASC' } // 가장 오래된 것부터
            });

            if (lotInventories.length === 0) {
                console.log(`[LOT차감] ${productCode}: LOT 재고 없음`);
                return 0;
            }

            let totalDeducted = 0;
            let remainingRequired = requiredQuantity;

            for (const lot of lotInventories) {
                if (remainingRequired <= 0) break;

                if (lot.lotQuantity > 0) {
                    const deductQuantity = Math.min(lot.lotQuantity, remainingRequired);
                    const newLotQuantity = lot.lotQuantity - deductQuantity;
                    
                    // LOT 재고 업데이트
                    lot.lotQuantity = newLotQuantity;
                    lot.updatedBy = 'system';
                    lot.updatedAt = new Date();
                    
                    await this.inventoryLotRepository.save(lot);
                    
                    totalDeducted += deductQuantity;
                    remainingRequired -= deductQuantity;
                    
                    console.log(`[LOT차감완료] ${productCode} - LOT: ${lot.lotCode}, 차감: ${deductQuantity}개, 잔여: ${newLotQuantity}개`);
                    
                    // LOT 재고 조정 로그 기록
                    try {
                        await this.inventoryAdjustmentLogService.logAdjustment(
                            lot.lotCode, // inventory_code에는 LOT번호 사용
                            lot.productName,
                            'PRODUCTION',
                            lot.lotQuantity + deductQuantity,
                            lot.lotQuantity,
                            -deductQuantity,
                            `생산 완료 - LOT 차감 (LOT: ${lot.lotCode})`,
                            'system'
                        );
                    } catch (logError) {
                        console.error(`[LOT재고로그기록실패] ${lot.lotCode}: ${logError.message}`);
                    }
                }
            }

            console.log(`[LOT차감완료] ${productCode}: 총 ${totalDeducted}개 차감`);
            return totalDeducted;
            
        } catch (error) {
            console.error(`[LOT차감실패] ${productCode}: ${error.message}`);
            return 0;
        }
    }

    /**
     * 일반 재고에서 차감합니다.
     */
    private async deductFromGeneralInventory(
        productCode: string, 
        quantity: number, 
        productionProductCode: string, 
        productionQuantity: number, 
        bomQuantity: number
    ): Promise<void> {
        try {
            const inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: productCode }
            });

            if (inventory) {
                const currentStock = inventory.inventoryQuantity;
                const newStock = currentStock - quantity;
              
                // 재고 업데이트
                await this.inventoryRepository.update(
                    { inventoryCode: productCode },
                    { 
                        inventoryQuantity: newStock,
                        updatedBy: 'system',
                        updatedAt: new Date()
                    }
                );

                // 재고 조정 로그 기록
                try {
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        productCode,
                        inventory.inventoryName,
                        'CHANGE',
                        currentStock,
                        newStock,
                        -quantity, // 음수로 출고 표시
                        `생산 완료 - 제품: ${productionProductCode}, 생산수량: ${productionQuantity}개, BOM 수량: ${bomQuantity}개`,
                        'system'
                    );
                } catch (logError) {
                    console.error(`[재고로그기록실패] ${productCode}: ${logError.message}`);
                }
            }
        } catch (error) {
            console.error(`[일반재고차감실패] ${productCode}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 생산용 LOT 번호를 생성합니다.
     * 형식: 2 + 품목코드 + 날짜(YYYYMMDD) + 001
     * @param productCode 제품 코드
     * @returns 생성된 LOT 번호
     */
    private async generateProductionLotNumber(productCode: string): Promise<string> {
        try {
            const today = new Date();
            const dateString = today.getFullYear().toString() + 
                              (today.getMonth() + 1).toString().padStart(2, '0') + 
                              today.getDate().toString().padStart(2, '0');
            
            // 오늘 날짜로 생성된 생산 LOT 번호 중 가장 높은 번호 조회
            const prefix = `2${productCode}${dateString}`;
            console.log(`[생산LOT번호생성] prefix: ${prefix}`);
            
            const existingLots = await this.inventoryLotRepository
                .createQueryBuilder('lot')
                .where('lot.lotCode LIKE :prefix', { prefix: `${prefix}%` })
                .orderBy('lot.lotCode', 'DESC')
                .getMany();
            
            console.log(`[생산LOT번호생성] 기존 LOT 개수: ${existingLots.length}`);
            
            let sequence = 1;
            if (existingLots.length > 0) {
                // 기존 LOT 번호에서 시퀀스 번호 추출하여 +1
                const lastLotCode = existingLots[0].lotCode;
                const lastSequence = parseInt(lastLotCode.substring(lastLotCode.length - 3));
                sequence = lastSequence + 1;
                console.log(`[생산LOT번호생성] 마지막 LOT: ${lastLotCode}, 다음 시퀀스: ${sequence}`);
            }
            
            const finalLotNumber = `${prefix}${sequence.toString().padStart(3, '0')}`;
            console.log(`[생산LOT번호생성완료] 최종 LOT 번호: ${finalLotNumber}`);
            
            return finalLotNumber;
        } catch (error) {
            console.error(`[생산LOT번호생성실패] ${productCode}: ${error.message}`);
            throw error;
        }
    }
}