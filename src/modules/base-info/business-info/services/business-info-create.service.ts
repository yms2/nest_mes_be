import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';
import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { BUSINESS_CONSTANTS } from '../constants/business.constants';
import { BusinessUtils, ValidationError } from '../utils/business.utils';

@Injectable()
export class BusinessInfoCreateService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  async createBusinessInfo(createBusinessInfoDto: CreateBusinessInfoDto): Promise<BusinessInfo> {
    // 1. 입력 데이터 검증
    this.validateInputData(createBusinessInfoDto);

    // 2. 사업자 번호 중복 체크
    await this.checkBusinessNumberDuplicate(createBusinessInfoDto.businessNumber);

    // 3. 사업장 코드 생성
    const newBusinessCode = await this.generateBusinessCode();

    // 4. 사업장 정보 생성 및 저장
    return this.saveBusinessInfo(createBusinessInfoDto, newBusinessCode);
  }

  private validateInputData(dto: CreateBusinessInfoDto): void {
    try {
      // 필수값 체크
      BusinessUtils.validateRequiredFields(dto);

      // 사업자 번호 형식 체크
      if (!BusinessUtils.validateBusinessNumber(dto.businessNumber)) {
        throw new BadRequestException(BUSINESS_CONSTANTS.ERROR_MESSAGES.BUSINESS_NUMBER_FORMAT);
      }

      // 숫자 필드 검증
      this.validateNumberFields(dto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
  // 숫자만 허용하는 필드들 검증
  private validateNumberFields(dto: CreateBusinessInfoDto): void {
    try {
      BusinessUtils.validateNumberField(dto.businessTel, '사업장 전화번호');
      BusinessUtils.validateNumberField(dto.businessMobile, '사업장 휴대폰번호');
      BusinessUtils.validateNumberField(dto.businessFax, '사업장 팩스번호');
      BusinessUtils.validateNumberField(dto.corporateRegistrationNumber, '법인등록번호');
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
  // 사업자 번호 중복 체크
  private async checkBusinessNumberDuplicate(businessNumber: string): Promise<void> {
    const existingBusinessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber },
    });
    if (existingBusinessInfo) {
      throw new BadRequestException(BUSINESS_CONSTANTS.ERROR_MESSAGES.BUSINESS_NUMBER_DUPLICATE);
    }
  }
  // 사업장 코드 생성
  private async generateBusinessCode(): Promise<string> {
    const lastBusinessCode = await this.businessInfoRepository.findOne({
      where: { isDeleted: false },
      order: { businessCode: 'DESC' },
    });

    return BusinessUtils.generateNextBusinessCode(lastBusinessCode?.businessCode || null);
  }

  private async saveBusinessInfo(
    dto: CreateBusinessInfoDto,
    businessCode: string,
  ): Promise<BusinessInfo> {
    const newBusinessInfo = this.businessInfoRepository.create({
      businessCode,
      ...dto,
    });

    return this.businessInfoRepository.save(newBusinessInfo);
  }
}
