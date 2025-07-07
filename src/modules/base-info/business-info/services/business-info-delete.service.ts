import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';

@Injectable()
export class BusinessInfoDeleteService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  async deleteBusinessInfo(businessNumber: string): Promise<void> {
    // 1. 사업장 정보 존재 여부 확인
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    // 2. 소프트 삭제 (isDeleted = true, deletedAt 설정)
    await this.softDeleteBusinessInfo(existingBusinessInfo);
  }

  private async findBusinessInfoByNumber(businessNumber: string): Promise<BusinessInfo> {
    const businessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber },
    });

    if (!businessInfo) {
      throw new NotFoundException('사업장 정보를 찾을 수 없습니다.');
    }

    return businessInfo;
  }

  private async softDeleteBusinessInfo(businessInfo: BusinessInfo): Promise<void> {
    businessInfo.isDeleted = true;
    businessInfo.deletedAt = new Date();
    businessInfo.updatedAt = new Date();

    await this.businessInfoRepository.save(businessInfo);
  }
}
