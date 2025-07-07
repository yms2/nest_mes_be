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

  async hardDeleteBusinessInfo(businessNumber: string): Promise<void> {
    // 1. 사업장 정보 존재 여부 확인
    const existingBusinessInfo = await this.findBusinessInfoByNumber(businessNumber);

    // 2. 하드 삭제 (실제 DB에서 삭제)
    await this.businessInfoRepository.remove(existingBusinessInfo);
  }

  async restoreBusinessInfo(businessNumber: string): Promise<BusinessInfo> {
    // 1. 삭제된 사업장 정보 찾기
    const deletedBusinessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber, isDeleted: true },
    });

    if (!deletedBusinessInfo) {
      throw new NotFoundException('삭제된 사업장 정보를 찾을 수 없습니다.');
    }

    // 2. 복원 (isDeleted = false, deletedAt = null)
    deletedBusinessInfo.isDeleted = false;
    deletedBusinessInfo.deletedAt = null;
    deletedBusinessInfo.updatedAt = new Date();

    return this.businessInfoRepository.save(deletedBusinessInfo);
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
