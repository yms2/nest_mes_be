import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { EstimateDetail } from '../entities/estimate-detail.entity';
import { CreateEstimateDto } from '../dto/estimatemanagement-create.dto';
import { CreateEstimateDetailDto } from '../dto/estimate-detail.dto';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class EstimateManagementCreateService {
  constructor(
    @InjectRepository(EstimateManagement)
    private readonly estimateRepository: Repository<EstimateManagement>,
    @InjectRepository(EstimateDetail)
    private readonly estimateDetailRepository: Repository<EstimateDetail>,
    private readonly logService: logService,
  ) {}

  /**
   * 견적 정보를 생성합니다.
   * @param createEstimateDto 견적 생성 데이터
   * @param username 사용자명
   * @returns 생성된 견적 정보
   */
  async createEstimate(createEstimateDto: CreateEstimateDto, username: string): Promise<EstimateManagement> {
    try {
      // 기본 검증
      await this.validateEstimateData(createEstimateDto);

      // 프로젝트명 중복 체크 및 버전 자동 증가
      await this.checkProjectDuplicateAndUpdateVersion(createEstimateDto);

      // 중복 견적 검증
      await this.checkDuplicateEstimate(createEstimateDto);

      // 견적 코드 자동 생성 (필요시)
      if (!createEstimateDto.estimateCode) {
        createEstimateDto.estimateCode = await this.generateEstimateCode();
      }

      // 견적 생성
      const estimate = this.estimateRepository.create(createEstimateDto);
      const savedEstimate = await this.estimateRepository.save(estimate);

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 등록',
        action: 'CREATE_SUCCESS',
        username,
        targetId: savedEstimate.id.toString(),
        targetName: `${savedEstimate.estimateCode} - ${savedEstimate.customerName}`,
        details: `견적 등록 성공: ${savedEstimate.estimateCode} (고객: ${savedEstimate.customerName}, 프로젝트: ${savedEstimate.projectName})`,
      });

      return savedEstimate;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적관리 등록',
        action: 'CREATE_FAIL',
        username,
        targetId: '',
        targetName: `${createEstimateDto.estimateCode || 'Unknown'} - ${createEstimateDto.customerName}`,
        details: `견적 등록 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 견적과 세부품목을 함께 생성합니다.
   * @param createEstimateDto 견적 생성 데이터
   * @param estimateDetails 세부품목 데이터 배열
   * @param username 사용자명
   * @returns 생성된 견적 정보 (세부품목 포함)
   */
  async createEstimateWithDetails(
    createEstimateDto: CreateEstimateDto, 
    estimateDetails: CreateEstimateDetailDto[], 
    username: string
  ): Promise<EstimateManagement> {
    try {
      // 견적 생성
      const savedEstimate = await this.createEstimate(createEstimateDto, username);

      // 세부품목 등록
      if (estimateDetails && estimateDetails.length > 0) {
        await this.createEstimateDetails(savedEstimate.id, estimateDetails, username);
      }

      // 세부품목을 포함한 견적 정보 조회
      const estimateWithDetails = await this.estimateRepository.findOne({
        where: { id: savedEstimate.id },
        relations: ['estimateDetails'],
      });

      return estimateWithDetails || savedEstimate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 세부품목을 등록합니다.
   * @param estimateId 견적 ID
   * @param estimateDetails 세부품목 데이터 배열
   * @param username 사용자명
   * @returns 생성된 세부품목 배열
   */
  async createEstimateDetails(
    estimateId: number, 
    estimateDetails: CreateEstimateDetailDto[], 
    username: string
  ): Promise<EstimateDetail[]> {
    try {
      const savedDetails: EstimateDetail[] = [];

      for (const detailDto of estimateDetails) {
        // 견적 ID 설정
        detailDto.estimateId = estimateId;

        // 세부품목 코드 자동 생성 (필요시)
        if (!detailDto.detailCode) {
          detailDto.detailCode = await this.generateDetailCode(estimateId);
        }

        // 세부품목 검증
        await this.validateEstimateDetailData(detailDto);

        // 세부품목 생성
        const detail = this.estimateDetailRepository.create(detailDto);
        const savedDetail = await this.estimateDetailRepository.save(detail);
        savedDetails.push(savedDetail);
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적 세부품목 등록',
        action: 'CREATE_SUCCESS',
        username,
        targetId: estimateId.toString(),
        targetName: `견적 ID: ${estimateId}`,
        details: `${savedDetails.length}개의 세부품목 등록 성공`,
      });

      return savedDetails;
    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '견적 세부품목 등록',
        action: 'CREATE_FAIL',
        username,
        targetId: estimateId.toString(),
        targetName: `견적 ID: ${estimateId}`,
        details: `세부품목 등록 실패: ${error.message}`,
      }).catch(() => {});

      throw error;
    }
  }

  /**
   * 견적 데이터의 기본 유효성을 검증합니다.
   * @param createEstimateDto 견적 생성 데이터
   */
  private async validateEstimateData(createEstimateDto: CreateEstimateDto): Promise<void> {
    const {
      estimateDate,
      estimateVersion,
      customerCode,
      customerName,
      projectName,
      productCode,
      productName,
      productQuantity,
      estimateStatus,
      estimatePrice,
      employeeCode,
      employeeName,
    } = createEstimateDto;

    // 필수 필드 검증 (projectCode는 자동 생성되므로 제외)
    if (!estimateDate || !estimateVersion || !customerCode || !customerName || 
        !projectName || !productCode || !productName || 
        !productQuantity || !estimateStatus || !estimatePrice || 
        !employeeCode || !employeeName) {
      throw new BadRequestException('필수 필드가 누락되었습니다.');
    }

    // 수량 검증
    if (productQuantity <= 0) {
      throw new BadRequestException('제품 수량은 0보다 커야 합니다.');
    }

    // 견적 가격 검증
    if (estimatePrice < 0) {
      throw new BadRequestException('견적 가격은 0 이상이어야 합니다.');
    }
  }

    /**
   * 프로젝트명 중복 체크 및 버전 자동 증가를 처리합니다.
   * @param createEstimateDto 견적 생성 데이터
   */
  private async checkProjectDuplicateAndUpdateVersion(createEstimateDto: CreateEstimateDto): Promise<void> {
    const { projectName, customerCode } = createEstimateDto;

    // 같은 고객의 같은 프로젝트명이 있는지 확인
    const existingProject = await this.estimateRepository.findOne({
      where: { 
        projectName,
        customerCode 
      },
      order: { estimateVersion: 'DESC' }
    });

    if (existingProject) {
      // 기존 버전보다 1 증가
      const newVersion = existingProject.estimateVersion + 1;
      createEstimateDto.estimateVersion = newVersion;
      
      // 기존 프로젝트 코드 사용
      createEstimateDto.projectCode = existingProject.projectCode;
      
      // 로그 기록 (버전 증가 정보)
      await this.logService.createDetailedLog({
        moduleName: '견적관리 등록',
        action: 'VERSION_INCREMENT',
        username: 'SYSTEM',
        targetId: existingProject.id.toString(),
        targetName: `${projectName} - ${customerCode}`,
        details: `프로젝트 "${projectName}" (고객: ${customerCode})의 버전이 ${existingProject.estimateVersion}에서 ${newVersion}으로 자동 증가되었습니다.`,
      });
    } else {
      // 새로운 프로젝트인 경우 프로젝트 코드 자동 생성
      createEstimateDto.projectCode = await this.generateProjectCode();
    }
  }

  /**
   * 중복 견적이 있는지 검증합니다.
   * @param createEstimateDto 견적 생성 데이터
   */
  private async checkDuplicateEstimate(createEstimateDto: CreateEstimateDto): Promise<void> {
    const { estimateCode } = createEstimateDto;

    if (estimateCode) {
      const existingEstimate = await this.estimateRepository.findOne({
        where: { estimateCode },
      });

      if (existingEstimate) {
        throw new ConflictException(
          `이미 존재하는 견적 코드입니다: ${estimateCode}`,
        );
      }
    }
  }

  /**
   * 프로젝트 코드를 자동 생성합니다.
   * @returns 생성된 프로젝트 코드
   */
  private async generateProjectCode(): Promise<string> {
    try {
      // 전체 프로젝트 코드 중 가장 큰 시퀀스 번호 찾기
      const lastProject = await this.estimateRepository
        .createQueryBuilder('estimate')
        .where('estimate.projectCode LIKE :pattern', { 
          pattern: 'PROJ%' 
        })
        .orderBy('estimate.projectCode', 'DESC')
        .getOne();

      let sequence = 1;
      if (lastProject && lastProject.projectCode) {
        // 기존 코드에서 시퀀스 번호 추출 (PROJ001 -> 1, PROJ002 -> 2)
        const lastSequence = parseInt(lastProject.projectCode.slice(4)); // 'PROJ' 제거
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      return `PROJ${String(sequence).padStart(3, '0')}`;
    } catch (error) {
      // 오류 발생 시 기본 프로젝트 코드 반환
      console.error('프로젝트 코드 생성 중 오류 발생:', error);
      return 'PROJ001';
    }
  }

  /**
   * 견적 코드를 자동 생성합니다.
   * @returns 생성된 견적 코드
   */
  private async generateEstimateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // 오늘 날짜의 견적 코드 중 가장 큰 시퀀스 번호 찾기
    const todayEstimates = await this.estimateRepository
      .createQueryBuilder('estimate')
      .where('estimate.estimateCode LIKE :pattern', { 
        pattern: `EST${year}${month}${day}%` 
      })
      .orderBy('estimate.estimateCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (todayEstimates && todayEstimates.estimateCode) {
      // 기존 코드에서 시퀀스 번호 추출
      const lastSequence = parseInt(todayEstimates.estimateCode.slice(-3));
      sequence = lastSequence + 1;
    }

    return `EST${year}${month}${day}${String(sequence).padStart(3, '0')}`;
  }

  /**
   * 세부품목 데이터의 유효성을 검증합니다.
   * @param detailDto 세부품목 생성 데이터
   */
  private async validateEstimateDetailData(detailDto: CreateEstimateDetailDto): Promise<void> {
    const {
      estimateId,
      itemCode,
      itemName,
      unit,
      quantity,
      unitPrice,
      totalPrice,
    } = detailDto;

    // 필수 필드 검증
    if (!estimateId || !itemCode || !itemName || !unit || !quantity || !unitPrice || !totalPrice) {
      throw new BadRequestException('세부품목 필수 필드가 누락되었습니다.');
    }

    // 수량 검증
    if (quantity <= 0) {
      throw new BadRequestException('세부품목 수량은 0보다 커야 합니다.');
    }

    // 단가 검증
    if (unitPrice < 0) {
      throw new BadRequestException('세부품목 단가는 0 이상이어야 합니다.');
    }

    // 총 가격 검증
    if (totalPrice < 0) {
      throw new BadRequestException('세부품목 총 가격은 0 이상이어야 합니다.');
    }

    // 견적 존재 여부 확인
    const estimate = await this.estimateRepository.findOne({
      where: { id: estimateId },
    });

    if (!estimate) {
      throw new BadRequestException(`견적 ID ${estimateId}가 존재하지 않습니다.`);
    }
  }

  /**
   * 세부품목 코드를 자동 생성합니다.
   * @param estimateId 견적 ID
   * @returns 생성된 세부품목 코드
   */
  private async generateDetailCode(estimateId: number): Promise<string> {
    // 해당 견적의 세부품목 코드 중 가장 큰 시퀀스 번호 찾기
    const lastDetail = await this.estimateDetailRepository
      .createQueryBuilder('detail')
      .where('detail.estimateId = :estimateId', { estimateId })
      .orderBy('detail.detailCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastDetail && lastDetail.detailCode) {
      // 기존 코드에서 시퀀스 번호 추출
      const lastSequence = parseInt(lastDetail.detailCode.slice(-3));
      sequence = lastSequence + 1;
    }

    return `DET${estimateId}${String(sequence).padStart(3, '0')}`;
  }
}
