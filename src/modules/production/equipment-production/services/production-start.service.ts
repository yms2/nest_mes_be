import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Production } from '../entities/production.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { BomProcess } from '@/modules/base-info/bom-info/entities/bom-process.entity';
import { StartProductionDto } from '../dto/start-production.dto';

@Injectable()
export class ProductionStartService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(BomProcess)
    private readonly bomProcessRepository: Repository<BomProcess>,
  ) {}

  /**
   * 생산을 시작합니다.
   * @param dto 생산 시작 DTO
   * @param username 사용자명
   * @returns 생성된 생산 정보
   */
  async startProduction(
    dto: StartProductionDto,
    username: string,
  ): Promise<Production> {
    // 1. 생산 지시 조회
    const productionInstruction = await this.productionInstructionRepository.findOne({
      where: { productionInstructionCode: dto.productionInstructionCode },
    });

    if (!productionInstruction) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${dto.productionInstructionCode}`);
    }

    // 2. 생산 코드 생성
    const productionCode = await this.generateProductionCode();

    // 3. 생산 계획에서 제품 코드 조회
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { productionPlanCode: productionInstruction.productionPlanCode },
    });

    if (!productionPlan) {
      throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${productionInstruction.productionPlanCode}`);
    }

    // 4. BOM 공정 조회 (제품 코드 기준으로 순서대로)
    let bomProcesses = await this.bomProcessRepository.find({
      where: { productCode: productionPlan.productCode },
      order: { processOrder: 'ASC' },
    });

    // 4. 생산 불량 코드 생성
    const productionDefectCode = await this.generateProductionDefectCode();

    // BOM 공정이 없으면 기본 공정 생성
    if (bomProcesses.length === 0) {
      console.warn(`제품 ${productionPlan.productCode}에 대한 BOM 공정이 없습니다. 기본공정을 생성합니다.`);
      
      // 기본 공정 생성
      const defaultProcess = this.bomProcessRepository.create({
        productCode: productionPlan.productCode,
        processOrder: 1,
        processCode: 'PRC_DEFAULT',
        processName: '기본공정',
      });
      
      await this.bomProcessRepository.save(defaultProcess);
      bomProcesses = [defaultProcess];
    }

    // 5. 생산 등록 (첫 번째 공정으로 시작)
    const production = this.productionRepository.create({
      productionCode,
      productionInstructionCode: dto.productionInstructionCode,
      productCode: productionPlan.productCode, // 생산 계획에서 제품 코드
      productName: productionPlan.productName, // 생산 계획에서 제품명
      productType: productionPlan.productType, // 생산 계획에서 제품 구분
      productSize: productionPlan.productSize, // 생산 계획에서 제품 규격
      productionInstructionQuantity: productionInstruction.productionInstructionQuantity,
      productionDefectCode: productionDefectCode, // 생산 불량 코드
      productionDefectQuantity: 0, // 0으로 초기화
      productionCompletionQuantity: 0, // 0으로 초기화
      productionProcessCode: bomProcesses[0].processCode, // 첫 번째 공정
      productionProcessName: bomProcesses[0].processName, // 첫 번째 공정명
      productionStatus: '진행중', // 생산 시작
      employeeCode: '', // 생산 시작 시 사원 정보 없음
      employeeName: '', // 생산 시작 시 사원 정보 없음
      productionStartDate: new Date(), // 생산 시작일을 오늘로 설정
      productionCompletionDate: undefined, // 생산 종료 전까지는 undefined
      remark: '생산 시작',
      createdBy: username,
      updatedBy: username,
    });

    return await this.productionRepository.save(production);
  }

  /**
   * 생산 코드를 생성합니다.
   * @returns 생성된 생산 코드
   */
  private async generateProductionCode(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // 오늘 날짜로 시작하는 생산 코드 개수 조회
    const count = await this.productionRepository.count({
      where: {
        productionCode: Like(`PRO${today}%`)
      }
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `PRO${today}${sequence}`;
  }

  /**
   * 생산 지시의 BOM 공정 목록을 조회합니다.
   * @param productionInstructionCode 생산 지시 코드
   * @returns BOM 공정 목록
   */
  async getBomProcesses(productionInstructionCode: string): Promise<BomProcess[]> {
    // 1. 생산 지시 조회
    const productionInstruction = await this.productionInstructionRepository.findOne({
      where: { productionInstructionCode },
    });

    if (!productionInstruction) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${productionInstructionCode}`);
    }

    // 2. 생산 계획에서 제품 코드 조회
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { productionPlanCode: productionInstruction.productionPlanCode },
    });

    if (!productionPlan) {
      throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${productionInstruction.productionPlanCode}`);
    }

    // 3. BOM 공정 조회 (제품 코드 기준으로 순서대로)
    return await this.bomProcessRepository.find({
      where: { productCode: productionPlan.productCode },
      order: { processOrder: 'ASC' },
    });

  }
  // 4. 생산 불량 코드 생성 
  private async generateProductionDefectCode(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.productionRepository.count({
      where: { productionDefectCode: Like(`BD${today}%`) },
    });
    const sequence = (count + 1).toString().padStart(3, '0');
    return `BD${today}${sequence}`;
  }
}
