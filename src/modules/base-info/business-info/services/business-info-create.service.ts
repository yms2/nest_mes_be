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

  async createBusinessInfo(
    createBusinessInfoDto: CreateBusinessInfoDto,
    createdBy:string
  ): Promise<BusinessInfo> {
    await this.checkBusinessNumberDuplicate(createBusinessInfoDto.businessNumber);
    const newBusinessCode = await this.generateBusinessCode();

    // 4. 사업장 정보 생성 및 저장
    return this.saveBusinessInfo(createBusinessInfoDto, newBusinessCode, createdBy);
  }

  // 사업자 번호 중복 체크
  private async checkBusinessNumberDuplicate(businessNumber: string): Promise<void> {
    const existingBusinessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber },
    });
    if (existingBusinessInfo) {
      throw new BadRequestException(BUSINESS_CONSTANTS.ERROR.BUSINESS_NUMBER_DUPLICATE);
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
    createdBy: string,
  ): Promise<BusinessInfo> {
    const newBusinessInfo = this.businessInfoRepository.create({
      businessCode,
      ...dto,
      createdBy,
    });

    return this.businessInfoRepository.save(newBusinessInfo);
  }
}
