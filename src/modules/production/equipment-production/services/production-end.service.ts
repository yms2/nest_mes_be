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
            
            // 완제품 재고는 품질검사 완료 후 별도로 처리
            console.log(`[완제품재고] 품질검사 완료 후 재고 처리 필요: 제품=${production.productCode}, 수량=${actualProductionQuantity}개`);
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

        // 2단계: 재고 차감 실행 및 로그 기록
        
        for (const bomItem of bomItems) {
            const inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: bomItem.childProductCode }
            });

            if (inventory) {
                const currentStock = inventory.inventoryQuantity;
                const requiredQuantity = bomItem.quantity * quantity;
                const newStock = currentStock - requiredQuantity;
              
                // 재고 업데이트
                await this.inventoryRepository.update(
                    { inventoryCode: bomItem.childProductCode },
                    { 
                        inventoryQuantity: newStock,
                        updatedBy: 'system',
                        updatedAt: new Date()
                    }
                );

                // 재고 조정 로그 기록
                try {
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        bomItem.childProductCode,
                        inventory.inventoryName,
                        'CHANGE',
                        currentStock,
                        newStock,
                        -requiredQuantity, // 음수로 출고 표시
                        `생산 완료 - 제품: ${productCode}, 생산수량: ${quantity}개, BOM 수량: ${bomItem.quantity}개`,
                        'system'
                    );
                } catch (logError) {
                    console.error(`[재고로그기록실패] ${bomItem.childProductCode}: ${logError.message}`);
                }
            }
        }
    }

}