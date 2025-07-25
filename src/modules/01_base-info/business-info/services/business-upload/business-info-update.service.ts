import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../../entities/business-info.entity';
import { CreateBusinessInfoDto } from '../../dto/create-business-info.dto';
import { BusinessUtils, ValidationError } from '../../utils/business.utils';

@Injectable()
export class BusinessInfoUpdateService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  async updateBusinessInfo(
    businessNumber: string,
    createBusinessInfoDto: CreateBusinessInfoDto,
    updatedBy: string,
  ): Promise<BusinessInfo> {
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    // 입력 데이터 검증
    this.validateUpdateData(createBusinessInfoDto);

    // 사업자번호 중복 검증 (사업자번호가 변경되는 경우)
    if (
      createBusinessInfoDto.businessNumber &&
      createBusinessInfoDto.businessNumber !== businessNumber
    ) {
      await this.validateBusinessNumberUniqueness(createBusinessInfoDto.businessNumber);
    }

    return this.saveUpdatedBusinessInfo(existingBusinessInfo, createBusinessInfoDto, updatedBy);
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

  private validateUpdateData(dto: CreateBusinessInfoDto): void {
    try {
      this.validateNumberFields(dto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

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

  private async saveUpdatedBusinessInfo(
    existingBusinessInfo: BusinessInfo,
    updateData: CreateBusinessInfoDto,
    updatedBy: string,
  ): Promise<BusinessInfo> {
    const updatedBusinessInfo = {
      ...existingBusinessInfo,
      ...updateData,
      updatedBy,
      updatedAt: new Date(),
    };

    return this.businessInfoRepository.save(updatedBusinessInfo);
  }

  async updateBusinessInfoField(
    businessNumber: string,
    field: keyof CreateBusinessInfoDto,
    value: string,
  ): Promise<BusinessInfo> {
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    this.validateSingleField(field, value);

    const updateData = { [field]: value, updatedAt: new Date() };

    return this.businessInfoRepository.save({
      ...existingBusinessInfo,
      ...updateData,
    });
  }

  private validateSingleField(field: keyof CreateBusinessInfoDto, value: string): void {
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
