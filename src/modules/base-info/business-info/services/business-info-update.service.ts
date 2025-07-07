import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';
import { UpdateBusinessInfoDto } from '../dto/update-business-info.dto';
import { BusinessUtils, ValidationError } from '../utils/business.utils';

@Injectable()
export class BusinessInfoUpdateService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  async updateBusinessInfo(
    businessNumber: string,
    updateBusinessInfoDto: UpdateBusinessInfoDto,
  ): Promise<BusinessInfo> {
    // 1. 사업장 정보 존재 여부 확인
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    // 2. 입력 데이터 검증
    this.validateUpdateData(updateBusinessInfoDto);

    // 필수값 체크
    BusinessUtils.validateRequiredFields(updateBusinessInfoDto);

    // 3. 사업자번호 중복 검증 (사업자번호가 변경되는 경우)
    if (
      updateBusinessInfoDto.businessNumber &&
      updateBusinessInfoDto.businessNumber !== businessNumber
    ) {
      await this.validateBusinessNumberUniqueness(updateBusinessInfoDto.businessNumber);
    }

    // 4. 사업장 정보 업데이트
    return this.saveUpdatedBusinessInfo(existingBusinessInfo, updateBusinessInfoDto);
  }

  private async findBusinessInfoByNumber(businessNumber: string): Promise<BusinessInfo> {
    const businessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber, isDeleted: false },
    });

    if (!businessInfo) {
      throw new NotFoundException('사업장 정보를 찾을 수 없습니다.');
    }

    return businessInfo;
  }

  private async validateBusinessNumberUniqueness(businessNumber: string): Promise<void> {
    const existingBusinessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber, isDeleted: false },
    });

    if (existingBusinessInfo) {
      throw new BadRequestException('이미 등록된 사업자번호입니다.');
    }
  }

  private validateUpdateData(dto: UpdateBusinessInfoDto): void {
    try {
      // 숫자 필드 검증
      this.validateNumberFields(dto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private validateNumberFields(dto: UpdateBusinessInfoDto): void {
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

  private async saveUpdatedBusinessInfo(
    existingBusinessInfo: BusinessInfo,
    updateData: UpdateBusinessInfoDto,
  ): Promise<BusinessInfo> {
    // 업데이트할 필드만 선택적으로 업데이트
    const updatedBusinessInfo = {
      ...existingBusinessInfo,
      ...updateData,
      updatedAt: new Date(),
    };

    return this.businessInfoRepository.save(updatedBusinessInfo);
  }

  // 부분 업데이트를 위한 메서드 (특정 필드만 업데이트)
  async updateBusinessInfoField(
    businessNumber: string,
    field: keyof UpdateBusinessInfoDto,
    value: string,
  ): Promise<BusinessInfo> {
    // 1. 사업장 정보 존재 여부 확인
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    // 2. 필드별 검증
    this.validateSingleField(field, value);

    // 3. 특정 필드만 업데이트
    const updateData = { [field]: value, updatedAt: new Date() };

    return this.businessInfoRepository.save({
      ...existingBusinessInfo,
      ...updateData,
    });
  }

  private validateSingleField(field: keyof UpdateBusinessInfoDto, value: string): void {
    // 숫자 필드 검증
    const numberFields = [
      'businessTel',
      'businessMobile',
      'businessFax',
      'corporateRegistrationNumber',
    ];

    if (numberFields.includes(field) && value) {
      BusinessUtils.validateNumberField(value, this.getFieldDisplayName(field));
    }
  }

  private getFieldDisplayName(field: string): string {
    const fieldNames: Record<string, string> = {
      businessTel: '사업장 전화번호',
      businessMobile: '사업장 휴대폰번호',
      businessFax: '사업장 팩스번호',
      corporateRegistrationNumber: '법인등록번호',
    };

    return fieldNames[field] || field;
  }
}
